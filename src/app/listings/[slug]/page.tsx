'use client'

import { useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MapView from '@/components/MapView'
import BusinessHours from '@/components/BusinessHours'
import Reviews from '@/components/Reviews'
import ContactForm from '@/components/ContactForm'
import FavoriteButton from '@/components/FavoriteButton'
import { supabase, Listing } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { 
  MapPin, Phone, Mail, Globe, Clock, Calendar, 
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  CheckCircle, ArrowLeft, ExternalLink, Loader2,
  Building2, AlertCircle
} from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

export default function ListingDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const analytics = useAnalytics()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [claimSuccess, setClaimSuccess] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [params.slug])

  async function fetchListing() {
    try {
      // Fetch the listing
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('slug', params.slug)
        .single()

      if (error) throw error

      if (!data) {
        notFound()
      }

      setListing(data)
      
      // Track listing view
      analytics.trackListingView(data.id, data.business_name, data.category || 'Unknown')
      analytics.trackEcommerceView({
        id: data.id,
        business_name: data.business_name,
        category: data.category || 'Unknown',
        city: data.city || '',
        state: data.state_province || '',
        is_featured: data.is_featured || false,
        is_verified: data.is_verified || false,
      })

      // Track view via API for better accuracy
      try {
        await fetch(`/api/listings/${data.id}/track-view`, {
          method: 'POST',
          credentials: 'include'
        })
      } catch (error) {
        console.error('Error tracking view:', error)
        // Fallback to direct increment
        await supabase
          .from('listings')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', data.id)
      }

    } catch (error) {
      console.error('Error fetching listing:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  async function handleClaimBusiness() {
    if (!user) {
      router.push('/auth/login')
      return
    }
    // Route to FFL verification flow for this listing
    router.push(`/verify-ffl?listingId=${listing!.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  if (!listing) {
    return notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Back Button */}
        <div className="bg-gunsmith-accent/20 py-4 px-4">
          <div className="container mx-auto">
            <Link href="/listings" className="inline-flex items-center gap-2 text-gunsmith-gold hover:text-gunsmith-goldenrod transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-oswald">Back to Listings</span>
            </Link>
          </div>
        </div>

        {/* Hero Section with Cover Image: constrained width to reduce blur */}
        {listing.cover_image_url && (
          <section className="py-6 px-4">
            <div className="container mx-auto">
              <div className="mx-auto max-w-5xl">
                <div 
                  className="relative h-40 sm:h-48 md:h-56 lg:h-60 rounded-lg overflow-hidden border border-gunsmith-border"
                  style={{
                    backgroundImage: `url(${listing.cover_image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gunsmith-black/60 to-transparent" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Claim Business Banner */}
        {!listing.owner_id && (
          <section className="bg-gunsmith-gold/10 border-y border-gunsmith-gold/30 py-6 px-4">
            <div className="container mx-auto">
              {claimSuccess ? (
                <div className="flex items-center justify-center gap-3 text-green-400">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-oswald font-medium">Business claimed successfully! Redirecting...</span>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-6 w-6 text-gunsmith-gold" />
                    <div>
                      <h3 className="font-bebas text-xl text-gunsmith-gold">IS THIS YOUR BUSINESS?</h3>
                      <p className="text-sm text-gunsmith-text-secondary">
                        Claim this listing to manage and update your business information
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClaimBusiness}
                    disabled={claiming}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {claiming ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      'Claim This Business'
                    )}
                  </button>
                </div>
              )}
              {claimError && (
                <div className="mt-4 flex items-start gap-2 text-gunsmith-error">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <span className="text-sm">{claimError}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* (Removed duplicate cover image section to prevent double rendering) */}

        {/* Main Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Business Header */}
                <div className="card">
                  <div className="flex items-start gap-6">
                    {/* Logo */}
                    {listing.logo_url && (
                      <img
                        src={listing.logo_url}
                        alt={`${listing.business_name} logo`}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded"
                      />
                    )}
                    
                    {/* Business Info */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="font-bebas text-4xl md:text-5xl text-gunsmith-gold flex items-center gap-3">
                        {listing.business_name}
                        {listing.is_verified && (
                          <CheckCircle className="h-8 w-8 text-gunsmith-gold" />
                        )}
                      </h1>
                      {listing.category && (
                        <p className="text-gunsmith-text-secondary mt-2">
                          {listing.category} {listing.subcategory && `• ${listing.subcategory}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <FavoriteButton listingId={listing.id} size="lg" showText />
                      {listing.is_featured && (
                        <span className="bg-gunsmith-gold text-gunsmith-black px-4 py-2 rounded font-bebas tracking-wider">
                          FEATURED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {listing.tags && listing.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {listing.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-gunsmith-accent text-gunsmith-gold px-3 py-1 rounded text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {listing.description && (
                  <div className="card">
                    <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">ABOUT</h2>
                    <p className="text-gunsmith-text-secondary whitespace-pre-wrap">
                      {listing.description}
                    </p>
                    {listing.year_established && (
                      <p className="mt-4 text-sm text-gunsmith-text-secondary">
                        Established in {listing.year_established}
                      </p>
                    )}
                  </div>
                )}

                {/* Image Gallery */}
                {listing.image_gallery && listing.image_gallery.length > 0 && (
                  <div className="card">
                    <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">GALLERY</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {listing.image_gallery.map((image, index) => (
                        <img 
                          key={index}
                          src={image} 
                          alt={`${listing.business_name} gallery ${index + 1}`}
                          className="w-full h-40 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Section */}
                <div className="card">
                  <Reviews listingId={listing.id} listingName={listing.business_name} />
                </div>

                {/* Contact Form Section */}
                <div>
                  <ContactForm 
                    listingId={listing.id}
                    listingName={listing.business_name}
                    businessEmail={listing.email}
                    businessPhone={listing.phone}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="card">
                  <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">CONTACT</h3>
                  <div className="space-y-3">
                    {/* Address */}
                    {listing.street_address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-gunsmith-gold mt-0.5" />
                        <div className="text-gunsmith-text-secondary">
                          <p>{listing.street_address}</p>
                          {listing.street_address_2 && <p>{listing.street_address_2}</p>}
                          <p>
                            {listing.city}, {listing.state_province} {listing.postal_code}
                          </p>
                          {listing.country && <p>{listing.country}</p>}
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    {listing.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gunsmith-gold" />
                        <a href={`tel:${listing.phone}`} className="text-gunsmith-text-secondary hover:text-gunsmith-gold">
                          {listing.phone}
                        </a>
                      </div>
                    )}

                    {/* Email */}
                    {listing.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gunsmith-gold" />
                        <a href={`mailto:${listing.email}`} className="text-gunsmith-text-secondary hover:text-gunsmith-gold">
                          {listing.email}
                        </a>
                      </div>
                    )}

                    {/* Website */}
                    {listing.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gunsmith-gold" />
                        <a 
                          href={listing.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gunsmith-text-secondary hover:text-gunsmith-gold flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Hours */}
                {listing.business_hours && (
                  <div className="card">
                    <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">HOURS</h3>
                    <BusinessHours hours={listing.business_hours} />
                  </div>
                )}

                {/* Social Media */}
                {(listing.facebook_url || listing.twitter_url || listing.instagram_url || 
                  listing.linkedin_url || listing.youtube_url) && (
                  <div className="card">
                    <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">CONNECT</h3>
                    <div className="flex gap-3">
                      {listing.facebook_url && (
                        <a href={listing.facebook_url} target="_blank" rel="noopener noreferrer" 
                           className="text-gunsmith-text-secondary hover:text-gunsmith-gold">
                          <Facebook className="h-6 w-6" />
                        </a>
                      )}
                      {listing.twitter_url && (
                        <a href={listing.twitter_url} target="_blank" rel="noopener noreferrer"
                           className="text-gunsmith-text-secondary hover:text-gunsmith-gold">
                          <Twitter className="h-6 w-6" />
                        </a>
                      )}
                      {listing.instagram_url && (
                        <a href={listing.instagram_url} target="_blank" rel="noopener noreferrer"
                           className="text-gunsmith-text-secondary hover:text-gunsmith-gold">
                          <Instagram className="h-6 w-6" />
                        </a>
                      )}
                      {listing.linkedin_url && (
                        <a href={listing.linkedin_url} target="_blank" rel="noopener noreferrer"
                           className="text-gunsmith-text-secondary hover:text-gunsmith-gold">
                          <Linkedin className="h-6 w-6" />
                        </a>
                      )}
                      {listing.youtube_url && (
                        <a href={listing.youtube_url} target="_blank" rel="noopener noreferrer"
                           className="text-gunsmith-text-secondary hover:text-gunsmith-gold">
                          <Youtube className="h-6 w-6" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Map */}
                {listing.latitude && listing.longitude && (
                  <div className="card">
                    <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">LOCATION</h3>
                    <MapView
                      listings={[listing]}
                      selectedListing={listing}
                      height="h-64"
                    />
                    <div className="mt-3 text-sm text-gunsmith-text-secondary">
                      <p>📍 {listing.street_address}, {listing.city}, {listing.state_province}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
