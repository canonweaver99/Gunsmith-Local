'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MapView from '@/components/MapView'
import { supabase, Listing } from '@/lib/supabase'
import { Loader2, MapPin, Filter, Search, X } from 'lucide-react'
import Link from 'next/link'

export default function MapPage() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: '',
    state: '',
  })
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  useEffect(() => {
    fetchListings()
  }, [filters])

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    setFilters(prev => ({ ...prev, search: searchInput }))
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  async function fetchListings() {
    try {
      setLoading(true)
      setError('')

      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      // Apply search filter
      if (filters.search) {
        query = query.or(`business_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%,state_province.ilike.%${filters.search}%,postal_code.ilike.%${filters.search}%`)
      }

      // Apply category filter
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      // Apply state filter
      if (filters.state) {
        query = query.eq('state_province', filters.state)
      }

      const { data, error } = await query

      if (error) throw error

      setListings(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  function handleListingSelect(listing: Listing) {
    setSelectedListing(listing)
  }

  function handleFilterChange(key: string, value: string) {
    // For dropdowns, update immediately
    if (key === 'category' || key === 'state') {
      setFilters(prev => ({ ...prev, [key]: value }))
    }
  }

  function clearFilters() {
    setFilters({ search: '', category: '', state: '' })
    setSearchInput('')
  }

  // Get unique categories and states for filter options
  const categories = [...new Set(listings.map(l => l.category).filter(Boolean))]
  const states = [...new Set(listings.map(l => l.state_province).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gunsmith-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
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
          <h1 className="font-bebas text-4xl text-gunsmith-gold mb-4">GUNSMITH MAP</h1>
          <p className="text-gunsmith-text-secondary">
            Find gunsmiths near you on our interactive map
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gunsmith-text-secondary" />
                <input
                  type="text"
                  placeholder="Search by name, city, or description..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="input pl-10"
                />
              </div>
              <button
                type="submit"
                className="btn-primary px-6"
              >
                Search
              </button>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* Clear Filters */}
            {(filters.search || filters.category || filters.state) && (
              <button
                onClick={clearFilters}
                className="btn-outline flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gunsmith-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">State</label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="input"
                  >
                    <option value="">All States</option>
                    {states.map(state => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gunsmith-text-secondary">
            Showing {listings.length} gunsmith{listings.length !== 1 ? 's' : ''} on map
          </p>
          
          <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
            <MapPin className="h-4 w-4" />
            <span>Click markers for details</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Map */}
        <div className="card p-0 overflow-hidden">
          <MapView
            listings={listings}
            selectedListing={selectedListing}
            onListingSelect={handleListingSelect}
            height="h-[600px]"
          />
        </div>

        {/* Selected Listing Details */}
        {selectedListing && (
          <div className="mt-6 card">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bebas text-2xl text-gunsmith-gold">
                {selectedListing.business_name}
              </h3>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-gunsmith-text-secondary hover:text-gunsmith-gold"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {selectedListing.short_description && (
                  <p className="text-gunsmith-text-secondary mb-4">
                    {selectedListing.short_description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {selectedListing.street_address && (
                    <p className="text-gunsmith-text">
                      📍 {selectedListing.street_address}
                      {selectedListing.city && `, ${selectedListing.city}`}
                      {selectedListing.state_province && `, ${selectedListing.state_province}`}
                      {selectedListing.postal_code && ` ${selectedListing.postal_code}`}
                    </p>
                  )}
                  
                  {selectedListing.phone && (
                    <p className="text-gunsmith-text">
                      📞 {selectedListing.phone}
                    </p>
                  )}
                  
                  {selectedListing.email && (
                    <p className="text-gunsmith-text">
                      ✉️ {selectedListing.email}
                    </p>
                  )}
                  
                  {selectedListing.category && (
                    <p className="text-gunsmith-text">
                      🏷️ {selectedListing.category}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href={`/listings/${selectedListing.slug}`}
                  className="btn-primary text-center"
                >
                  View Full Profile
                </Link>
                
                {selectedListing.website && (
                  <a
                    href={selectedListing.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-center"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {listings.length === 0 && !loading && (
          <div className="card text-center py-12">
            <MapPin className="h-16 w-16 text-gunsmith-gold mx-auto mb-4" />
            <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">
              No Gunsmiths Found
            </h3>
            <p className="text-gunsmith-text-secondary mb-6">
              Try adjusting your search criteria or browse all listings
            </p>
            <Link href="/listings" className="btn-primary">
              Browse All Listings
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
