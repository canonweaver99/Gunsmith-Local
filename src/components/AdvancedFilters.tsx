'use client'

import { useState, useEffect } from 'react'
import { 
  Filter, 
  X, 
  Star, 
  DollarSign, 
  Clock, 
  Shield,
  Award,
  MapPin,
  Wrench,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface FilterOptions {
  categories: string[]
  states: string[]
  minRating: number | null
  maxDistance: number | null
  priceRange: string | null
  services: string[]
  isVerified: boolean | null
  isFeatured: boolean | null
  isOpen: boolean | null
  hasImages: boolean | null
  yearEstablishedMin: number | null
  yearEstablishedMax: number | null
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
  availableCategories: string[]
  availableStates: string[]
  availableServices: string[]
}

export default function AdvancedFilters({
  onFiltersChange,
  availableCategories,
  availableStates,
  availableServices
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    states: [],
    minRating: null,
    maxDistance: null,
    priceRange: null,
    services: [],
    isVerified: null,
    isFeatured: null,
    isOpen: null,
    hasImages: null,
    yearEstablishedMin: null,
    yearEstablishedMax: null,
  })

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters])

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      states: [],
      minRating: null,
      maxDistance: null,
      priceRange: null,
      services: [],
      isVerified: null,
      isFeatured: null,
      isOpen: null,
      hasImages: null,
      yearEstablishedMin: null,
      yearEstablishedMax: null,
    })
  }

  const activeFilterCount = () => {
    let count = 0
    if (filters.categories.length > 0) count++
    if (filters.states.length > 0) count++
    if (filters.minRating !== null) count++
    if (filters.maxDistance !== null) count++
    if (filters.priceRange !== null) count++
    if (filters.services.length > 0) count++
    if (filters.isVerified !== null) count++
    if (filters.isFeatured !== null) count++
    if (filters.isOpen !== null) count++
    if (filters.hasImages !== null) count++
    if (filters.yearEstablishedMin !== null) count++
    if (filters.yearEstablishedMax !== null) count++
    return count
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    updateFilter('categories', newCategories)
  }

  const toggleState = (state: string) => {
    const newStates = filters.states.includes(state)
      ? filters.states.filter(s => s !== state)
      : [...filters.states, state]
    updateFilter('states', newStates)
  }

  const toggleService = (service: string) => {
    const newServices = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service]
    updateFilter('services', newServices)
  }

  return (
    <div className="bg-gunsmith-card border border-gunsmith-border rounded-lg">
      {/* Filter Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gunsmith-gold" />
          <h3 className="font-bebas text-xl text-gunsmith-gold">ADVANCED FILTERS</h3>
          {activeFilterCount() > 0 && (
            <span className="bg-gunsmith-gold text-gunsmith-black text-xs px-2 py-1 rounded font-bold">
              {activeFilterCount()} Active
            </span>
          )}
        </div>
        <button className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 border-t border-gunsmith-border pt-4">
          {/* Categories */}
          <div>
            <h4 className="font-oswald font-medium text-gunsmith-text mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded text-sm font-oswald transition-colors ${
                    filters.categories.includes(category)
                      ? 'bg-gunsmith-gold text-gunsmith-black'
                      : 'bg-gunsmith-accent text-gunsmith-text hover:bg-gunsmith-gold hover:text-gunsmith-black'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          <div>
            <h4 className="font-oswald font-medium text-gunsmith-text mb-3">States</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) toggleState(e.target.value)
                }}
                className="input col-span-2 md:col-span-4"
              >
                <option value="">Select states...</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>
                    {state} {filters.states.includes(state) ? '✓' : ''}
                  </option>
                ))}
              </select>
              {filters.states.length > 0 && (
                <div className="col-span-2 md:col-span-4 flex flex-wrap gap-2 mt-2">
                  {filters.states.map(state => (
                    <span
                      key={state}
                      className="bg-gunsmith-gold text-gunsmith-black px-2 py-1 rounded text-sm flex items-center gap-1"
                    >
                      {state}
                      <button
                        onClick={() => toggleState(state)}
                        className="hover:text-gunsmith-error"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="font-oswald font-medium text-gunsmith-text mb-3">Minimum Rating</h4>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => updateFilter('minRating', filters.minRating === rating ? null : rating)}
                  className={`flex items-center gap-1 px-3 py-2 rounded transition-colors ${
                    filters.minRating === rating
                      ? 'bg-gunsmith-gold text-gunsmith-black'
                      : 'bg-gunsmith-accent text-gunsmith-text hover:bg-gunsmith-gold hover:text-gunsmith-black'
                  }`}
                >
                  {rating}
                  <Star className="h-4 w-4 fill-current" />
                  {rating < 5 && '+'}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-oswald font-medium text-gunsmith-text mb-3">Services</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableServices.map(service => (
                <label
                  key={service}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.services.includes(service)}
                    onChange={() => toggleService(service)}
                    className="w-4 h-4 rounded border-gunsmith-border bg-gunsmith-accent text-gunsmith-gold focus:ring-gunsmith-gold"
                  />
                  <span className="text-sm text-gunsmith-text">{service}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Business Features */}
          <div>
            <h4 className="font-oswald font-medium text-gunsmith-text mb-3">Business Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isVerified === true}
                  onChange={(e) => updateFilter('isVerified', e.target.checked ? true : null)}
                  className="w-4 h-4 rounded border-gunsmith-border bg-gunsmith-accent text-gunsmith-gold focus:ring-gunsmith-gold"
                />
                <span className="text-sm text-gunsmith-text flex items-center gap-1">
                  <Shield className="h-4 w-4 text-gunsmith-gold" />
                  Verified Only
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isFeatured === true}
                  onChange={(e) => updateFilter('isFeatured', e.target.checked ? true : null)}
                  className="w-4 h-4 rounded border-gunsmith-border bg-gunsmith-accent text-gunsmith-gold focus:ring-gunsmith-gold"
                />
                <span className="text-sm text-gunsmith-text flex items-center gap-1">
                  <Award className="h-4 w-4 text-gunsmith-gold" />
                  Featured Only
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isOpen === true}
                  onChange={(e) => updateFilter('isOpen', e.target.checked ? true : null)}
                  className="w-4 h-4 rounded border-gunsmith-border bg-gunsmith-accent text-gunsmith-gold focus:ring-gunsmith-gold"
                />
                <span className="text-sm text-gunsmith-text flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gunsmith-gold" />
                  Open Now
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasImages === true}
                  onChange={(e) => updateFilter('hasImages', e.target.checked ? true : null)}
                  className="w-4 h-4 rounded border-gunsmith-border bg-gunsmith-accent text-gunsmith-gold focus:ring-gunsmith-gold"
                />
                <span className="text-sm text-gunsmith-text">
                  Has Photos
                </span>
              </label>
            </div>
          </div>

          {/* Year Established */}
          <div>
            <h4 className="font-oswald font-medium text-gunsmith-text mb-3">Year Established</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gunsmith-text-secondary">From</label>
                <input
                  type="number"
                  min="1800"
                  max={currentYear}
                  value={filters.yearEstablishedMin || ''}
                  onChange={(e) => updateFilter('yearEstablishedMin', e.target.value ? parseInt(e.target.value) : null)}
                  className="input w-full"
                  placeholder="Min year"
                />
              </div>
              <div>
                <label className="text-sm text-gunsmith-text-secondary">To</label>
                <input
                  type="number"
                  min="1800"
                  max={currentYear}
                  value={filters.yearEstablishedMax || ''}
                  onChange={(e) => updateFilter('yearEstablishedMax', e.target.value ? parseInt(e.target.value) : null)}
                  className="input w-full"
                  placeholder="Max year"
                />
              </div>
            </div>
          </div>

          {/* Distance (placeholder for future geolocation feature) */}
          <div>
            <h4 className="font-oswald font-medium text-gunsmith-text mb-3">Distance</h4>
            <select
              value={filters.maxDistance || ''}
              onChange={(e) => updateFilter('maxDistance', e.target.value ? parseInt(e.target.value) : null)}
              className="input w-full"
            >
              <option value="">Any Distance</option>
              <option value="5">Within 5 miles</option>
              <option value="10">Within 10 miles</option>
              <option value="25">Within 25 miles</option>
              <option value="50">Within 50 miles</option>
              <option value="100">Within 100 miles</option>
            </select>
          </div>

          {/* Clear Filters */}
          {activeFilterCount() > 0 && (
            <div className="pt-4 border-t border-gunsmith-border">
              <button
                onClick={clearAllFilters}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
