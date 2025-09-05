'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, Favorite } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface FavoritesContextType {
  favorites: Favorite[]
  loading: boolean
  isFavorited: (listingId: string) => boolean
  toggleFavorite: (listingId: string) => Promise<void>
  addFavorite: (listingId: string) => Promise<void>
  removeFavorite: (listingId: string) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Don't fetch while auth is still loading
    if (authLoading) {
      return
    }

    if (user && !initialized) {
      setInitialized(true)
      fetchFavorites()
    } else if (!user) {
      setFavorites([])
      setLoading(false)
      setInitialized(false)
    }
  }, [user, authLoading, initialized])

  async function fetchFavorites() {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          listing:listing_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching favorites:', error)
        // Don't throw - just log and continue
        setFavorites([])
      } else {
        setFavorites(data || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  function isFavorited(listingId: string): boolean {
    return favorites.some(fav => fav.listing_id === listingId)
  }

  async function addFavorite(listingId: string) {
    if (!user) return

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{
          user_id: user.id,
          listing_id: listingId,
        }])

      if (error) throw error

      // Refresh favorites
      await fetchFavorites()
    } catch (error) {
      console.error('Error adding favorite:', error)
      throw error
    }
  }

  async function removeFavorite(listingId: string) {
    if (!user) return

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId)

      if (error) throw error

      // Refresh favorites
      await fetchFavorites()
    } catch (error) {
      console.error('Error removing favorite:', error)
      throw error
    }
  }

  async function toggleFavorite(listingId: string) {
    if (isFavorited(listingId)) {
      await removeFavorite(listingId)
    } else {
      await addFavorite(listingId)
    }
  }

  return (
    <FavoritesContext.Provider value={{
      favorites,
      loading,
      isFavorited,
      toggleFavorite,
      addFavorite,
      removeFavorite,
    }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
