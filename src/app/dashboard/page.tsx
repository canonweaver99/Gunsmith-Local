'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Listing } from '@/lib/supabase'
import { Plus, Edit, Eye, Trash2, Loader2, Building2, Star, MapPin, Phone, Mail, Globe, User, MessageSquare, Sparkles } from 'lucide-react'
import FeaturedCheckout from '@/components/FeaturedCheckout'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showFeaturedCheckout, setShowFeaturedCheckout] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || authLoading) {
      return
    }

    if (!user) {
      router.push('/auth/login')
    } else {
      fetchUserListings()
    }
  }, [user, authLoading, router, mounted])


  async function fetchUserListings() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setListings(data || [])
      
      // Also fetch unread message count
      if (data && data.length > 0) {
        const { data: messagesData, error: messagesError } = await supabase
          .from('contact_messages')
          .select('id')
          .in('listing_id', data.map(l => l.id))
          .eq('status', 'unread')

        if (!messagesError) {
          setUnreadMessages(messagesData?.length || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteListing(id: string) {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
        .eq('owner_id', user?.id)

      if (error) throw error
      
      setListings(listings.filter(l => l.id !== id))
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Failed to delete listing')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Dashboard Header */}
        <section className="bg-gunsmith-accent/20 py-12 px-4">
          <div className="container mx-auto">
            <h1 className="font-bebas text-5xl text-gunsmith-gold mb-2">
              MY BUSINESS
            </h1>
            <p className="text-gunsmith-text-secondary">
              Manage your gunsmith business listing
            </p>
          </div>
        </section>



        {/* Business Profile Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {listings.length === 0 ? (
              <div className="card text-center py-20">
                <Building2 className="h-16 w-16 text-gunsmith-gold/30 mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">
                  NO BUSINESS LISTING YET
                </h3>
                <p className="text-gunsmith-text-secondary mb-6">
                  Start by adding your business to GunsmithLocal
                </p>
                <Link href="/add-business" className="btn-primary inline-block">
                  Add Your Business
                </Link>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {listings.map((listing) => (
                  <div key={listing.id} className="space-y-8">
                    {/* Business Info Card */}
                    <div className="card">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bebas text-3xl text-gunsmith-gold">
                          {listing.business_name}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-sm rounded ${
                            listing.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {listing.status}
                          </span>
                          {listing.is_verified && (
                            <span className="px-3 py-1 text-sm rounded bg-gunsmith-gold/20 text-gunsmith-gold">
                              ✓ Verified
                            </span>
                          )}
                          {listing.is_featured && (
                            <span className="px-3 py-1 text-sm rounded bg-gunsmith-gold text-gunsmith-black font-medium">
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-oswald text-gunsmith-gold mb-3">Business Details</h3>
                          <div className="space-y-2 text-gunsmith-text">
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gunsmith-gold" />
                              {listing.street_address}, {listing.city}, {listing.state_province} {listing.postal_code}
                            </p>
                            {listing.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gunsmith-gold" />
                                {listing.phone}
                              </p>
                            )}
                            {listing.email && (
                              <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gunsmith-gold" />
                                {listing.email}
                              </p>
                            )}
                            {listing.website && (
                              <p className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gunsmith-gold" />
                                <a href={listing.website} target="_blank" rel="noopener noreferrer" className="hover:text-gunsmith-gold">
                                  Visit Website
                                </a>
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-oswald text-gunsmith-gold mb-3">Performance</h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-gunsmith-text-secondary text-sm">Total Views</p>
                              <p className="font-bebas text-2xl text-gunsmith-gold">{listing.view_count || 0}</p>
                            </div>
                            <div>
                              <p className="text-gunsmith-text-secondary text-sm">Unread Messages</p>
                              <p className="font-bebas text-2xl text-gunsmith-gold">{unreadMessages}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gunsmith-border">
                        <Link 
                          href={`/listings/${listing.slug}`}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Listing
                        </Link>
                        <Link 
                          href={`/dashboard/listings/${listing.id}/edit`}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Details
                        </Link>
                        <Link 
                          href="/dashboard/profile"
                          className="btn-secondary flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Edit Profile
                        </Link>
                        <Link 
                          href="/dashboard/messages"
                          className="btn-secondary flex items-center gap-2 relative"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Messages
                          {unreadMessages > 0 && (
                            <span className="absolute -top-1 -right-1 bg-gunsmith-gold text-gunsmith-black text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                              {unreadMessages}
                            </span>
                          )}
                        </Link>
                      </div>
                    </div>

                    {/* Get Featured Card */}
                    {!listing.is_featured && (
                      <div className="card bg-gradient-to-br from-gunsmith-gold/10 to-transparent border-gunsmith-gold/30">
                        <div className="text-center">
                          <Star className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                          <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">
                            BOOST YOUR VISIBILITY
                          </h3>
                          <p className="text-gunsmith-text mb-6 max-w-md mx-auto">
                            Get featured in your state for premium placement and increased customer inquiries
                          </p>
                          <button 
                            onClick={() => setShowFeaturedCheckout(listing.id)}
                            className="btn-primary inline-flex items-center gap-2"
                          >
                            <Sparkles className="h-5 w-5" />
                            Get Featured Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
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
