import { Metadata } from 'next'

interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  openGraph?: {
    title?: string
    description?: string
    images?: { url: string; width?: number; height?: number; alt?: string }[]
    type?: 'website' | 'article' | 'business.business'
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image'
    site?: string
    creator?: string
  }
  alternates?: {
    canonical?: string
  }
  other?: {
    [key: string]: string
  }
}

const defaultSEO: SEOConfig = {
  title: 'GunsmithLocal - Find Trusted Gunsmiths Near You',
  description: 'The premier directory for finding professional gunsmiths in your area. Connect with skilled firearms specialists for repairs, customization, and maintenance.',
  keywords: [
    'gunsmith',
    'gunsmith near me',
    'firearm repair',
    'gun repair',
    'firearms service',
    'gun customization',
    'cerakote',
    'FFL dealer',
    'gun shop',
    'firearms specialist',
    'gun maintenance',
    'gunsmithing services',
  ],
  openGraph: {
    type: 'website',
    title: 'GunsmithLocal - Find Trusted Gunsmiths Near You',
    description: 'The premier directory for finding professional gunsmiths in your area.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'GunsmithLocal - Professional Gunsmith Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@gunsmithlocal',
  },
}

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const title = config.title || defaultSEO.title
  const description = config.description || defaultSEO.description
  const keywords = config.keywords || defaultSEO.keywords
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gunsmithlocal.com'

  return {
    title,
    description,
    keywords: keywords?.join(', '),
    openGraph: {
      ...defaultSEO.openGraph,
      ...config.openGraph,
      title: config.openGraph?.title || title,
      description: config.openGraph?.description || description,
      url: siteUrl,
      siteName: 'GunsmithLocal',
      locale: 'en_US',
    },
    twitter: {
      ...defaultSEO.twitter,
      ...config.twitter,
      title: title || '',
      description: description || '',
    },
    alternates: config.alternates,
    other: config.other,
    metadataBase: new URL(siteUrl),
  }
}

export function generateListingMetadata(listing: {
  business_name: string
  description?: string
  city?: string
  state_province?: string
  category?: string
  tags?: string[]
  logo_url?: string
  cover_image_url?: string
  slug: string
}): Metadata {
  const title = `${listing.business_name} - Gunsmith in ${listing.city}, ${listing.state_province}`
  const description = listing.description || 
    `Professional gunsmithing services by ${listing.business_name} in ${listing.city}, ${listing.state_province}. ${listing.category || 'Gunsmith services'}.`

  const keywords = [
    listing.business_name,
    'gunsmith',
    `gunsmith ${listing.city}`,
    `gunsmith ${listing.state_province}`,
    listing.category || 'gunsmithing',
    ...(listing.tags || []),
  ].filter(Boolean)

  const images = []
  if (listing.cover_image_url) {
    images.push({
      url: listing.cover_image_url,
      width: 1200,
      height: 630,
      alt: `${listing.business_name} - Gunsmith Services`,
    })
  } else if (listing.logo_url) {
    images.push({
      url: listing.logo_url,
      width: 400,
      height: 400,
      alt: `${listing.business_name} Logo`,
    })
  }

  return generateMetadata({
    title,
    description,
    keywords,
    openGraph: {
      type: 'business.business',
      title,
      description,
      images: images.length > 0 ? images : undefined,
    },
    alternates: {
      canonical: `/listings/${listing.slug}`,
    },
  })
}

export function generateStructuredData(type: 'Organization' | 'LocalBusiness' | 'WebSite', data: any) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  return {
    __html: JSON.stringify({ ...baseData, ...data }),
  }
}
