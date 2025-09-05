import { Metadata } from 'next'
import { generateMetadata } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Gunsmith Map | Find Gunsmiths by Location - GunsmithLocal',
  description: 'Interactive map to find gunsmiths near you. View all gunsmith locations, get directions, and explore firearm services in your area.',
  keywords: [
    'gunsmith map',
    'gunsmith locations',
    'find gunsmith near me',
    'gunsmith directory map',
    'local gunsmith map',
    'firearm services map',
    'gun shop locations',
    'gunsmith finder',
  ],
  openGraph: {
    title: 'Interactive Gunsmith Map - Find Local Gunsmiths',
    description: 'Explore our interactive map to find professional gunsmiths in your area. Get directions and contact information.',
  },
  alternates: {
    canonical: '/map',
  },
})
