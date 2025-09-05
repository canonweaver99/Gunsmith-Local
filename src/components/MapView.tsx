'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Listing } from '@/lib/supabase'
import { MapPin, Navigation, Loader2 } from 'lucide-react'
import L from 'leaflet'
import '@/lib/leaflet-icon-fix'

// Dynamically import the map component to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gunsmith-accent/20 rounded-lg flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
    </div>
  ),
})

const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
})

const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
})

const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})

interface MapViewProps {
  listings: Listing[]
  selectedListing?: Listing | null
  onListingSelect?: (listing: Listing) => void
  className?: string
  height?: string
}

export default function MapView({ 
  listings, 
  selectedListing, 
  onListingSelect,
  className = '',
  height = 'h-96'
}: MapViewProps) {
  const [isClient, setIsClient] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [customIcon, setCustomIcon] = useState<L.Icon | null>(null)
  const [userIcon, setUserIcon] = useState<L.Icon | null>(null)

  useEffect(() => {
    setIsClient(true)
    
    // Create custom marker icons
    if (typeof window !== 'undefined') {
      const icon = L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C7.16 0 0 7.16 0 16C0 24.84 16 40 16 40C16 40 32 24.84 32 16C32 7.16 24.84 0 16 0Z" fill="#d4af37"/>
            <path d="M16 4C11.58 4 8 7.58 8 12C8 16.42 16 24 16 24C16 24 24 16.42 24 12C24 7.58 20.42 4 16 4Z" fill="#0a0a0a"/>
            <circle cx="16" cy="12" r="3" fill="#d4af37"/>
          </svg>
        `),
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
      })
      setCustomIcon(icon)
      
      const userLocationIcon = L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#3b82f6" opacity="0.3"/>
            <circle cx="12" cy="12" r="4" fill="#3b82f6"/>
            <circle cx="12" cy="12" r="10" stroke="#3b82f6" stroke-width="2" fill="none"/>
          </svg>
        `),
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      })
      setUserIcon(userLocationIcon)
    }
    
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }, [])

  // Filter listings that have coordinates
  const listingsWithCoords = listings.filter(
    listing => listing.latitude && listing.longitude
  )

  // Calculate center of map
  const getMapCenter = (): [number, number] => {
    if (selectedListing?.latitude && selectedListing?.longitude) {
      return [selectedListing.latitude, selectedListing.longitude]
    }
    
    if (userLocation) {
      return userLocation
    }

    if (listingsWithCoords.length > 0) {
      const avgLat = listingsWithCoords.reduce((sum, listing) => sum + (listing.latitude || 0), 0) / listingsWithCoords.length
      const avgLng = listingsWithCoords.reduce((sum, listing) => sum + (listing.longitude || 0), 0) / listingsWithCoords.length
      return [avgLat, avgLng]
    }

    // Default to center of US
    return [39.8283, -98.5795]
  }

  // Calculate zoom level
  const getZoomLevel = (): number => {
    if (selectedListing) return 15
    if (listingsWithCoords.length === 1) return 12
    if (listingsWithCoords.length <= 5) return 10
    return 8
  }

  if (!isClient) {
    return (
      <div className={`${height} bg-gunsmith-accent/20 rounded-lg flex items-center justify-center ${className}`}>
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  if (listingsWithCoords.length === 0) {
    return (
      <div className={`${height} bg-gunsmith-accent/20 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
          <p className="text-gunsmith-text-secondary">No locations available to display on map</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${height} rounded-lg overflow-hidden border border-gunsmith-border ${className}`}>
      <MapContainer
        center={getMapCenter()}
        zoom={getZoomLevel()}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* User location marker */}
        {userLocation && userIcon && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <Navigation className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                <p className="text-sm font-medium">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Listing markers */}
        {listingsWithCoords.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude!, listing.longitude!]}
            icon={customIcon || undefined}
            eventHandlers={{
              click: () => onListingSelect?.(listing),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">
                  {listing.business_name}
                </h3>
                
                {listing.short_description && (
                  <p className="text-sm text-gunsmith-text-secondary mb-2">
                    {listing.short_description}
                  </p>
                )}
                
                <div className="space-y-1 text-sm">
                  {listing.street_address && (
                    <p className="text-gunsmith-text">
                      📍 {listing.street_address}
                      {listing.city && `, ${listing.city}`}
                      {listing.state_province && `, ${listing.state_province}`}
                    </p>
                  )}
                  
                  {listing.phone && (
                    <p className="text-gunsmith-text">
                      📞 {listing.phone}
                    </p>
                  )}
                  
                  {listing.category && (
                    <p className="text-gunsmith-text">
                      🏷️ {listing.category}
                    </p>
                  )}
                </div>
                
                {onListingSelect && (
                  <button
                    onClick={() => onListingSelect(listing)}
                    className="mt-3 w-full bg-gunsmith-gold text-gunsmith-black px-3 py-1 rounded text-sm font-medium hover:bg-gunsmith-goldenrod transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
