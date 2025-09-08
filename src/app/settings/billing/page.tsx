'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FeaturedCheckout from '@/components/FeaturedCheckout'
import { supabase } from '@/lib/supabase'
import { CreditCard, Star, Calendar, DollarSign, Loader2, AlertCircle, CheckCircle, Eye } from 'lucide-react'

interface Transaction {
  id: string
  amount_paid: number
  duration_days: number
  featured_until: string
  status: string
  created_at: string
  stripe_payment_intent_id: string
}

interface Listing {
  id: string
  business_name: string
  is_featured: boolean
  featured_until: string | null
}

export default function BillingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<Listing[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showFeaturedCheckout, setShowFeaturedCheckout] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchBillingData()
    }
  }, [user])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's listings
      const { data: session } = await supabase.auth.getSession()
      console.log('Session before query (billing):', session)

      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select('id, business_name, is_featured, featured_until')
        .eq('owner_id', user?.id)

      if (listingsError) {
        console.error('Listings query error (billing):', listingsError)
        throw listingsError
      }

      // Fetch transaction history
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('featured_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (transactionsError) throw transactionsError

      setListings(listingsData || [])
      setTransactions(transactionsData || [])
    } catch (error: any) {
      setError(error.message || 'Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const isExpired = (featuredUntil: string | null) => {
    if (!featuredUntil) return true
    return new Date(featuredUntil) < new Date()
  }

  const daysRemaining = (featuredUntil: string | null) => {
    if (!featuredUntil) return 0
    const diff = new Date(featuredUntil).getTime() - new Date().getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gunsmith-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-8">BILLING & FEATURED LISTINGS</h1>
            
            {error && (
              <div className="bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2 mb-6">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Current Featured Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">YOUR LISTINGS</h2>
                <div className="space-y-4">
                  {listings.length === 0 ? (
                    <div className="card text-center py-8">
                      <CreditCard className="h-12 w-12 text-gunsmith-gold/30 mx-auto mb-4" />
                      <p className="text-gunsmith-text-secondary">No business listings found</p>
                      <button
                        onClick={() => router.push('/business-portal')}
                        className="btn-primary mt-4"
                      >
                        Business Portal
                      </button>
                    </div>
                  ) : (
                    listings.map((listing) => (
                      <div key={listing.id} className="card">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bebas text-xl text-gunsmith-gold">{listing.business_name}</h3>
                          {listing.is_featured && !isExpired(listing.featured_until) && (
                            <span className="bg-gunsmith-gold text-gunsmith-black px-2 py-1 rounded text-xs font-bold">
                              FEATURED
                            </span>
                          )}
                        </div>
                        
                        {listing.is_featured && !isExpired(listing.featured_until) ? (
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-5 w-5 text-green-500" />
                              <span className="text-green-500 font-medium">Currently Featured</span>
                            </div>
                            <p className="text-gunsmith-text-secondary text-sm">
                              {daysRemaining(listing.featured_until)} days remaining
                            </p>
                            <p className="text-gunsmith-text-secondary text-xs">
                              Expires: {formatDate(listing.featured_until!)}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gunsmith-gold/10 border border-gunsmith-gold/30 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gunsmith-gold font-medium">Get Featured</p>
                                <p className="text-gunsmith-text-secondary text-sm">
                                  Boost visibility with premium placement
                                </p>
                              </div>
                              <button
                                onClick={() => setShowFeaturedCheckout(listing.id)}
                                className="btn-primary text-sm"
                              >
                                $50/month
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">PAYMENT HISTORY</h2>
                <div className="card">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gunsmith-gold/30 mx-auto mb-4" />
                      <p className="text-gunsmith-text-secondary">No payment history</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="border-b border-gunsmith-border last:border-b-0 pb-4 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-gunsmith-gold" />
                              <span className="font-medium text-gunsmith-text">Featured Listing</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.status === 'completed' 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {transaction.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gunsmith-text-secondary">Amount</p>
                              <p className="text-gunsmith-text font-medium">{formatAmount(transaction.amount_paid)}</p>
                            </div>
                            <div>
                              <p className="text-gunsmith-text-secondary">Duration</p>
                              <p className="text-gunsmith-text font-medium">{transaction.duration_days} days</p>
                            </div>
                            <div>
                              <p className="text-gunsmith-text-secondary">Date</p>
                              <p className="text-gunsmith-text font-medium">{formatDate(transaction.created_at)}</p>
                            </div>
                            <div>
                              <p className="text-gunsmith-text-secondary">Expires</p>
                              <p className="text-gunsmith-text font-medium">{formatDate(transaction.featured_until)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Listing Info */}
            <div className="card mt-8">
              <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">ABOUT FEATURED LISTINGS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">BENEFITS</h3>
                  <ul className="space-y-2 text-gunsmith-text-secondary text-sm">
                    <li>• Top placement in search results</li>
                    <li>• Featured badge on your listing</li>
                    <li>• Appear on the featured page</li>
                    <li>• Increased visibility and inquiries</li>
                    <li>• Priority in location-based searches</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">PRICING</h3>
                  <ul className="space-y-2 text-gunsmith-text-secondary text-sm">
                    <li>• $50 per month</li>
                    <li>• Only 3 featured slots available</li>
                    <li>• First-come, first-served basis</li>
                    <li>• Automatic renewal available</li>
                    <li>• Cancel anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Featured Checkout Modal */}
      {showFeaturedCheckout && (
        <FeaturedCheckout
          listingId={showFeaturedCheckout}
          businessName={listings.find(l => l.id === showFeaturedCheckout)?.business_name || 'Your Business'}
          onClose={() => setShowFeaturedCheckout(null)}
        />
      )}
    </div>
  )
}
