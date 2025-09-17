import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gunsmithlocal.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/listings`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/add-business`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Fetch all active listings (best-effort; do not fail the sitemap if unavailable)
  let listings: any[] = []
  try {
    const { data } = await supabase
      .from('listings')
      .select('slug, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
    listings = data || []
  } catch (_) {
    listings = []
  }

  // Generate listing pages
  const listingPages: MetadataRoute.Sitemap = listings?.map((listing) => ({
    url: `${baseUrl}/listings/${listing.slug}`,
    lastModified: new Date(listing.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  })) || []

  return [...staticPages, ...listingPages]
}
