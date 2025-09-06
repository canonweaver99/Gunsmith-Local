'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Listing } from '@/lib/supabase'
import { MapPin, Navigation, Loader2 } from 'lucide-react'

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
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [customIcon, setCustomIcon] = useState<any>(null)
  const [userIcon, setUserIcon] = useState<any>(null)

  useEffect(() => {
    setIsClient(true)
    
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

    // Only create icons on client side
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        // Import the fix
        import('@/lib/leaflet-icon-fix')

        // Create custom icon using SVG
        const icon = new L.Icon({
          iconUrl: '/leaflet-svg/marker.svg',
          shadowUrl: '/leaflet/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
        setCustomIcon(icon)

        // Create user location icon
        const userLocationIcon = new L.Icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        })
        setUserIcon(userLocationIcon)
      })
    }
  }, [])

  // Filter listings with valid coordinates
  const listingsWithCoords = listings.filter(
    listing => listing.latitude && listing.longitude
  )

  // Calculate map center based on listings
  const getMapCenter = (): [number, number] => {
    if (selectedListing && selectedListing.latitude && selectedListing.longitude) {
      return [selectedListing.latitude, selectedListing.longitude]
    }
    
    if (listingsWithCoords.length > 0) {
      const avgLat = listingsWithCoords.reduce((sum, l) => sum + l.latitude!, 0) / listingsWithCoords.length
      const avgLng = listingsWithCoords.reduce((sum, l) => sum + l.longitude!, 0) / listingsWithCoords.length
      return [avgLat, avgLng]
    }

    if (userLocation) return userLocation
    
    // Default to US center
    return [39.8283, -98.5795]
  }

  // Calculate appropriate zoom level
  const getZoomLevel = () => {
    if (selectedListing) return 14
    if (listingsWithCoords.length === 1) return 13
    if (listingsWithCoords.length > 1) {
      // Calculate bounds
      const lats = listingsWithCoords.map(l => l.latitude!)
      const lngs = listingsWithCoords.map(l => l.longitude!)
      const latDiff = Math.max(...lats) - Math.min(...lats)
      const lngDiff = Math.max(...lngs) - Math.min(...lngs)
      const maxDiff = Math.max(latDiff, lngDiff)
      
      if (maxDiff > 10) return 5
      if (maxDiff > 5) return 7
      if (maxDiff > 2) return 9
      if (maxDiff > 0.5) return 11
      return 12
    }
    return 8
  }

  if (!isClient) {
    return (
      <div className={`${height} bg-gunsmith-accent/20 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin mx-auto mb-2" />
          <p className="text-gunsmith-text-secondary">Loading map...</p>
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
        {customIcon && listingsWithCoords.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude!, listing.longitude!]}
            icon={customIcon}
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
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {listing.street_address}
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
                
                <button
                  onClick={() => {
                    router.push(`/listings/${listing.slug}`)
                  }}
                  className="mt-3 w-full bg-gunsmith-gold text-gunsmith-black px-3 py-1 rounded text-sm font-medium hover:bg-gunsmith-goldenrod transition-colors"
                >
                  View Profile
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}