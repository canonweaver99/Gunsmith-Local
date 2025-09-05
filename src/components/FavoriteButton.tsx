'use client'

import { useState } from 'react'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Heart, Loader2 } from 'lucide-react'

interface FavoriteButtonProps {
  listingId: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function FavoriteButton({ 
  listingId, 
  size = 'md', 
  showText = false,
  className = ''
}: FavoriteButtonProps) {
  const { user } = useAuth()
  const { isFavorited, toggleFavorite, loading } = useFavorites()
  const analytics = useAnalytics()
  const [toggling, setToggling] = useState(false)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  async function handleToggle() {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login'
      return
    }

    setToggling(true)
    try {
      const wasFavorited = isFavorited(listingId)
      await toggleFavorite(listingId)
      
      // Track favorite action
      analytics.trackListingFavorite(listingId, 'Unknown Business', wasFavorited ? 'remove' : 'add')
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setToggling(false)
    }
  }

  const favorited = isFavorited(listingId)
  const isDisabled = loading || toggling

  return (
    <button
      onClick={handleToggle}
      disabled={isDisabled}
      className={`
        flex items-center gap-2 transition-all duration-200
        ${favorited 
          ? 'text-gunsmith-gold hover:text-gunsmith-goldenrod' 
          : 'text-gunsmith-text-secondary hover:text-gunsmith-gold'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isDisabled ? (
        <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      ) : (
        <Heart 
          className={`${sizeClasses[size]} ${
            favorited ? 'fill-current' : ''
          }`} 
        />
      )}
      {showText && (
        <span className={textSizeClasses[size]}>
          {favorited ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}
