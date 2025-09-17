'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { 
  Star, Trophy, TrendingUp, BarChart3, Users, MapPin, 
  CheckCircle, ArrowRight, Sparkles, Target, Eye, 
  Phone, Mail, DollarSign, Calendar, Loader2 
} from 'lucide-react'
import Link from 'next/link'

export default function GetFeaturedPage() {
  const { user } = useAuth()
  const [userListings, setUserListings] = useState<any[]>([])
  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<number>(0)
  const [checkingOut, setCheckingOut] = useState(false)
  const [joiningWaitlist, setJoiningWaitlist] = useState(false)
  const [onWaitlist, setOnWaitlist] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserListings()
      fetchAvailableSlots()
    }
  }, [user])

  async function fetchUserListings() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserListings(data || [])
      if (data && data.length > 0 && !selectedListing) {
        setSelectedListing(data[0])
      }
    } catch (error) {
      console.error('Error fetching user listings:', error)
    }
  }

  async function fetchAvailableSlots() {
    if (!selectedListing) return
    
    try {
      const response = await fetch(`/api/featured/availability?state=${selectedListing.state_province}`)
      const data = await response.json()
      setAvailableSlots(data.available || 0)
    } catch (error) {
      console.error('Error checking availability:', error)
    }
  }

  useEffect(() => {
    if (selectedListing) {
      fetchAvailableSlots()
      checkWaitlistStatus()
    }
  }, [selectedListing])

  async function checkWaitlistStatus() {
    if (!selectedListing || !user) return
    
    try {
      const { data } = await supabase
        .from('featured_waitlist')
        .select('id')
        .eq('listing_id', selectedListing.id)
        .eq('user_id', user.id)
        .eq('status', 'waiting')
        .maybeSingle()
      
      setOnWaitlist(!!data)
    } catch (error) {
      console.error('Error checking waitlist status:', error)
    }
  }

  async function joinWaitlist() {
    if (!selectedListing || !user) return

    setJoiningWaitlist(true)
    try {
      const response = await fetch('/api/featured/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListing.id,
          userId: user.id,
          stateCode: selectedListing.state_province
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setOnWaitlist(true)
    } catch (error: any) {
      alert(error.message || 'Failed to join waitlist')
    } finally {
      setJoiningWaitlist(false)
    }
  }

  async function handleGetFeatured() {
    if (!selectedListing || !user) return

    setCheckingOut(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: selectedListing.id,
          userId: user.id,
          stateCode: selectedListing.state_province
        })
      })

      const { url, error } = await response.json()
      if (error) throw new Error(error)
      if (url) window.location.href = url
    } catch (error: any) {
      alert(error.message || 'Failed to start checkout')
    } finally {
      setCheckingOut(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-4">SIGN IN REQUIRED</h1>
            <p className="text-gunsmith-text-secondary mb-6">Please sign in to feature your listing</p>
            <Link href="/auth/login?redirect=/get-featured" className="btn-primary">
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (userListings.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-4">NO LISTINGS FOUND</h1>
            <p className="text-gunsmith-text-secondary mb-6">You need an active listing to feature</p>
            <Link href="/add-business/new" className="btn-primary">
              Add Your Business
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-gunsmith-gold/20 via-gunsmith-gunmetal/10 to-gunsmith-black overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23F8D23C' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <div className="relative z-10 container mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-gunsmith-gold"></div>
              <Sparkles className="h-10 w-10 text-gunsmith-gold animate-pulse" />
              <span className="font-bebas text-2xl text-gunsmith-gold tracking-[0.2em]">PREMIUM LISTINGS</span>
              <Sparkles className="h-10 w-10 text-gunsmith-gold animate-pulse" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-gunsmith-gold"></div>
            </div>
            
            <h1 className="font-bebas text-6xl md:text-7xl text-gunsmith-gold mb-6 tracking-wider">
              DOMINATE YOUR MARKET
            </h1>
            
            <p className="text-2xl text-gunsmith-text max-w-4xl mx-auto mb-12 leading-relaxed">
              Get premium placement, exclusive analytics, and watch your gunsmithing business grow 
              with verified leads and increased visibility across your entire state.
            </p>

            {/* Availability Status */}
            <div className="inline-flex items-center gap-3 bg-gunsmith-surface-2 border border-white/10 rounded-full px-6 py-3 mb-8">
              <Trophy className="h-6 w-6 text-gunsmith-gold" />
              <span className="font-montserrat font-semibold text-gunsmith-gold">
                {availableSlots > 0 
                  ? `${availableSlots} Featured Slots Available in ${selectedListing?.state_province || 'Your State'}`
                  : `Waitlist Only - ${selectedListing?.state_province || 'Your State'} is Full`
                }
              </span>
            </div>
          </div>
        </section>

        {/* Select Your Listing */}
        {userListings.length > 1 && (
          <section className="py-12 px-4 bg-gunsmith-surface-1">
            <div className="container mx-auto max-w-4xl">
              <h2 className="font-bebas text-3xl text-gunsmith-gold mb-6 text-center">SELECT YOUR LISTING</h2>
              <div className="grid gap-4">
                {userListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => setSelectedListing(listing)}
                    className={`card cursor-pointer transition-all ${
                      selectedListing?.id === listing.id
                        ? 'ring-2 ring-gunsmith-gold bg-gunsmith-gold/5'
                        : 'hover:ring-1 hover:ring-gunsmith-gold/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bebas text-xl text-gunsmith-gold">{listing.business_name}</h3>
                        <p className="text-gunsmith-text-secondary">{listing.city}, {listing.state_province}</p>
                        {listing.is_featured && (
                          <span className="inline-flex items-center gap-1 bg-gunsmith-gold text-gunsmith-black px-2 py-1 rounded text-xs font-semibold mt-2">
                            <Star className="h-3 w-3 fill-current" />
                            Currently Featured
                          </span>
                        )}
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        selectedListing?.id === listing.id
                          ? 'border-gunsmith-gold bg-gunsmith-gold'
                          : 'border-gunsmith-text-muted'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="font-bebas text-4xl text-center text-gunsmith-gold mb-16 tracking-wider">
              WHAT YOU GET WITH FEATURED STATUS
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Priority Placement */}
              <div className="card text-center featured-card">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold/20 rounded-full mb-6">
                  <Trophy className="h-8 w-8 text-gunsmith-gold" />
                </div>
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-3">PRIORITY PLACEMENT</h3>
                <p className="text-gunsmith-text-secondary leading-relaxed">
                  Appear at the top of all search results in your state. Get seen first by every potential customer.
                </p>
              </div>

              {/* Featured Badge */}
              <div className="card text-center featured-card">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold/20 rounded-full mb-6">
                  <Star className="h-8 w-8 text-gunsmith-gold" />
                </div>
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-3">FEATURED BADGE</h3>
                <p className="text-gunsmith-text-secondary leading-relaxed">
                  Gold featured badge on your listing that instantly signals premium status and builds trust.
                </p>
              </div>

              {/* State Directory */}
              <div className="card text-center featured-card">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold/20 rounded-full mb-6">
                  <MapPin className="h-8 w-8 text-gunsmith-gold" />
                </div>
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-3">STATE DIRECTORY</h3>
                <p className="text-gunsmith-text-secondary leading-relaxed">
                  Exclusive placement on our "Featured by State" page where customers find top-rated gunsmiths.
                </p>
              </div>

              {/* Business Analytics */}
              <div className="card text-center featured-card">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold/20 rounded-full mb-6">
                  <BarChart3 className="h-8 w-8 text-gunsmith-gold" />
                </div>
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-3">BUSINESS ANALYTICS</h3>
                <p className="text-gunsmith-text-secondary leading-relaxed">
                  Track views, clicks, contact form submissions, and customer demographics with detailed insights.
                </p>
              </div>

              {/* Lead Generation */}
              <div className="card text-center featured-card">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold/20 rounded-full mb-6">
                  <TrendingUp className="h-8 w-8 text-gunsmith-gold" />
                </div>
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-3">LEAD GENERATION</h3>
                <p className="text-gunsmith-text-secondary leading-relaxed">
                  Featured listings receive 3-5x more inquiries than standard listings in the same area.
                </p>
              </div>

              {/* Customer Insights */}
              <div className="card text-center featured-card">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold/20 rounded-full mb-6">
                  <Users className="h-8 w-8 text-gunsmith-gold" />
                </div>
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-3">CUSTOMER INSIGHTS</h3>
                <p className="text-gunsmith-text-secondary leading-relaxed">
                  Understand your customer base with geographic data, service preferences, and peak inquiry times.
                </p>
              </div>
            </div>

            {/* Expected Results Section */}
            <div className="card bg-gunsmith-surface-2 mb-16">
              <div className="text-center mb-8">
                <Target className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                <h2 className="font-bebas text-3xl text-gunsmith-gold mb-4">EXPECTED RESULTS</h2>
                <p className="text-gunsmith-text-secondary max-w-2xl mx-auto">
                  Based on data from our current featured gunsmiths across all states
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="font-bebas text-4xl text-gunsmith-gold mb-2">3-5x</div>
                  <div className="text-gunsmith-text-secondary">More Profile Views</div>
                  <p className="text-sm text-gunsmith-text-muted mt-2">
                    Featured listings consistently outperform standard listings
                  </p>
                </div>
                <div className="text-center">
                  <div className="font-bebas text-4xl text-gunsmith-gold mb-2">15-25</div>
                  <div className="text-gunsmith-text-secondary">Monthly Inquiries</div>
                  <p className="text-sm text-gunsmith-text-muted mt-2">
                    Average qualified leads per month for featured shops
                  </p>
                </div>
                <div className="text-center">
                  <div className="font-bebas text-4xl text-gunsmith-gold mb-2">$2,500</div>
                  <div className="text-gunsmith-text-secondary">Avg. Monthly Revenue</div>
                  <p className="text-sm text-gunsmith-text-muted mt-2">
                    Additional revenue attributed to featured placement
                  </p>
                </div>
              </div>
            </div>

            {/* Analytics Dashboard Preview */}
            <div className="card mb-16">
              <h2 className="font-bebas text-3xl text-gunsmith-gold mb-6 text-center">YOUR ANALYTICS DASHBOARD</h2>
              <div className="bg-gunsmith-surface-3 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <Eye className="h-8 w-8 text-gunsmith-gold mx-auto mb-2" />
                    <div className="font-bebas text-2xl text-gunsmith-gold">1,247</div>
                    <div className="text-sm text-gunsmith-text-secondary">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <Phone className="h-8 w-8 text-gunsmith-gold mx-auto mb-2" />
                    <div className="font-bebas text-2xl text-gunsmith-gold">23</div>
                    <div className="text-sm text-gunsmith-text-secondary">Phone Clicks</div>
                  </div>
                  <div className="text-center">
                    <Mail className="h-8 w-8 text-gunsmith-gold mx-auto mb-2" />
                    <div className="font-bebas text-2xl text-gunsmith-gold">18</div>
                    <div className="text-sm text-gunsmith-text-secondary">Email Inquiries</div>
                  </div>
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-gunsmith-gold mx-auto mb-2" />
                    <div className="font-bebas text-2xl text-gunsmith-gold">156</div>
                    <div className="text-sm text-gunsmith-text-secondary">Directions</div>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-6">
                  <h4 className="font-bebas text-lg text-gunsmith-gold mb-4">TOP CUSTOMER SEARCHES</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Custom Builds', 'Trigger Work', 'Cerakoting', 'Sight Installation', 'General Repairs'].map((term) => (
                      <span key={term} className="bg-gunsmith-gold/20 text-gunsmith-gold px-3 py-1 rounded-full text-sm">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing & Checkout */}
        <section className="py-20 px-4 bg-gunsmith-surface-1">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="font-bebas text-4xl text-gunsmith-gold mb-4">GET FEATURED TODAY</h2>
              <p className="text-xl text-gunsmith-text-secondary">
                Join the top-performing gunsmiths in your state
              </p>
            </div>

            <div className="card bg-gunsmith-gold/10 border-gunsmith-gold/30 text-center mb-8">
              <div className="flex justify-center items-center gap-6 mb-6">
                <div className="text-center">
                  <div className="font-bebas text-6xl text-gunsmith-gold">$50</div>
                  <div className="text-gunsmith-text-secondary">per month</div>
                </div>
                <div className="text-left">
                  <div className="text-gunsmith-text-secondary text-sm">✓ Priority placement</div>
                  <div className="text-gunsmith-text-secondary text-sm">✓ Featured badge</div>
                  <div className="text-gunsmith-text-secondary text-sm">✓ Business analytics</div>
                  <div className="text-gunsmith-text-secondary text-sm">✓ Cancel anytime</div>
                </div>
              </div>

              {selectedListing && (
                <div className="bg-gunsmith-surface-2 rounded-lg p-4 mb-6">
                  <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">SELECTED LISTING</h3>
                  <p className="text-gunsmith-text">{selectedListing.business_name}</p>
                  <p className="text-gunsmith-text-secondary text-sm">{selectedListing.city}, {selectedListing.state_province}</p>
                </div>
              )}

              {availableSlots > 0 ? (
                <button
                  onClick={handleGetFeatured}
                  disabled={checkingOut || !selectedListing}
                  className="btn-primary text-xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6 mr-2" />
                      Get Featured Now
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-gunsmith-text-secondary mb-4">
                    All featured slots in {selectedListing?.state_province} are currently occupied.
                  </p>
                  {onWaitlist ? (
                    <div className="bg-green-500/20 border border-green-500 text-green-500 p-3 rounded">
                      <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm">You're on the waitlist! We'll notify you when a slot opens.</span>
                    </div>
                  ) : (
                    <button 
                      onClick={joinWaitlist}
                      disabled={joiningWaitlist}
                      className="btn-secondary disabled:opacity-50"
                    >
                      {joiningWaitlist ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Joining...
                        </>
                      ) : (
                        'Join Waitlist'
                      )}
                    </button>
                  )}
                </div>
              )}

              <p className="text-gunsmith-text-muted text-sm mt-4">
                Secure payment powered by Stripe • Cancel anytime • No long-term contracts
              </p>
            </div>

            {/* ROI Calculator */}
            <div className="card">
              <h3 className="font-bebas text-2xl text-gunsmith-gold mb-6 text-center">RETURN ON INVESTMENT</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bebas text-lg text-gunsmith-gold mb-4">INVESTMENT</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gunsmith-text-secondary">Monthly Fee</span>
                      <span className="text-gunsmith-text">$50.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gunsmith-text-secondary">Annual Cost</span>
                      <span className="text-gunsmith-text">$600.00</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bebas text-lg text-gunsmith-gold mb-4">EXPECTED RETURN</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gunsmith-text-secondary">Additional Monthly Revenue</span>
                      <span className="text-gunsmith-gold font-semibold">$2,500+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gunsmith-text-secondary">ROI</span>
                      <span className="text-gunsmith-gold font-semibold">5,000%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6 p-4 bg-gunsmith-gold/10 rounded-lg">
                <p className="text-gunsmith-text font-semibold">
                  Featured listing pays for itself with just 1-2 additional jobs per month
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-gunsmith-gunmetal">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-bebas text-4xl text-center text-gunsmith-gold mb-12">FREQUENTLY ASKED QUESTIONS</h2>
            
            <div className="space-y-6">
              <div className="card">
                <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">How quickly will I see results?</h3>
                <p className="text-gunsmith-text-secondary">
                  Most featured gunsmiths see increased inquiries within 24-48 hours of going live. 
                  Full benefits typically materialize within the first week.
                </p>
              </div>
              
              <div className="card">
                <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">Can I cancel anytime?</h3>
                <p className="text-gunsmith-text-secondary">
                  Yes, absolutely. Cancel from your dashboard anytime with no penalties or fees. 
                  Your featured status will remain active until the end of your current billing period.
                </p>
              </div>
              
              <div className="card">
                <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">What if my state is full?</h3>
                <p className="text-gunsmith-text-secondary">
                  We limit featured listings to 3 per state to maintain exclusivity. 
                  If your state is full, you'll be notified immediately when a slot opens.
                </p>
              </div>
              
              <div className="card">
                <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">What analytics do I get access to?</h3>
                <p className="text-gunsmith-text-secondary">
                  View detailed metrics including profile views, contact attempts, customer demographics, 
                  popular services searched, peak activity times, and conversion rates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-4 bg-gradient-to-r from-gunsmith-gold/20 to-gunsmith-gunmetal/20">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="font-bebas text-4xl text-gunsmith-gold mb-6">READY TO GROW YOUR BUSINESS?</h2>
            <p className="text-xl text-gunsmith-text-secondary mb-8">
              Join hundreds of successful gunsmiths who've transformed their business with featured listings.
            </p>
            
            {availableSlots > 0 && selectedListing ? (
              <button
                onClick={handleGetFeatured}
                disabled={checkingOut}
                className="btn-primary text-xl px-12 py-4 disabled:opacity-50"
              >
                {checkingOut ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Get Featured for $50/month
                    <ArrowRight className="h-6 w-6 ml-2" />
                  </>
                )}
              </button>
            ) : (
                <div className="text-center">
                  <p className="text-gunsmith-text-secondary mb-4">
                    No slots available in {selectedListing?.state_province || 'your state'} right now.
                  </p>
                  {onWaitlist ? (
                    <div className="bg-green-500/20 border border-green-500 text-green-500 p-3 rounded mb-4">
                      <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm">You're on the waitlist! We'll notify you when a slot opens.</span>
                    </div>
                  ) : (
                    <button 
                      onClick={joinWaitlist}
                      disabled={joiningWaitlist}
                      className="btn-primary mb-4 disabled:opacity-50"
                    >
                      {joiningWaitlist ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Joining...
                        </>
                      ) : (
                        'Join Waitlist'
                      )}
                    </button>
                  )}
                  <div>
                    <Link href="/dashboard" className="btn-secondary">
                      Return to Dashboard
                    </Link>
                  </div>
                </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
