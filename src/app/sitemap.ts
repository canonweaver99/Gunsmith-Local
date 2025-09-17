import { MetadataRoute } from 'next'

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

  // Option B: Best-effort dynamic listings block for Google Search Console
  // Safely create a Supabase client at runtime; fall back to static only on any error
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return staticPages
    }

    const sb = createClient(url, anon)
    const { data, error } = await sb
      .from('listings')
      .select('slug, updated_at')
      .eq('status', 'active')
      .limit(5000)

    if (error || !data) {
      return staticPages
    }

    const listingPages: MetadataRoute.Sitemap = data
      .filter((row: any) => row.slug)
      .map((row: any) => ({
        url: `${baseUrl}/listings/${row.slug}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))

    // Merge static + dynamic
    return [...staticPages, ...listingPages]
  } catch {
    // If anything goes wrong, return static sitemap so GSC can still fetch
    return staticPages
  }
}
