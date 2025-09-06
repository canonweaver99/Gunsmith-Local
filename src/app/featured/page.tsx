'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ListingCard from '@/components/ListingCard'
import { supabase, Listing } from '@/lib/supabase'
import { Star, Loader2, ChevronDown, Sparkles, CheckCircle, Trophy, ArrowRight } from 'lucide-react'
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
  const [topListings, setTopListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [detectingLocation, setDetectingLocation] = useState(true)
  const [showBusinessInfo, setShowBusinessInfo] = useState(false)

  // Auto-detect user's state on mount
  useEffect(() => {
    const detectUserState = async () => {
      // If state is already in URL, use that
      if (searchParams.get('state')) {
        setDetectingLocation(false)
        return
      }

      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Use reverse geocoding to get state from coordinates
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
              )
              const data = await response.json()
              
              if (data.results && data.results.length > 0) {
                // Find the state component
                for (const result of data.results) {
                  for (const component of result.address_components) {
                    if (component.types.includes('administrative_area_level_1')) {
                      const stateCode = component.short_name
                      // Check if it's a valid US state
                      if (US_STATES.find(s => s.code === stateCode)) {
                        setSelectedState(stateCode)
                        break
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error detecting location:', error)
            }
            setDetectingLocation(false)
          },
          (error) => {
            console.error('Geolocation error:', error)
            setDetectingLocation(false)
          }
        )
      } else {
        setDetectingLocation(false)
      }
    }

    detectUserState()
  }, [searchParams])

  useEffect(() => {
    if (selectedState) {
      fetchTopListings(selectedState)
    } else if (!detectingLocation) {
      setLoading(false)
    }
  }, [selectedState, detectingLocation])

  async function fetchTopListings(stateCode: string) {
    try {
      setLoading(true)
      
      // Fetch top 3 listings for the selected state
      // Prioritize: featured > verified > view count
      const { data: listings, error } = await supabase
        .from('listings')
        .select('*')
        .eq('state_province', stateCode)
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('is_verified', { ascending: false })
        .order('view_count', { ascending: false })
        .limit(3)

      if (error) throw error

      setTopListings(listings || [])

    } catch (error) {
      console.error('Error fetching top listings:', error)
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
        {/* Header */}
        <section className="bg-gradient-to-b from-gunsmith-gold/10 to-gunsmith-black py-12 px-4">
          <div className="container mx-auto text-center">
            <h1 className="font-bebas text-5xl md:text-6xl text-gunsmith-gold mb-4 tracking-wider">
              TOP GUNSMITHS BY STATE
            </h1>
            <p className="text-xl text-gunsmith-text-secondary max-w-2xl mx-auto">
              Discover the best rated and most trusted gunsmiths in your state
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
                disabled={detectingLocation}
              >
                <option value="">
                  {detectingLocation ? "Detecting your location..." : "Select a State"}
                </option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
              {detectingLocation ? (
                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold animate-spin pointer-events-none" />
              ) : (
                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold pointer-events-none" />
              )}
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
                <Trophy className="h-24 w-24 text-gunsmith-gold/20 mx-auto mb-4" />
                <h3 className="font-bebas text-3xl text-gunsmith-gold mb-2">
                  SELECT YOUR STATE
                </h3>
                <p className="text-gunsmith-text-secondary max-w-md mx-auto">
                  Choose a state above to view the top rated gunsmiths in that area.
                </p>
              </div>
            ) : loading ? (
              // Loading State
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
              </div>
            ) : topListings.length === 0 ? (
              // No Listings
              <div className="text-center py-20">
                <p className="text-gunsmith-text-secondary mb-8">
                  No gunsmiths found in {US_STATES.find(s => s.code === selectedState)?.name}.
                </p>
                <Link href="/add-business" className="btn-primary">
                  Be the First to List
                </Link>
              </div>
            ) : (
              // Top 3 Listings
              <>
                <h2 className="font-bebas text-3xl text-center text-gunsmith-gold mb-8">
                  TOP 3 GUNSMITHS IN {US_STATES.find(s => s.code === selectedState)?.name.toUpperCase()}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {topListings.map((listing, index) => (
                    <div key={listing.id} className="relative">
                      {/* Position Badge */}
                      <div className="absolute -top-4 left-6 z-10">
                        <div className={`px-6 py-2 rounded-full flex items-center gap-2 shadow-xl ${
                          index === 0 
                            ? 'bg-gradient-to-r from-gunsmith-gold to-gunsmith-goldenrod text-gunsmith-black' 
                            : index === 1
                            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
                            : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                        }`}>
                          <Trophy className="h-5 w-5 fill-current" />
                          <span className="font-bebas text-lg tracking-wide">
                            {index === 0 ? '#1 TOP RATED' : index === 1 ? '#2 GUNSMITH' : '#3 GUNSMITH'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Card with special styling for #1 */}
                      <div className={`mt-3 ${index === 0 ? 'ring-2 ring-gunsmith-gold' : ''}`}>
                        <ListingCard listing={listing} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* More Listings Link */}
                <div className="text-center">
                  <Link 
                    href={`/listings?state=${selectedState}`}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    View All {US_STATES.find(s => s.code === selectedState)?.name} Gunsmiths
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Get Your Business Featured Section */}
        {!showBusinessInfo ? (
          <section className="py-12 px-4 bg-gunsmith-accent/10">
            <div className="container mx-auto text-center">
              <button
                onClick={() => setShowBusinessInfo(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Get Your Business Featured
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        ) : (
          <section className="py-16 px-4 bg-gradient-to-br from-gunsmith-gold/20 via-gunsmith-accent/10 to-gunsmith-black">
            <div className="container mx-auto max-w-4xl">
              {/* Premium Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-6">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-gunsmith-gold"></div>
                  <Sparkles className="h-10 w-10 text-gunsmith-gold animate-pulse" />
                  <span className="font-bebas text-2xl text-gunsmith-gold tracking-[0.2em]">PREMIUM LISTINGS</span>
                  <Sparkles className="h-10 w-10 text-gunsmith-gold animate-pulse" />
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-gunsmith-gold"></div>
                </div>
                
                <h2 className="font-bebas text-5xl md:text-6xl text-gunsmith-gold mb-6 tracking-wider">
                  STAND OUT FROM THE CROWD
                </h2>
                
                <p className="text-xl text-gunsmith-text max-w-3xl mx-auto mb-10 leading-relaxed">
                  Get premium placement in your state's directory and watch your business grow 
                  with increased visibility and credibility.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="card text-center">
                  <Star className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                  <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">FEATURED BADGE</h3>
                  <p className="text-gunsmith-text-secondary text-sm">
                    Gold featured badge on your listing to stand out
                  </p>
                </div>
                <div className="card text-center">
                  <Trophy className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                  <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">PRIORITY PLACEMENT</h3>
                  <p className="text-gunsmith-text-secondary text-sm">
                    Appear at the top of search results in your state
                  </p>
                </div>
                <div className="card text-center">
                  <CheckCircle className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                  <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">VERIFIED STATUS</h3>
                  <p className="text-gunsmith-text-secondary text-sm">
                    Build trust with the verified business checkmark
                  </p>
                </div>
              </div>

              {/* Pricing */}
              <div className="card bg-gunsmith-gold/10 border-gunsmith-gold/30 text-center mb-8">
                <h3 className="font-bebas text-3xl text-gunsmith-gold mb-4">
                  PREMIUM FEATURES
                </h3>
                <div className="inline-flex items-center gap-4 bg-gunsmith-gold text-gunsmith-black px-8 py-4 rounded-lg mb-6">
                  <span className="font-bebas text-4xl">$50</span>
                  <div className="text-left">
                    <p className="font-oswald font-bold text-sm">PER MONTH</p>
                    <p className="text-xs opacity-80">Per State</p>
                  </div>
                </div>
                <p className="text-gunsmith-text-secondary mb-6">
                  Cancel anytime. No long-term contracts.
                </p>
                <Link href="/dashboard" className="btn-primary inline-block">
                  Get Started Now
                </Link>
              </div>

              {/* How It Works */}
              <div className="text-center">
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-6">
                  HOW IT WORKS
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gunsmith-card/50 p-4 rounded-lg">
                    <div className="bg-gunsmith-gold/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="font-bebas text-lg text-gunsmith-gold">1</span>
                    </div>
                    <p className="text-gunsmith-text-secondary">Sign up for a business account</p>
                  </div>
                  <div className="bg-gunsmith-card/50 p-4 rounded-lg">
                    <div className="bg-gunsmith-gold/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="font-bebas text-lg text-gunsmith-gold">2</span>
                    </div>
                    <p className="text-gunsmith-text-secondary">Choose your state & features</p>
                  </div>
                  <div className="bg-gunsmith-card/50 p-4 rounded-lg">
                    <div className="bg-gunsmith-gold/20 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="font-bebas text-lg text-gunsmith-gold">3</span>
                    </div>
                    <p className="text-gunsmith-text-secondary">Watch your business grow</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
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