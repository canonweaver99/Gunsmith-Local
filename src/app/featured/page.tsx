'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ListingCard from '@/components/ListingCard'
import { supabase, Listing, FeaturedListing } from '@/lib/supabase'
import { Star, Loader2, ChevronDown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'

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

function FeaturedContent() {
  const searchParams = useSearchParams()
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '')
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([])
  const [regularListings, setRegularListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [availableSlots, setAvailableSlots] = useState(0)

  useEffect(() => {
    if (selectedState) {
      fetchFeaturedListings(selectedState)
    } else {
      setLoading(false)
    }
  }, [selectedState])

  async function fetchFeaturedListings(stateCode: string) {
    try {
      setLoading(true)
      
      // Fetch featured listings for the selected state
      const { data: featured, error: featuredError } = await supabase
        .from('listings')
        .select('*')
        .eq('is_featured_in_state', stateCode)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3)

      if (featuredError) throw featuredError

      setFeaturedListings(featured || [])

      // If we have less than 3 featured, fetch some regular listings
      if (!featured || featured.length < 3) {
        const { data: regular, error: regularError } = await supabase
          .from('listings')
          .select('*')
          .eq('state_province', stateCode)
          .eq('status', 'active')
          .is('is_featured_in_state', null)
          .order('is_verified', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(3 - (featured?.length || 0))

        if (regularError) throw regularError
        setRegularListings(regular || [])
      } else {
        setRegularListings([])
      }

      // Calculate available slots
      setAvailableSlots(3 - (featured?.length || 0))

    } catch (error) {
      console.error('Error fetching featured listings:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleStateChange(stateCode: string) {
    setSelectedState(stateCode)
    // Update URL without navigation
    const url = new URL(window.location.href)
    if (stateCode) {
      url.searchParams.set('state', stateCode)
    } else {
      url.searchParams.delete('state')
    }
    window.history.pushState({}, '', url)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Page Header */}
        <section className="bg-gunsmith-accent/20 py-12 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-gunsmith-gold" />
              <h1 className="font-bebas text-5xl md:text-6xl text-gunsmith-gold text-center">
                FEATURED GUNSMITHS
              </h1>
              <Sparkles className="h-8 w-8 text-gunsmith-gold" />
            </div>
            <p className="text-center text-gunsmith-text-secondary max-w-2xl mx-auto">
              Premium gunsmiths showcased by state. Featured businesses get priority placement and enhanced visibility.
            </p>
          </div>
        </section>

        {/* State Selector */}
        <section className="py-8 px-4 bg-gunsmith-black sticky top-0 z-10 border-b border-gunsmith-border">
          <div className="container mx-auto max-w-md">
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="input w-full pl-12 pr-10 py-3 text-lg appearance-none cursor-pointer"
              >
                <option value="">Select a State</option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
              <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {!selectedState ? (
              // No State Selected
              <div className="text-center py-20">
                <div className="mb-8">
                  <Star className="h-24 w-24 text-gunsmith-gold/20 mx-auto mb-4" />
                  <h3 className="font-bebas text-3xl text-gunsmith-gold mb-2">
                    SELECT YOUR STATE
                  </h3>
                  <p className="text-gunsmith-text-secondary max-w-md mx-auto">
                    Choose a state above to view featured gunsmiths in your area.
                  </p>
                </div>
                
                {/* CTA for Business Owners */}
                <div className="card max-w-2xl mx-auto text-center">
                  <h4 className="font-bebas text-2xl text-gunsmith-gold mb-4">
                    GUNSMITH OWNERS
                  </h4>
                  <p className="text-gunsmith-text mb-6">
                    Get featured in your state for only <span className="text-gunsmith-gold font-bold">$50/month</span>. 
                    Stand out from the competition with premium placement and enhanced visibility.
                  </p>
                  <Link href="/dashboard" className="btn-primary inline-block">
                    Get Featured Now
                  </Link>
                </div>
              </div>
            ) : loading ? (
              // Loading State
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
              </div>
            ) : (
              // Featured Listings
              <>
                {/* Available Slots Notice */}
                {availableSlots > 0 && (
                  <div className="card bg-gunsmith-gold/10 border-gunsmith-gold/30 mb-8 text-center">
                    <p className="text-gunsmith-gold font-oswald">
                      <span className="font-bold">{availableSlots} featured {availableSlots === 1 ? 'spot' : 'spots'}</span> available in {US_STATES.find(s => s.code === selectedState)?.name}!
                    </p>
                    <Link href="/dashboard" className="text-sm text-gunsmith-text hover:text-gunsmith-gold underline">
                      Claim your spot →
                    </Link>
                  </div>
                )}

                {/* Featured Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {/* Featured Listings */}
                  {featuredListings.map((listing) => (
                    <div key={listing.id} className="relative">
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gunsmith-gold text-gunsmith-black px-4 py-1 rounded-full flex items-center gap-2 shadow-lg">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-bebas text-sm tracking-wide">FEATURED</span>
                        </div>
                      </div>
                      <div className="ring-2 ring-gunsmith-gold rounded-lg overflow-hidden mt-3">
                        <ListingCard listing={listing} />
                      </div>
                    </div>
                  ))}
                  
                  {/* Regular Listings to Fill Empty Slots */}
                  {regularListings.map((listing) => (
                    <div key={listing.id} className="opacity-90">
                      <ListingCard listing={listing} />
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
                {featuredListings.length === 0 && regularListings.length === 0 ? (
                  <div className="card text-center py-12">
                    <Star className="h-16 w-16 text-gunsmith-gold/30 mx-auto mb-4" />
                    <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">
                      NO LISTINGS IN {US_STATES.find(s => s.code === selectedState)?.name.toUpperCase()}
                    </h3>
                    <p className="text-gunsmith-text-secondary mb-6">
                      Be the first featured gunsmith in your state!
                    </p>
                    <Link href="/dashboard" className="btn-primary">
                      Get Featured Now
                    </Link>
                  </div>
                ) : (
                  <div className="text-center mt-12">
                    <Link 
                      href={`/listings?state=${selectedState}`}
                      className="btn-secondary inline-block"
                    >
                      View All {US_STATES.find(s => s.code === selectedState)?.name} Gunsmiths
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 px-4 bg-gunsmith-accent/10">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-bebas text-3xl text-gunsmith-gold text-center mb-8">
              HOW FEATURED LISTINGS WORK
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="bg-gunsmith-gold/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bebas text-2xl text-gunsmith-gold">1</span>
                </div>
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">SELECT YOUR STATE</h3>
                <p className="text-gunsmith-text-secondary text-sm">
                  Choose the state where you want premium visibility
                </p>
              </div>
              <div className="card text-center">
                <div className="bg-gunsmith-gold/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bebas text-2xl text-gunsmith-gold">2</span>
                </div>
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">CLAIM YOUR SPOT</h3>
                <p className="text-gunsmith-text-secondary text-sm">
                  Only 3 featured spots per state at $50/month
                </p>
              </div>
              <div className="card text-center">
                <div className="bg-gunsmith-gold/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-bebas text-2xl text-gunsmith-gold">3</span>
                </div>
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">GET NOTICED</h3>
                <p className="text-gunsmith-text-secondary text-sm">
                  Premium placement with featured badge and gold border
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function FeaturedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <FeaturedContent />
    </Suspense>
  )
}
