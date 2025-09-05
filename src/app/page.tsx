import { Metadata } from 'next'
import { generateMetadata } from '@/lib/seo'
import HomePageClient from './home-client'

export const metadata: Metadata = generateMetadata({
  title: 'GunsmithLocal - Find Trusted Gunsmiths Near You | Professional Firearm Services',
  description: 'Find verified local gunsmiths for firearm repairs, customization, Cerakoting, and maintenance. Browse reviews, compare services, and connect with skilled professionals in your area.',
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
    'local gunsmith',
    'professional gunsmith',
  ],
})

export default function HomePage() {
  return <HomePageClient />
}
