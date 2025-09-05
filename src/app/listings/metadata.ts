import { Metadata } from 'next'
import { generateMetadata } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Find Gunsmiths Near You | GunsmithLocal Directory',
  description: 'Browse our comprehensive directory of professional gunsmiths. Find skilled firearms specialists for repairs, customization, Cerakoting, and more. Search by location, services, and ratings.',
  keywords: [
    'gunsmith directory',
    'find gunsmith',
    'local gunsmith',
    'gunsmith near me',
    'firearm repair services',
    'gun repair shop',
    'firearms specialist',
    'gunsmith services',
    'cerakote services',
    'FFL dealer',
    'gun customization',
  ],
  openGraph: {
    title: 'Find Professional Gunsmiths - GunsmithLocal Directory',
    description: 'Search our directory of verified gunsmiths. Compare services, read reviews, and connect with skilled firearms professionals in your area.',
  },
  alternates: {
    canonical: '/listings',
  },
})
