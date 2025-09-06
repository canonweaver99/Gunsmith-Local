'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ImageUpload from '@/components/ImageUpload'
import BusinessHoursEditor from '@/components/BusinessHoursEditor'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { uploadFile, uploadMultipleFiles, STORAGE_BUCKETS, STORAGE_PATHS } from '@/lib/storage'
import { Loader2, Check, Plus, X, MapPin, Info } from 'lucide-react'

// Google Places API types
declare global {
  interface Window {
    google: any
    initAutocomplete: () => void
  }
}

export default function AddBusinessPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const analytics = useAnalytics()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [checkingVerification, setCheckingVerification] = useState(true)
  const [emailVerified, setEmailVerified] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customService, setCustomService] = useState('')
  const [showCustomService, setShowCustomService] = useState(false)
  const [additionalLocations, setAdditionalLocations] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    business_name: '',
    slug: '',
    email: '',
    phone: '',
    website: '',
    street_address: '',
    street_address_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'USA',
    category: '',
    description: '',
    short_description: '',
    tags: '',
    year_established: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
  })

  // Image state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [logoPreview, setLogoPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  // Business hours state
  const [businessHours, setBusinessHours] = useState<any>(null)

  // Check authentication and email verification
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/auth/login?redirect=/add-business')
      } else {
        // Check email verification status
        const checkEmailVerification = async () => {
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            setEmailVerified(currentUser?.email_confirmed_at !== null)
          } catch (error) {
            console.error('Error checking email verification:', error)
          } finally {
            setCheckingVerification(false)
          }
        }
        checkEmailVerification()
      }
    }
  }, [user, authLoading, router])

  // Load Google Places API
  useEffect(() => {
    if (!mounted) return

    const loadGoogleMapsScript = () => {
      if (window.google && window.google.maps) {
        initializeAutocomplete()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initializeAutocomplete
      document.head.appendChild(script)
    }

    const initializeAutocomplete = () => {
      const input = document.getElementById('main-address') as HTMLInputElement
      if (!input) return

      const autocomplete = new window.google.maps.places.Autocomplete(input, { 
        types: ['address'],
        componentRestrictions: { country: 'us' }
      })

      // Prevent form submission on Enter key in autocomplete
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
        }
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.address_components) return

        let streetNumber = ''
        let route = ''
        let city = ''
        let state = ''
        let postalCode = ''

        place.address_components.forEach((component: any) => {
          const types = component.types
          if (types.includes('street_number')) {
            streetNumber = component.long_name
          } else if (types.includes('route')) {
            route = component.long_name
          } else if (types.includes('locality')) {
            city = component.long_name
          } else if (types.includes('administrative_area_level_1')) {
            state = component.short_name
          } else if (types.includes('postal_code')) {
            postalCode = component.long_name
          }
        })

        setFormData(prev => ({
          ...prev,
          street_address: `${streetNumber} ${route}`.trim(),
          city,
          state_province: state,
          postal_code: postalCode
        }))
      })
    }

    loadGoogleMapsScript()

    // Cleanup function
    return () => {
      const input = document.getElementById('main-address') as HTMLInputElement
      if (input) {
        // Remove any event listeners
        const newInput = input.cloneNode(true) as HTMLInputElement
        input.parentNode?.replaceChild(newInput, input)
      }
    }
  }, [mounted])

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function generateShortDescription(longDesc: string): string {
    if (!longDesc) return ''
    
    // Take first 150 characters and find the last complete word
    let short = longDesc.substring(0, 150)
    const lastSpace = short.lastIndexOf(' ')
    if (lastSpace > 100) {
      short = short.substring(0, lastSpace)
    }
    
    // Add ellipsis if truncated
    if (longDesc.length > 150) {
      short += '...'
    }
    
    return short
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from business name
    if (name === 'business_name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }

    // Auto-generate short description from long description
    if (name === 'description') {
      setFormData(prev => ({
        ...prev,
        short_description: generateShortDescription(value)
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Upload images first
      let logoUrl = null
      let coverUrl = null
      let galleryUrls: string[] = []

      // Upload logo
      if (logoFile) {
        const { url, error } = await uploadFile(logoFile, STORAGE_BUCKETS.LISTINGS, STORAGE_PATHS.LOGOS)
        if (error) throw new Error(`Logo upload failed: ${error}`)
        logoUrl = url
      }

      // Upload cover image
      if (coverFile) {
        const { url, error } = await uploadFile(coverFile, STORAGE_BUCKETS.LISTINGS, STORAGE_PATHS.COVERS)
        if (error) throw new Error(`Cover image upload failed: ${error}`)
        coverUrl = url
      }

      // Upload gallery images
      if (galleryFiles.length > 0) {
        galleryUrls = await uploadMultipleFiles(galleryFiles, STORAGE_BUCKETS.LISTINGS, STORAGE_PATHS.GALLERY)
      }

      // Prepare data for insertion
      const dataToInsert = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        year_established: formData.year_established ? parseInt(formData.year_established) : null,
        status: 'active', // For development - auto-approve listings
        is_verified: false,
        is_featured: false,
        view_count: 0,
        owner_id: user?.id || null, // Associate with logged-in user
        logo_url: logoUrl,
        cover_image_url: coverUrl,
        image_gallery: galleryUrls.length > 0 ? galleryUrls : null,
        business_hours: businessHours,
        additional_locations: additionalLocations.length > 0 ? additionalLocations : null,
      }

      // Remove empty strings
      Object.keys(dataToInsert).forEach(key => {
        if (dataToInsert[key as keyof typeof dataToInsert] === '') {
          delete dataToInsert[key as keyof typeof dataToInsert]
        }
      })

      const { error } = await supabase
        .from('listings')
        .insert([dataToInsert])

      if (error) throw error

                    setSuccess(true)
              
              // Track business addition
              analytics.trackBusinessAdd(
                formData.business_name,
                formData.category || 'Unknown',
                `${formData.city}, ${formData.state_province}`
              )
              
              // Redirect after 2 seconds
              setTimeout(() => {
                router.push('/listings')
              }, 2000)

    } catch (err: any) {
      console.error('Error submitting listing:', err)
      setError(err.message || 'Failed to submit listing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'General Gunsmith',
    'Custom Builder',
    'Restoration Specialist',
    'Cerakote Services',
    'NFA/Class 3',
    'Competition Gunsmith',
    'Hunting & Sporting',
    'Law Enforcement',
    'Military Contractor'
  ]

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  const commonServices = [
    'General Repairs',
    'Cleaning & Maintenance',
    'Sight Installation',
    'Trigger Work',
    'Barrel Threading',
    'Action Tuning',
    'Stock Work',
    'Cerakote',
    'Bluing',
    'Parkerizing',
    'Custom Builds',
    'AR-15 Assembly',
    'Scope Mounting',
    'Bore Sighting',
    'Accurizing',
    'Recoil Pad Installation',
    'Magazine Repair',
    'Parts Replacement',
    'Safety Inspection',
    'FFL Transfers',
    'NFA Services',
    'Restoration',
    'Refinishing',
    'Checkering',
    'Glass Bedding',
    'Crown Work',
    'Chamber Work',
    'Muzzle Device Install',
    'Pin & Weld',
    'Engraving'
  ]

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      }
      return [...prev, tag]
    })
  }

  const addCustomService = () => {
    if (customService.trim() && !selectedTags.includes(customService.trim())) {
      setSelectedTags(prev => [...prev, customService.trim()])
      setCustomService('')
      setShowCustomService(false)
    }
  }

  const addLocation = () => {
    setAdditionalLocations(prev => [...prev, {
      street_address: '',
      city: '',
      state_province: '',
      postal_code: ''
    }])
  }

  const removeLocation = (index: number) => {
    setAdditionalLocations(prev => prev.filter((_, i) => i !== index))
  }

  const updateLocation = (index: number, field: string, value: string) => {
    setAdditionalLocations(prev => prev.map((loc, i) => 
      i === index ? { ...loc, [field]: value } : loc
    ))
  }

  useEffect(() => {
    // Update form data when tags change
    setFormData(prev => ({
      ...prev,
      tags: selectedTags.join(', ')
    }))
  }, [selectedTags])

  // Loading state
  if (authLoading || checkingVerification) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gunsmith-gold mx-auto mb-4" />
            <p className="text-gunsmith-text-secondary">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Email verification required
  if (user && !emailVerified) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold/20 rounded-full mb-4">
              <svg className="h-8 w-8 text-gunsmith-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-4">
              EMAIL VERIFICATION REQUIRED
            </h1>
            <p className="text-gunsmith-text-secondary mb-6">
              Please verify your email address before adding a business listing. Check your inbox for a verification link.
            </p>
            <button
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: user.email!
                  })
                  if (!error) {
                    alert('Verification email sent! Please check your inbox.')
                  }
                } catch (error) {
                  console.error('Error resending verification:', error)
                }
              }}
              className="btn-secondary"
            >
              Resend Verification Email
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold rounded-full mb-4">
              <Check className="h-8 w-8 text-gunsmith-black" />
            </div>
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-2">
              LISTING SUBMITTED SUCCESSFULLY!
            </h1>
            <p className="text-gunsmith-text-secondary">
              Your business will be reviewed and published soon.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Page Header */}
        <section className="bg-gunsmith-accent/20 py-12 px-4">
          <div className="container mx-auto">
            <h1 className="font-bebas text-5xl md:text-6xl text-gunsmith-gold mb-4 text-center">
              ADD YOUR BUSINESS
            </h1>
            <p className="text-center text-gunsmith-text-secondary max-w-2xl mx-auto">
              Join our directory of professional gunsmiths. We've made this form as simple as possible.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded">
                  {error}
                </div>
              )}

              {/* Basic Information */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">STEP 1: BASIC INFORMATION</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label">Business Name *</label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required
                      className="input w-full text-lg"
                      placeholder="Smith's Gunsmithing"
                    />
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input w-full text-lg"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input w-full text-lg"
                      placeholder="info@smithsgunsmithing.com"
                    />
                  </div>
                </div>
              </div>

              {/* Main Location */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">STEP 2: MAIN LOCATION</h2>
                <p className="text-sm text-gunsmith-text-secondary mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Start typing your address and select from the suggestions
                </p>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="label">Street Address *</label>
                    <input
                      id="main-address"
                      type="text"
                      name="street_address"
                      value={formData.street_address}
                      onChange={handleInputChange}
                      required
                      className="input w-full text-lg"
                      placeholder="Start typing your address..."
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="label">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="label">State</label>
                      <select
                        name="state_province"
                        value={formData.state_province}
                        onChange={handleInputChange}
                        className="input w-full"
                      >
                        <option value="">Select</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">ZIP</label>
                      <input
                        type="text"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        className="input w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Locations */}
                <div className="mt-6 pt-6 border-t border-gunsmith-border">
                  <h3 className="font-bebas text-xl text-gunsmith-gold mb-3">Additional Locations</h3>
                  <p className="text-sm text-gunsmith-text-secondary mb-4">
                    Have another store location? Add it here.
                  </p>
                  
                  {additionalLocations.map((location, index) => (
                    <div key={index} className="mb-4 p-4 bg-gunsmith-card rounded relative">
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="absolute top-2 right-2 text-gunsmith-error hover:text-red-400"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <div className="grid grid-cols-1 gap-4">
                        <input
                          type="text"
                          placeholder="Street Address"
                          value={location.street_address}
                          onChange={(e) => updateLocation(index, 'street_address', e.target.value)}
                          className="input w-full"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="City"
                            value={location.city}
                            onChange={(e) => updateLocation(index, 'city', e.target.value)}
                            className="input"
                          />
                          <select
                            value={location.state_province}
                            onChange={(e) => updateLocation(index, 'state_province', e.target.value)}
                            className="input"
                          >
                            <option value="">State</option>
                            {states.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="ZIP"
                            value={location.postal_code}
                            onChange={(e) => updateLocation(index, 'postal_code', e.target.value)}
                            className="input"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addLocation}
                    className="btn-secondary text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Location
                  </button>
                </div>
              </div>

              {/* Business Details */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">STEP 3: TELL US ABOUT YOUR BUSINESS</h2>
                <div className="space-y-6">
                  <div>
                    <label className="label">What type of gunsmith are you?</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input w-full text-lg"
                    >
                      <option value="">Select your specialty</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="label">Describe your business</label>
                    <p className="text-sm text-gunsmith-text-secondary mb-2">
                      Tell customers what makes your shop special. We'll create a short version automatically.
                    </p>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="input w-full min-h-[150px] text-lg"
                      placeholder="We've been serving the community for 30 years, specializing in custom builds and restorations..."
                    />
                    {formData.short_description && (
                      <p className="text-sm text-gunsmith-text-secondary mt-2">
                        Short preview: "{formData.short_description}"
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">Services Offered</label>
                    <p className="text-sm text-gunsmith-text-secondary mb-3">
                      Click all services you offer (or add your own)
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {commonServices.map(service => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleTag(service)}
                          className={`px-4 py-2 rounded-full text-base font-medium transition-all ${
                            selectedTags.includes(service)
                              ? 'bg-gunsmith-gold text-gunsmith-black hover:bg-gunsmith-goldenrod'
                              : 'bg-gunsmith-card border border-gunsmith-border text-gunsmith-text hover:border-gunsmith-gold'
                          }`}
                        >
                          {service}
                        </button>
                      ))}
                    </div>

                    {!showCustomService ? (
                      <button
                        type="button"
                        onClick={() => setShowCustomService(true)}
                        className="text-gunsmith-gold hover:text-gunsmith-goldenrod text-sm"
                      >
                        + Add a service not listed
                      </button>
                    ) : (
                      <div className="flex gap-2 mt-4">
                        <input
                          type="text"
                          value={customService}
                          onChange={(e) => setCustomService(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
                          placeholder="Enter custom service"
                          className="input flex-1"
                        />
                        <button
                          type="button"
                          onClick={addCustomService}
                          className="btn-primary text-sm"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCustomService(false)
                            setCustomService('')
                          }}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {selectedTags.length > 0 && (
                      <div className="mt-4 p-4 bg-gunsmith-card rounded">
                        <p className="text-sm text-gunsmith-text-secondary mb-2 font-medium">
                          Selected services ({selectedTags.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gunsmith-gold/20 text-gunsmith-gold text-sm rounded-full"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="hover:text-gunsmith-goldenrod"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">STEP 4: BUSINESS HOURS</h2>
                <BusinessHoursEditor
                  value={businessHours}
                  onChange={setBusinessHours}
                />
              </div>

              {/* Images */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">STEP 5: ADD PHOTOS (OPTIONAL)</h2>
                <div className="space-y-8">
                  {/* Logo Upload */}
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <ImageUpload
                        label="Business Logo"
                        value={logoPreview}
                        onChange={setLogoPreview}
                        onFilesSelected={(files) => setLogoFile(files[0])}
                        multiple={false}
                        maxSizeMB={2}
                      />
                      <div className="mt-6">
                        <div className="flex items-center gap-1 text-sm text-gunsmith-text-secondary">
                          <Info className="h-4 w-4" />
                          <span>Recommended: Square image, 400x400px</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <ImageUpload
                        label="Cover Photo"
                        value={coverPreview}
                        onChange={setCoverPreview}
                        onFilesSelected={(files) => setCoverFile(files[0])}
                        multiple={false}
                        maxSizeMB={5}
                      />
                      <div className="mt-6">
                        <div className="flex items-center gap-1 text-sm text-gunsmith-text-secondary">
                          <Info className="h-4 w-4" />
                          <span>Recommended: 1200x400px (3:1 ratio)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Images Upload */}
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <ImageUpload
                        label="Gallery Photos"
                        value={galleryPreviews}
                        onChange={setGalleryPreviews}
                        onFilesSelected={setGalleryFiles}
                        multiple={true}
                        maxFiles={10}
                        maxSizeMB={5}
                      />
                      <div className="mt-6">
                        <div className="flex items-center gap-1 text-sm text-gunsmith-text-secondary">
                          <Info className="h-4 w-4" />
                          <span>Recommended: 800x600px each</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Information */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-2">ADDITIONAL INFO (OPTIONAL)</h2>
                <p className="text-sm text-gunsmith-text-secondary mb-6">
                  These help customers find and connect with you
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="https://www.yourwebsite.com"
                    />
                  </div>
                  <div>
                    <label className="label">Year Established</label>
                    <input
                      type="number"
                      name="year_established"
                      value={formData.year_established}
                      onChange={handleInputChange}
                      className="input w-full"
                      min="1800"
                      max={new Date().getFullYear()}
                      placeholder="1985"
                    />
                  </div>
                  <div>
                    <label className="label">Facebook Page</label>
                    <input
                      type="url"
                      name="facebook_url"
                      value={formData.facebook_url}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <label className="label">Instagram</label>
                    <input
                      type="url"
                      name="instagram_url"
                      value={formData.instagram_url}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="https://instagram.com/yourpage"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-12 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Your Listing'
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}