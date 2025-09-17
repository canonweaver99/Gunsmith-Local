import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MapPin, Phone, Globe, CheckCircle, Star, Building2, Clock } from 'lucide-react'
import { Listing } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import FavoriteButton from './FavoriteButton'
import VerificationBadge from './VerificationBadge'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [reviewCount, setReviewCount] = useState(0)

  // Check if business is currently open
  const isOpen = () => {
    const now = new Date()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = days[now.getDay()]
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    // Default hours: 9-5 Mon-Fri if no hours posted
    const defaultHours = {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { closed: true },
      sunday: { closed: true }
    }
    
    const businessHours = listing.business_hours || {}
    const rawToday = (businessHours as any)[currentDay]
    // Merge with defaults and guard against missing fields
    const todayHours: any = rawToday && typeof rawToday === 'object'
      ? { ...((defaultHours as any)[currentDay] || {}), ...rawToday }
      : (defaultHours as any)[currentDay]

    if (!todayHours || todayHours.closed === true) return false

    const openStr: string = todayHours.open || '09:00'
    const closeStr: string = todayHours.close || '17:00'
    const [openHour, openMin] = String(openStr).split(':').map((v: string) => parseInt(v, 10))
    const [closeHour, closeMin] = String(closeStr).split(':').map((v: string) => parseInt(v, 10))
    
    const openTime = openHour * 60 + openMin
    const closeTime = closeHour * 60 + closeMin
    
    return currentTime >= openTime && currentTime < closeTime
  }

  useEffect(() => {
    fetchRatingData()
  }, [listing.id])

  async function fetchRatingData() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('listing_id', listing.id)

      if (error) throw error

      if (data && data.length > 0) {
        const average = data.reduce((sum, review) => sum + review.rating, 0) / data.length
        setAvgRating(average)
        setReviewCount(data.length)
      }
    } catch (error) {
      console.error('Error fetching rating:', error)
    }
  }
  return (
    <div className="card h-full hover:shadow-lg hover:shadow-gunsmith-gold/10 transition-all duration-300 relative">
      {/* Featured Badge */}
      {(listing.is_featured || listing.is_featured_in_state) && (
        <div className="absolute top-4 right-4 bg-gunsmith-gold text-gunsmith-black px-3 py-1 rounded font-bebas text-sm tracking-wider z-10 flex items-center gap-1">
          <Star className="h-3 w-3 fill-current" />
          <span>FEATURED</span>
        </div>
      )}

      {/* Favorite Button */}
      <div className="absolute top-4 left-4 z-10">
        <FavoriteButton listingId={listing.id} size="md" />
      </div>

      <Link href={`/listings/${listing.slug}`} className="block">
        {/* Cover Image or Logo */}
        {listing.cover_image_url || listing.logo_url ? (
          <div className="h-56 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
            <img 
              src={listing.cover_image_url || listing.logo_url || ''} 
              alt={listing.business_name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-56 -mx-6 -mt-6 mb-4 bg-gunsmith-accent flex items-center justify-center rounded-t-lg">
            <div className="text-gunsmith-gold/20">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Business Name & Verification */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-bebas text-2xl text-gunsmith-gold">
                {listing.business_name}
              </h3>
              <VerificationBadge 
                isVerified={listing.is_verified || false}
                verificationStatus={listing.verification_status || 'pending'}
                fflLicenseNumber={listing.ffl_license_number}
                showLabel={false}
                size="sm"
              />
            </div>
            {listing.category && (
              <p className="text-sm text-gunsmith-text-secondary">{listing.category}</p>
            )}
          </div>

          {/* Rating */}
          {avgRating !== null && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(avgRating)
                        ? 'text-gunsmith-gold fill-gunsmith-gold'
                        : 'text-gunsmith-gold/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gunsmith-text-secondary">
                {avgRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}

          {/* Description preview */}
          {listing.description && (
            <p className="text-gunsmith-text-secondary line-clamp-3">
              {listing.description}
            </p>
          )}

          {/* Location */}
          {listing.city && listing.state_province && (
            <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
              <MapPin className="h-4 w-4 text-gunsmith-gold" />
              <span>{listing.city}, {listing.state_province}</span>
            </div>
          )}

          {/* Open/Closed Status - always show with default hours if none posted */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gunsmith-gold" />
            {isOpen() ? (
              <span className="text-green-500 font-medium">Open Now</span>
            ) : (
              <span className="text-gunsmith-error font-medium">Closed</span>
            )}
            {!listing.business_hours && (
              <span className="text-gunsmith-text-secondary text-xs ml-1">(Default: 9-5 M-F)</span>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-1">
            {listing.phone && (
              <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                <Phone className="h-4 w-4 text-gunsmith-gold" />
                <span>{listing.phone}</span>
              </div>
            )}
            {listing.website && (
              <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                <Globe className="h-4 w-4 text-gunsmith-gold" />
                <span className="truncate">{listing.website.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>

          {/* Delivery Method */}
          {listing.delivery_method && (
            <div className="text-sm text-gunsmith-text-secondary">
              <span className="text-gunsmith-gold">Delivery:</span> {listing.delivery_method === 'in-person' ? 'In Person' : listing.delivery_method === 'shipping' ? 'Shipped' : 'Both'}
            </div>
          )}

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {listing.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gunsmith-accent text-gunsmith-gold px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {listing.tags.length > 3 && (
                <span className="text-xs text-gunsmith-text-secondary">
                  +{listing.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
