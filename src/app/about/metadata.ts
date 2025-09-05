import { Metadata } from 'next'
import { generateMetadata } from '@/lib/seo'

export const metadata: Metadata = generateMetadata({
  title: 'About GunsmithLocal | Professional Gunsmith Directory',
  description: 'Learn about GunsmithLocal, the premier directory for finding trusted gunsmiths. Our mission is to connect firearm owners with skilled professionals.',
  keywords: [
    'about gunsmithlocal',
    'gunsmith directory',
    'firearm services directory',
    'professional gunsmith network',
    'gun repair directory',
    'gunsmith community',
  ],
  openGraph: {
    title: 'About GunsmithLocal - Connecting Firearm Owners with Professionals',
    description: 'Discover how GunsmithLocal helps firearm owners find trusted, skilled gunsmiths in their local area.',
  },
  alternates: {
    canonical: '/about',
  },
})
