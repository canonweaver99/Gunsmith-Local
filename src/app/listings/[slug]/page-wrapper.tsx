import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import { generateListingMetadata, generateStructuredData } from '@/lib/seo'
import ListingDetailPage from './page'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!listing) {
    return {
      title: 'Listing Not Found | GunsmithLocal',
      description: 'The requested gunsmith listing could not be found.',
    }
  }

  return generateListingMetadata(listing)
}

export default async function Page({ params }: Props) {
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!listing) {
    return <ListingDetailPage params={params} />
  }

  const structuredData = generateStructuredData('LocalBusiness', {
    '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gunsmithlocal.com'}/listings/${listing.slug}`,
    name: listing.business_name,
    description: listing.description || listing.short_description,
    url: listing.website,
    telephone: listing.phone,
    email: listing.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.street_address,
      addressLocality: listing.city,
      addressRegion: listing.state_province,
      postalCode: listing.postal_code,
      addressCountry: listing.country || 'US',
    },
    geo: listing.latitude && listing.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: listing.latitude,
      longitude: listing.longitude,
    } : undefined,
    image: listing.cover_image_url || listing.logo_url,
    priceRange: '$$',
    openingHours: listing.business_hours ? Object.entries(listing.business_hours)
      .filter(([_, hours]: [string, any]) => !hours.closed)
      .map(([day, hours]: [string, any]) => `${day.slice(0, 2).toUpperCase()} ${hours.open}-${hours.close}`)
      : undefined,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={structuredData}
      />
      <ListingDetailPage params={params} />
    </>
  )
}
