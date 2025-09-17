'use client'

import { useState, useEffect } from 'react'
import { supabase, FeaturedListing, Listing } from '@/lib/supabase'
import { Star, Loader2, Calendar, DollarSign, AlertCircle, ChevronDown, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface FeaturedSectionProps {
  listings: Listing[]
}

// US States
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
]

export default function FeaturedSection({ listings }: FeaturedSectionProps) {
  const [featuredStatus, setFeaturedStatus] = useState<Record<string, FeaturedListing | null>>({})
  const [loading, setLoading] = useState(true)
  const [selectedState, setSelectedState] = useState('')
  const [selectedListing, setSelectedListing] = useState('')
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availableSlots, setAvailableSlots] = useState(0)

  useEffect(() => {
    fetchFeaturedStatus()
  }, [listings])

  async function fetchFeaturedStatus() {
    try {
      const listingIds = listings.map(l => l.id)
      
      const { data, error } = await supabase
        .from('featured_listings')
        .select('*')
        .in('listing_id', listingIds)
        .eq('status', 'active')

      if (error) throw error

      const statusMap: Record<string, FeaturedListing | null> = {}
      listings.forEach(listing => {
        statusMap[listing.id] = data?.find(f => f.listing_id === listing.id) || null
      })
      setFeaturedStatus(statusMap)
    } catch (error) {
      console.error('Error fetching featured status:', error)
    } finally {
      setLoading(false)
    }
  }

  async function checkAvailability(stateCode: string) {
    try {
      setCheckingAvailability(true)
      
      const { count, error } = await supabase
        .from('featured_listings')
        .select('*', { count: 'exact', head: true })
        .eq('state_code', stateCode)
        .eq('status', 'active')

      if (error) throw error

      setAvailableSlots(3 - (count || 0))
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailableSlots(0)
    } finally {
      setCheckingAvailability(false)
    }
  }

  function handleStateChange(stateCode: string) {
    setSelectedState(stateCode)
    if (stateCode) {
      checkAvailability(stateCode)
    } else {
      setAvailableSlots(0)
    }
  }

  async function handlePurchase() {
    if (!selectedState || !selectedListing) return

    try {
      // TODO: Implement Stripe checkout
      alert('Stripe checkout will be implemented here')
      
      // For now, just create a pending featured listing
      const { error } = await supabase
        .from('featured_listings')
        .insert({
          listing_id: selectedListing,
          state_code: selectedState,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          payment_amount: 50.00,
          status: 'active' // This should be 'pending' until payment confirmed
        })

      if (error) throw error

      // Refresh status
      await fetchFeaturedStatus()
      setSelectedState('')
      setSelectedListing('')
    } catch (error) {
      console.error('Error purchasing featured spot:', error)
      alert('Failed to purchase featured spot. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Featured Status Cards */}
      {listings.map(listing => {
        const featured = featuredStatus[listing.id]
        const isActive = featured && featured.status === 'active'

        return (
          <div key={listing.id} className={`card ${isActive ? 'ring-2 ring-gunsmith-gold' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bebas text-xl text-gunsmith-gold mb-2">
                  {listing.business_name}
                </h4>
                
                {isActive ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                      <Star className="h-4 w-4 text-gunsmith-gold fill-current" />
                      <span>Featured in <strong className="text-gunsmith-gold">{featured.state_code}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                      <Calendar className="h-4 w-4" />
                      <span>Expires {new Date(featured.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                      <DollarSign className="h-4 w-4" />
                      <span>$50/month</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gunsmith-text-secondary">
                    Not currently featured in any state
                  </p>
                )}
              </div>

              {isActive && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-gunsmith-gold/20 text-gunsmith-gold px-3 py-1 rounded-full text-sm">
                    <Star className="h-3 w-3 fill-current" />
                    Active
                  </span>
                </div>
              )}
            </div>

            {!isActive && (
              <div className="mt-4 pt-4 border-t border-gunsmith-border">
                <Link 
                  href="/get-featured"
                  className="btn-primary text-sm inline-block"
                >
                  Get Featured
                </Link>
              </div>
            )}
          </div>
        )
      })}

      {/* Purchase New Featured Spot */}
      <div className="card bg-gunsmith-gold/5 border-gunsmith-gold/20">
        <div className="text-center mb-6">
          <Sparkles className="h-12 w-12 text-gunsmith-gold mx-auto mb-3" />
          <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">
            GET FEATURED IN YOUR STATE
          </h3>
          <p className="text-gunsmith-text-secondary">
            Stand out with premium placement for only <span className="text-gunsmith-gold font-bold">$50/month</span>
          </p>
        </div>

        <div className="space-y-4">
          {/* Select Listing */}
          <div>
            <label className="label">Select Listing</label>
            <select
              value={selectedListing}
              onChange={(e) => setSelectedListing(e.target.value)}
              className="input w-full"
              disabled={listings.length === 0}
            >
              <option value="">Choose a listing</option>
              {listings.map(listing => {
                const featured = featuredStatus[listing.id]
                const isActive = featured && featured.status === 'active'
                
                return (
                  <option 
                    key={listing.id} 
                    value={listing.id}
                    disabled={isActive}
                  >
                    {listing.business_name} {isActive ? '(Already Featured)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Select State */}
          {selectedListing && (
            <div>
              <label className="label">Select State</label>
              <div className="relative">
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="input w-full appearance-none pr-10"
                >
                  <option value="">Choose a state</option>
                  {US_STATES.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold pointer-events-none" />
              </div>
            </div>
          )}

          {/* Availability Status */}
          {selectedState && (
            <div className="card bg-gunsmith-black">
              {checkingAvailability ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking availability...</span>
                </div>
              ) : availableSlots > 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>{availableSlots} {availableSlots === 1 ? 'spot' : 'spots'} available in {US_STATES.find(s => s.code === selectedState)?.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gunsmith-error">
                  <AlertCircle className="h-4 w-4" />
                  <span>No spots available in {US_STATES.find(s => s.code === selectedState)?.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Purchase Button */}
          {selectedListing && selectedState && availableSlots > 0 && (
            <button
              onClick={handlePurchase}
              className="btn-primary w-full"
            >
              Purchase Featured Spot - $50/month
            </button>
          )}
        </div>

        {/* Benefits */}
        <div className="mt-6 pt-6 border-t border-gunsmith-border">
          <h4 className="font-bebas text-lg text-gunsmith-gold mb-3">FEATURED BENEFITS</h4>
          <ul className="space-y-2 text-sm text-gunsmith-text-secondary">
            <li className="flex items-start gap-2">
              <Star className="h-4 w-4 text-gunsmith-gold flex-shrink-0 mt-0.5" />
              <span>Premium placement on Featured page</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="h-4 w-4 text-gunsmith-gold flex-shrink-0 mt-0.5" />
              <span>Gold border and featured badge</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="h-4 w-4 text-gunsmith-gold flex-shrink-0 mt-0.5" />
              <span>Limited to 3 businesses per state</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="h-4 w-4 text-gunsmith-gold flex-shrink-0 mt-0.5" />
              <span>30-day minimum, cancel anytime</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
