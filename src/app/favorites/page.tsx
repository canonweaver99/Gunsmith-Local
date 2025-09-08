'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { supabase } from '@/lib/supabase'
import { Listing } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ListingCard from '@/components/ListingCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Heart, HeartOff } from 'lucide-react'

export default function FavoritesPage() {
  const { user } = useAuth()
  const { favorites } = useFavorites()
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavoriteListings() {
      if (!user || favorites.length === 0) {
        setLoading(false)
        return
      }

      try {
        const listingIds = favorites.map(f => f.listing_id)
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .in('id', listingIds)

        if (error) throw error

        setFavoriteListings(data || [])
      } catch (error) {
        console.error('Error fetching favorite listings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavoriteListings()
  }, [user, favorites])

  if (!user) {
    return (
      <div className="min-h-screen bg-gunsmith-black">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gunsmith-gold mx-auto mb-4" />
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-4">FAVORITES</h1>
            <p className="text-gunsmith-text-secondary mb-8">
              Please log in to view your favorite gunsmiths.
            </p>
            <a href="/auth/login" className="btn-primary">
              Log In
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gunsmith-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-bebas text-4xl text-gunsmith-gold mb-2">YOUR FAVORITES</h1>
          <p className="text-gunsmith-text-secondary">
            Gunsmiths you've saved for later
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <HeartOff className="h-16 w-16 text-gunsmith-text-secondary mx-auto mb-4" />
            <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">NO FAVORITES YET</h2>
            <p className="text-gunsmith-text-secondary mb-8">
              Start browsing gunsmiths and save your favorites for easy access.
            </p>
            <a href="/listings" className="btn-primary">
              Browse Gunsmiths
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
