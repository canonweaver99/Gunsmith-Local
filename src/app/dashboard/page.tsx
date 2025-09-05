'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Listing } from '@/lib/supabase'
import { Plus, Edit, Eye, Trash2, Loader2, Building2, Star } from 'lucide-react'
import FeaturedSection from '@/components/dashboard/FeaturedSection'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [mounted, setMounted] = useState(false)

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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-bebas text-5xl text-gunsmith-gold mb-2">
                  MY DASHBOARD
                </h1>
                <p className="text-gunsmith-text-secondary">
                  Welcome back, {user?.email}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/messages" className="btn-secondary relative">
                  Messages
                  {unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gunsmith-gold text-gunsmith-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard/profile" className="btn-secondary">
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Section */}
        {listings.length > 0 && (
          <section className="py-12 px-4 bg-gunsmith-accent/10">
            <div className="container mx-auto">
              <div className="mb-8">
                <h2 className="font-bebas text-3xl text-gunsmith-gold mb-2 flex items-center gap-2">
                  <Star className="h-6 w-6" />
                  FEATURED LISTINGS
                </h2>
                <p className="text-gunsmith-text-secondary">
                  Get premium placement in your state for increased visibility
                </p>
              </div>
              <FeaturedSection listings={listings} />
            </div>
          </section>
        )}

        {/* Listings Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-bebas text-3xl text-gunsmith-gold">
                MY LISTINGS ({listings.length})
              </h2>
              <Link href="/add-business" className="btn-primary">
                <Plus className="h-5 w-5 mr-2" />
                Add New Listing
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="card text-center py-20">
                <Building2 className="h-16 w-16 text-gunsmith-gold/30 mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">
                  NO LISTINGS YET
                </h3>
                <p className="text-gunsmith-text-secondary mb-6">
                  Start by adding your first business listing
                </p>
                <Link href="/add-business" className="btn-primary inline-block">
                  Add Your First Listing
                </Link>
              </div>
            ) : (
              <div className="grid gap-6">
                {listings.map((listing) => (
                  <div key={listing.id} className="card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bebas text-2xl text-gunsmith-gold">
                            {listing.business_name}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded ${
                            listing.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {listing.status}
                          </span>
                          {listing.is_verified && (
                            <span className="px-2 py-1 text-xs rounded bg-gunsmith-gold/20 text-gunsmith-gold">
                              Verified
                            </span>
                          )}
                          {listing.is_featured && (
                            <span className="px-2 py-1 text-xs rounded bg-gunsmith-gold text-gunsmith-black">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gunsmith-text-secondary">
                          {listing.city}, {listing.state_province} • Views: {listing.view_count || 0}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link 
                          href={`/listings/${listing.slug}`}
                          className="btn-ghost text-sm flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                        <Link 
                          href={`/dashboard/listings/${listing.id}/edit`}
                          className="btn-ghost text-sm flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="btn-ghost text-sm flex items-center gap-1 text-gunsmith-error hover:text-gunsmith-error"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
