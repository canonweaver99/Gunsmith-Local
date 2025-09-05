import { Metadata } from 'next'
import { generateMetadata } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: 'Add Your Gunsmith Business | Join GunsmithLocal Directory',
  description: 'List your gunsmith business in our directory. Reach more customers, showcase your services, and grow your firearms business with GunsmithLocal.',
  keywords: [
    'add gunsmith business',
    'list gunsmith services',
    'gunsmith directory listing',
    'join gunsmith directory',
    'gunsmith business registration',
    'firearms business listing',
    'gun shop directory',
    'gunsmith advertising',
    'promote gunsmith business',
  ],
  openGraph: {
    title: 'Add Your Gunsmith Business - GunsmithLocal',
    description: 'Join thousands of professional gunsmiths. List your business, showcase your services, and connect with customers in your area.',
  },
  alternates: {
    canonical: '/add-business',
  },
})
