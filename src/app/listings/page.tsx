'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ListingCard from '@/components/ListingCard'
import MapView from '@/components/MapView'
import AdvancedFilters from '@/components/AdvancedFilters'
import { useAnalytics } from '@/hooks/useAnalytics'
import { GUNSMITH_SPECIALTIES, ALL_SPECIALTIES } from '@/lib/gunsmith-specialties'
import { supabase, Listing } from '@/lib/supabase'
import { Search, Filter, MapPin, Loader2, Map as MapIcon, SlidersHorizontal } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

function ListingsContent() {
  const searchParams = useSearchParams()
  const analytics = useAnalytics()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '')
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<any>(null)
  const [listingsWithRatings, setListingsWithRatings] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'rating' | 'newest'>('featured')
  const [showWizardMessage, setShowWizardMessage] = useState(false)
  const [bestMatch, setBestMatch] = useState<Listing | null>(null)
  const PAGE_SIZE = 30
  const [page, setPage] = useState(1)
  const cameFromWizard = searchParams.get('fromWizard') === 'true'

  useEffect(() => {
    fetchListings()
    
    // Process wizard parameters
    if (searchParams.get('fromWizard') === 'true') {
      setShowWizardMessage(true)
      
      // Set location search
      const location = searchParams.get('location')
      if (location) {
        setSearchTerm(location)
        setSearchInput(location)
      }
      
      // Set gun type filter
      const gunType = searchParams.get('gunType')
      
      // Set services filter
      const services = searchParams.get('services')
      if (services) {
        const servicesList = services.split(',')
        setAdvancedFilters({
          categories: [],
          states: [],
          services: servicesList,
          minRating: null,
          isVerified: false,
          isOpenNow: false
        })
      }
      
      // Set delivery method filter
      const delivery = searchParams.get('delivery')
      // Note: We'll handle delivery method in filtering logic
    }
  }, [])

  useEffect(() => {
    filterListings()
    setPage(1) // reset to first page on filter/sort changes
  }, [listings, searchTerm, selectedCategory, selectedState, advancedFilters, listingsWithRatings, sortBy])

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    setSearchTerm(searchInput)
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  async function fetchListings() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch ratings for each listing
      const listingsData = data || []
      const listingsWithRatingData = await Promise.all(
        listingsData.map(async (listing) => {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('listing_id', listing.id)
          
          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : null
          
          return { ...listing, avgRating, reviewCount: reviews?.length || 0 }
        })
      )

      setListings(listingsData)
      setListingsWithRatings(listingsWithRatingData)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterListings() {
    let filtered = [...listings]

    // Search filter with state normalization (e.g., Texas ↔ TX)
    if (searchTerm) {
      const q = String(searchTerm).toLowerCase().trim()
      const STATE_NAME_TO_CODE: Record<string, string> = {
        'alabama':'al','alaska':'ak','arizona':'az','arkansas':'ar','california':'ca','colorado':'co','connecticut':'ct','delaware':'de','florida':'fl','georgia':'ga','hawaii':'hi','idaho':'id','illinois':'il','indiana':'in','iowa':'ia','kansas':'ks','kentucky':'ky','louisiana':'la','maine':'me','maryland':'md','massachusetts':'ma','michigan':'mi','minnesota':'mn','mississippi':'ms','missouri':'mo','montana':'mt','nebraska':'ne','nevada':'nv','new hampshire':'nh','new jersey':'nj','new mexico':'nm','new york':'ny','north carolina':'nc','north dakota':'nd','ohio':'oh','oklahoma':'ok','oregon':'or','pennsylvania':'pa','rhode island':'ri','south carolina':'sc','south dakota':'sd','tennessee':'tn','texas':'tx','utah':'ut','vermont':'vt','virginia':'va','washington':'wa','west virginia':'wv','wisconsin':'wi','wyoming':'wy','district of columbia':'dc'
      }
      const CODE_TO_NAME: Record<string, string> = Object.fromEntries(Object.entries(STATE_NAME_TO_CODE).map(([k,v]) => [v,k]))
      const tokens = new Set<string>([q])
      if (STATE_NAME_TO_CODE[q]) tokens.add(STATE_NAME_TO_CODE[q])
      if (CODE_TO_NAME[q]) tokens.add(CODE_TO_NAME[q])

      filtered = filtered.filter(listing => {
        const name = String(listing.business_name || '').toLowerCase()
        const desc = String(listing.description || '').toLowerCase()
        const city = String(listing.city || '').toLowerCase()
        const zip = String(listing.postal_code || '').toLowerCase()
        const state = String(listing.state_province || '').toLowerCase()
        const stateNorm = tokens.has(state) || tokens.has(STATE_NAME_TO_CODE[state] || '') || tokens.has(CODE_TO_NAME[state] || '')
        const tagHit = (listing.tags || []).some((t: string) => String(t).toLowerCase().includes(q))
        return name.includes(q) || desc.includes(q) || city.includes(q) || zip.includes(q) || state.includes(q) || stateNorm || tagHit
      })
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(listing => listing.category === selectedCategory)
    }

    // State filter
    if (selectedState) {
      filtered = filtered.filter(listing => listing.state_province === selectedState)
    }

    // Apply advanced filters if set
    if (advancedFilters) {
      let beforeServices = [...filtered]
      // Categories filter (from advanced)
      if (advancedFilters.categories.length > 0) {
        filtered = filtered.filter(listing => 
          listing.category && advancedFilters.categories.includes(listing.category)
        )
      }

      // States filter (from advanced)
      if (advancedFilters.states.length > 0) {
        filtered = filtered.filter(listing => 
          listing.state_province && advancedFilters.states.includes(listing.state_province)
        )
      }

      // Minimum rating filter
      if (advancedFilters.minRating !== null && listingsWithRatings.length > 0) {
        const ratingsMap = new Map(listingsWithRatings.map(l => [l.id, l.avgRating]))
        filtered = filtered.filter(listing => {
          const rating = ratingsMap.get(listing.id)
          return rating !== null && rating >= advancedFilters.minRating
        })
      }

      // Services filter (relaxed: match by exact tag OR same parent category)
      if (advancedFilters.services.length > 0) {
        // Build mapping from service -> group and label -> key
        const serviceToGroup = new Map<string, string>()
        const labelToKey = new Map<string, string>()
        GUNSMITH_SPECIALTIES.forEach(g => {
          labelToKey.set(g.label.toLowerCase(), g.key)
          g.items.forEach(i => serviceToGroup.set(i.toLowerCase(), g.key))
        })

        const selectedServices = advancedFilters.services.map((s: string) => s.toLowerCase())
        const selectedGroups = new Set<string>()
        selectedServices.forEach(s => {
          const grp = serviceToGroup.get(s) || labelToKey.get(s)
          if (grp) selectedGroups.add(grp)
        })

        filtered = filtered.filter(listing => {
          const tags = (listing.tags || []).map((t: string) => t.toLowerCase())
          // Exact tag match
          const exact = tags.some(t => selectedServices.includes(t))
          if (exact) return true
          // Group match
          const groups = new Set(tags.map(t => serviceToGroup.get(t)).filter(Boolean) as string[])
          return [...selectedGroups].some(g => groups.has(g))
        })
      }

      // Verified filter
      if (advancedFilters.isVerified === true) {
        filtered = filtered.filter(listing => listing.is_verified === true)
      }

      // Featured filter
      if (advancedFilters.isFeatured === true) {
        filtered = filtered.filter(listing => listing.is_featured === true)
      }

      // Open now filter
      if (advancedFilters.isOpen === true) {
        const now = new Date()
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const currentDay = days[now.getDay()]
        const currentTime = now.getHours() * 60 + now.getMinutes()

        filtered = filtered.filter(listing => {
          if (!listing.business_hours) return false
          const todayHours = listing.business_hours[currentDay]
          if (!todayHours || todayHours.closed) return false
          
          const [openHour, openMin] = todayHours.open.split(':').map(Number)
          const [closeHour, closeMin] = todayHours.close.split(':').map(Number)
          
          const openTime = openHour * 60 + openMin
          const closeTime = closeHour * 60 + closeMin
          
          return currentTime >= openTime && currentTime < closeTime
        })
      }

      // Has images filter
      if (advancedFilters.hasImages === true) {
        filtered = filtered.filter(listing => 
          listing.logo_url || listing.cover_image_url || 
          (listing.image_gallery && listing.image_gallery.length > 0)
        )
      }

      // Year established filter
      if (advancedFilters.yearEstablishedMin !== null) {
        filtered = filtered.filter(listing => 
          listing.year_established && listing.year_established >= advancedFilters.yearEstablishedMin
        )
      }
      if (advancedFilters.yearEstablishedMax !== null) {
        filtered = filtered.filter(listing => 
          listing.year_established && listing.year_established <= advancedFilters.yearEstablishedMax
        )
      }
      // If no results and services were requested, allow listings without tags as fallback
      if (advancedFilters.services.length > 0 && filtered.length === 0) {
        filtered = beforeServices.filter(l => !l.tags || l.tags.length === 0)
      }
    }

    // If coming from wizard, compute ranking score per listing
    const fromWizard = searchParams.get('fromWizard') === 'true'
    const wizardPrefs = getWizardPreferences()
    let scoresMap: Map<string, number> | null = null
    if (fromWizard) {
      scoresMap = new Map()
      filtered.forEach((l) => {
        const s = calculateGunsmithScore(l as any, wizardPrefs)
        scoresMap!.set(l.id, s)
      })
      // Sort by score desc first; stable sort by featured/date remains via fallback later
      filtered.sort((a, b) => (scoresMap!.get(b.id)! - scoresMap!.get(a.id)!))
      // Set best match for highlight card
      setBestMatch(filtered[0] || null)
    } else {
      setBestMatch(null)
    }

    // Apply sorting (UI-driven override after wizard sort)
    const ratingsMap = new Map(listingsWithRatings.map(l => [l.id, l.avgRating]))
    
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.business_name.localeCompare(b.business_name))
        break
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = ratingsMap.get(a.id) || 0
          const ratingB = ratingsMap.get(b.id) || 0
          return ratingB - ratingA
        })
        break
      case 'newest':
        filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
      case 'featured':
      default:
        // Keep the default sorting (featured first, then by date)
        break
    }

    setFilteredListings(filtered)
    // If current page overflows after filtering, clamp it
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    if (page > totalPages) setPage(totalPages)
    
    // Track search if there's a search term or filters
    if (searchTerm || selectedCategory || selectedState || (advancedFilters && Object.values(advancedFilters).some(v => v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)))) {
      const activeFilters = []
      if (selectedCategory) activeFilters.push(`category:${selectedCategory}`)
      if (selectedState) activeFilters.push(`state:${selectedState}`)
      if (advancedFilters?.categories?.length) activeFilters.push(`categories:${advancedFilters.categories.join(',')}`)
      if (advancedFilters?.states?.length) activeFilters.push(`states:${advancedFilters.states.join(',')}`)
      if (advancedFilters?.minRating) activeFilters.push(`minRating:${advancedFilters.minRating}`)
      if (advancedFilters?.isVerified) activeFilters.push('verified:true')
      if (advancedFilters?.isFeatured) activeFilters.push('featured:true')
      if (advancedFilters?.isOpen) activeFilters.push('open:true')
      
      analytics.trackSearch(searchTerm || 'browse', filtered.length, activeFilters)
    }
  }

  // Build user preferences object from URL params
  function getWizardPreferences() {
    const location = searchParams.get('location') || ''
    const gunTypes = (searchParams.get('gunTypes') || '').split(',').filter(Boolean)
    const services = (searchParams.get('services') || '').split(',').filter(Boolean)
    const delivery = (searchParams.get('delivery') || 'both') as 'in-person' | 'shipping' | 'both'
    return { location, gunTypes, services, delivery }
  }

  // Utilities for ranking
  function calculateGunsmithScore(listing: any, prefs: any): number {
    let score = 0

    // Location (very basic: same city/state boost; distance fallback TODO)
    if (prefs.location && listing.city && listing.city.toLowerCase() === prefs.location.toLowerCase()) score += 30
    else if (prefs.location && listing.state_province && listing.state_province.toLowerCase().includes(prefs.location.toLowerCase())) score += 5

    // Gun type match (treat tags containing types)
    const gunTypes = prefs.gunTypes || []
    if (gunTypes.length > 0) {
      const hasMatch = (listing.tags || []).some((t: string) => gunTypes.some((g: string) => t.toLowerCase().includes(g.toLowerCase())))
      if (hasMatch) score += 20
      else if (gunTypes.includes('other')) score += 10
    } else {
      score += 10
    }

    // Service match using category mapping
    const selectedServices = prefs.services || []
    if (selectedServices.length > 0) {
      const relatedSet = new Set<string>()
      // Build category lookup: service -> group key
      const serviceToGroup = new Map<string, string>()
      GUNSMITH_SPECIALTIES.forEach(g => g.items.forEach(i => serviceToGroup.set(i.toLowerCase(), g.key)))

      const listingTags = (listing.tags || []).map((t: string) => t.toLowerCase())
      const exact = listingTags.some((t: string) => selectedServices.some((s: string) => t === s.toLowerCase()))
      if (exact) score += 35
      else {
        // Related: same group
        const selectedGroups = new Set(selectedServices.map((s: string) => serviceToGroup.get(s.toLowerCase())).filter(Boolean) as string[])
        const listingGroups = new Set(listingTags.map((t: string) => serviceToGroup.get(t)).filter(Boolean) as string[])
        const hasRelated = [...selectedGroups].some(g => listingGroups.has(g))
        if (hasRelated) score += 25
        else if (listingTags.includes('other') || listingTags.includes('other services')) score += 10
      }
    }

    // Gun-type specialization bonus using listing.specialties (Rifle, Pistol, Sniper, Shotgun, Other)
    if (Array.isArray(listing.specialties) && listing.specialties.length > 0) {
      const listingSpecs = (listing.specialties || []).map((s: string) => String(s).toLowerCase())
      const userTypes = (prefs.gunTypes || []).map((s: string) => String(s).toLowerCase())
      let matches = 0
      userTypes.forEach((t: string) => { if (listingSpecs.includes(t)) matches += 1 })
      if (matches > 0) {
        // +12 per match, capped at +18
        score += Math.min(18, matches * 12)
      } else if (userTypes.includes('other') && listingSpecs.includes('other')) {
        score += 8
      }
    }

    // Delivery preference
    const pref = prefs.delivery
    const offersBoth = listing.delivery_method === 'both'
    if (pref === 'both') score += 15
    else if (listing.delivery_method === pref) score += 15
    else if (offersBoth) score += 10

    // Quality bonuses
    score += calculateQualityBonus(listing)

    // Featured multiplier
    if (listing.is_featured) score *= 1.15

    return score
  }

  function calculateQualityBonus(listing: any): number {
    let bonus = 0
    if (listing.business_hours) bonus += 2
    if (listing.cover_image_url || listing.logo_url || (listing.image_gallery && listing.image_gallery.length > 0)) bonus += 3
    if (listing.description && listing.description.length > 40) bonus += 3
    if (listing.website || listing.facebook_url || listing.instagram_url) bonus += 2

    // Specialization bonus: multiple items in same category as any selected service
    const prefs = getWizardPreferences()
    const selected = prefs.services || []
    if (selected.length > 0) {
      const serviceToGroup = new Map<string, string>()
      GUNSMITH_SPECIALTIES.forEach(g => g.items.forEach(i => serviceToGroup.set(i.toLowerCase(), g.key)))
      const selectedGroups = new Set(selected.map((s: string) => serviceToGroup.get(s.toLowerCase())).filter(Boolean) as string[])
      const listingGroups = (listing.tags || []).map((t: string) => serviceToGroup.get(String(t).toLowerCase())).filter(Boolean) as string[]
      const counts: Record<string, number> = {}
      listingGroups.forEach(g => { counts[g] = (counts[g] || 0) + 1 })
      if ([...selectedGroups].some(g => (counts[g] || 0) >= 2)) bonus += 10
    }

    // Availability bonus (basic: open now + weekend)
    const now = new Date()
    const dayIdx = now.getDay()
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    const currentDay = days[dayIdx]
    if (listing.business_hours && listing.business_hours[currentDay] && !listing.business_hours[currentDay].closed) {
      bonus += 5
    }
    const weekendOpen = listing.business_hours && ((listing.business_hours['saturday'] && !listing.business_hours['saturday'].closed) || (listing.business_hours['sunday'] && !listing.business_hours['sunday'].closed))
    if (weekendOpen) bonus += 5

    return bonus
  }

  // Get unique categories and states for filters
  const categories = [...new Set(listings.map(l => l.category).filter(Boolean))]
  const states = [...new Set(listings.map(l => l.state_province).filter(Boolean))]
  
  // Available services for filters: use canonical list so users can filter by any service
  const services = ALL_SPECIALTIES

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Page Header */}
        <section className="bg-gunsmith-accent/20 py-12 px-4">
          <div className="container mx-auto">
            <h1 className="font-bebas text-5xl md:text-6xl text-gunsmith-gold mb-4 text-center">
              FIND A GUNSMITH
            </h1>
            <p className="text-center text-gunsmith-text-secondary max-w-2xl mx-auto">
              {showWizardMessage 
                ? "Here are the gunsmiths that match your requirements. You can adjust the filters below to refine your search."
                : "Browse our directory of professional gunsmiths across the country. Find the right expert for your firearm needs."
              }
            </p>

            {/* Best Match highlight when coming from wizard */}
            {cameFromWizard && bestMatch && (
              <div className="mt-8">
                <div className="max-w-4xl mx-auto">
                  <div className="mb-3 inline-flex items-center gap-2 bg-gunsmith-gold text-gunsmith-black px-4 py-2 rounded-full">
                    <span className="font-montserrat font-semibold">Best Match</span>
                  </div>
                  <ListingCard listing={bestMatch as any} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Search and Filters */}
        <section className="py-8 px-4 bg-gunsmith-black sticky top-0 z-10 border-b border-gunsmith-border">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative flex-grow flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold" />
                  <input
                    type="text"
                    placeholder="Search by name, city, or service..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="input pl-10 w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary px-6"
                >
                  Search
                </button>
              </form>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input min-w-[200px]"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* State Filter */}
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="input min-w-[150px]"
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Results Count and View Toggle */}
            <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
              <div className="text-sm text-gunsmith-text-secondary">
                {(() => {
                  const total = filteredListings.length
                  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
                  const end = Math.min(total, page * PAGE_SIZE)
                  return `Showing ${start}-${end} of ${total} listings`
                })()}
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gunsmith-text-secondary">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="input text-sm py-1 px-3"
                  >
                    <option value="featured">Featured</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
                
                {/* View Toggle */}
                <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded font-montserrat font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'list' 
                      ? 'bg-gunsmith-gold text-gunsmith-black' 
                      : 'bg-gunsmith-accent text-gunsmith-text hover:bg-gunsmith-gold hover:text-gunsmith-black'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded font-montserrat font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'map' 
                      ? 'bg-gunsmith-gold text-gunsmith-black' 
                      : 'bg-gunsmith-accent text-gunsmith-text hover:bg-gunsmith-gold hover:text-gunsmith-black'
                  }`}
                >
                  <MapIcon className="h-4 w-4" />
                  Map
                </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Filters */}
        <section className="py-6 px-4 border-b border-gunsmith-border">
          <div className="container mx-auto">
            <AdvancedFilters
              onFiltersChange={setAdvancedFilters}
              availableStates={states}
              availableServices={services}
            />
          </div>
        </section>

        {/* Listings Grid */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {/* Top pagination */}
            {filteredListings.length > PAGE_SIZE && (
              <div className="flex items-center justify-between mb-6">
                <button
                  className="btn-secondary text-sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-sm text-gunsmith-text-secondary">Page {page} of {Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE))}</span>
                <button
                  className="btn-secondary text-sm"
                  onClick={() => setPage(p => Math.min(Math.ceil(filteredListings.length / PAGE_SIZE), p + 1))}
                  disabled={page >= Math.ceil(filteredListings.length / PAGE_SIZE)}
                >
                  Next
                </button>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-20">
                <MapPin className="h-16 w-16 text-gunsmith-gold/30 mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">
                  NO LISTINGS FOUND
                </h3>
                <p className="text-gunsmith-text-secondary">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            ) : viewMode === 'list' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings
                    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                    .map(listing => (
                      <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                {/* Bottom pagination */}
                {filteredListings.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between mt-8">
                    <button
                      className="btn-secondary text-sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gunsmith-text-secondary">Page {page} of {Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE))}</span>
                    <button
                      className="btn-secondary text-sm"
                      onClick={() => setPage(p => Math.min(Math.ceil(filteredListings.length / PAGE_SIZE), p + 1))}
                      disabled={page >= Math.ceil(filteredListings.length / PAGE_SIZE)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="card p-0 overflow-hidden">
                <MapView
                  listings={filteredListings}
                  height="h-[600px]"
                />
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <ListingsContent />
    </Suspense>
  )
}
