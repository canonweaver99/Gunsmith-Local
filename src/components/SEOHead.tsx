'use client'

import Head from 'next/head'

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
}

export default function SEOHead({ 
  title,
  description,
  image,
  url,
  type = 'website'
}: SEOHeadProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gunsmithlocal.com'
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl

  return (
    <Head>
      {title && (
        <>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta name="twitter:title" content={title} />
        </>
      )}
      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
        </>
      )}
      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta name="twitter:image" content={image} />
        </>
      )}
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <link rel="canonical" href={fullUrl} />
    </Head>
  )
}
