export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import { Bebas_Neue, Oswald } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import AnalyticsProvider from '@/components/AnalyticsProvider'
import { generateMetadata, generateStructuredData } from '@/lib/seo'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'

// Configure fonts with Next.js font optimization
const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const oswald = Oswald({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

export const metadata: Metadata = generateMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationData = generateStructuredData('Organization', {
    name: 'GunsmithLocal',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gunsmithlocal.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gunsmithlocal.com'}/logo.png`,
    description: 'The premier directory for finding professional gunsmiths in your area.',
    sameAs: [
      'https://twitter.com/gunsmithlocal',
      'https://facebook.com/gunsmithlocal',
    ],
  })

  const websiteData = generateStructuredData('WebSite', {
    name: 'GunsmithLocal',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://gunsmithlocal.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gunsmithlocal.com'}/listings?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  })

  return (
    <html lang="en" className={`${bebasNeue.variable} ${oswald.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={organizationData}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={websiteData}
        />
      </head>
      <body className="min-h-screen bg-gunsmith-black">
        <ErrorBoundary>
          <AnalyticsProvider>
            <AuthProvider>
              <FavoritesProvider>
                {children}
              </FavoritesProvider>
            </AuthProvider>
          </AnalyticsProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
