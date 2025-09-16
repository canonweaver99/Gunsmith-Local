'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessFormSchema, type BusinessFormValues, STATES } from '@/lib/validations/businessForm'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/ImageUpload'
import { HelpCircle, CheckCircle, Clock, Upload, MapPin } from 'lucide-react'
import Link from 'next/link'
import { loadGoogleMapsScript } from '@/lib/google-maps'
import { GUNSMITH_SPECIALTIES } from '@/lib/gunsmith-specialties'

declare global {
  interface Window {
    google: any
  }
}

const SERVICES = [
  'Custom Rifle Builds',
  'Custom Pistol Builds',
  'AR-15 Builds',
  'Bolt Action Rifle Work',
  'Trigger Installation/Tuning',
  'Barrel Threading',
  'Muzzle Device Installation',
  'Scope Mounting',
  'Sight Installation',
  'Cerakote Coating',
  'Bluing/Refinishing',
  'Stock Work/Bedding',
  'Action Blueprinting',
  'Barrel Installation',
  'Recoil Pad Installation',
  'Sling Swivel Installation',
  'Safety Repairs',
  'Feed Ramp Polishing',
  'Chamber Work',
  'Headspace Checking',
  'Trigger Guard Installation',
  'Magazine Well Work',
  'Checkering',
  'Engraving',
  'Parts Fabrication',
  'Restoration Work',
  'Competition Prep',
  'Hunting Rifle Setup',
  'Tactical Modifications',
  'General Repairs'
]

const TIME_OPTIONS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', 'CLOSED'
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function BusinessRegistrationForm() {
  const [submitting, setSubmitting] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [coverUrl, setCoverUrl] = useState<string>('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [businessHours, setBusinessHours] = useState<{[key: string]: {open: string, close: string, closed: boolean}}>({})
  const [message, setMessage] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState<{[key: string]: boolean}>({})
  const addressInputRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<any | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      services: [],
      delivery_method: 'both',
    },
  })

  const watchedZip = watch('postal_code')

  // Load Google Places API using Promise-based loader
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        if (process.env.NODE_ENV !== 'production') {
          const masked = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? `${String(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).slice(0,4)}...${String(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).slice(-4)}` : 'undefined'
          console.debug('[Maps] Using key:', masked)
        }
        await loadGoogleMapsScript()
        if (!cancelled) initializeAutocomplete()
      } catch (e) {
        console.error('Google Maps load/init failed:', e)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  function initializeAutocomplete() {
    console.log('Initializing autocomplete...', {
      addressInputRef: !!addressInputRef.current,
      googleMaps: !!window.google
    })

    if (!addressInputRef.current || !window.google?.maps?.places) {
      console.log('Missing requirements for autocomplete')
      return
    }

    const inputEl = addressInputRef.current
    if (!inputEl) {
      console.log('No input element found')
      return
    }

    try {
      // Prevent duplicate listeners
      if (autocompleteRef.current) {
        autocompleteRef.current.unbindAll?.()
        autocompleteRef.current = null
      }

      const autocomplete = new window.google.maps.places.Autocomplete(inputEl, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      })
      autocompleteRef.current = autocomplete

      console.log('Autocomplete created successfully')

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        console.log('Place selected:', place)

        if (!place || !place.address_components) {
          console.log('No place or address components found')
          return
        }

        let streetNumber = '', route = '', city = '', state = '', zip = ''

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
            zip = component.long_name
          }
        })

        const fullStreet = [streetNumber, route].filter(Boolean).join(' ')
        console.log('Parsed address:', { fullStreet, city, state, zip })

        setValue('street_address', fullStreet, { shouldValidate: true, shouldDirty: true })
        setValue('city', city, { shouldValidate: true, shouldDirty: true })
        setValue('state_province', state as any, { shouldValidate: true, shouldDirty: true })
        setValue('postal_code', zip, { shouldValidate: true, shouldDirty: true })
      })
    } catch (error) {
      console.error('Error creating autocomplete:', error)
    }
  }

  // Reinitialize when the input ref becomes available
  useEffect(() => {
    if (window.google?.maps?.places && addressInputRef.current) {
      initializeAutocomplete()
    }
  }, [addressInputRef.current])

  // Auto-format phone number
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`
    }
    return value
  }

  // Format social media URLs
  function formatWebsiteUrl(value: string) {
    if (!value) return value
    if (value.startsWith('http')) return value
    return `https://${value}`
  }

  function formatSocialUrl(platform: string, username: string) {
    if (!username) return username
    if (username.startsWith('http')) return username
    const cleanUsername = username.replace('@', '')
    return `https://${platform}.com/${cleanUsername}`
  }

  // Initialize business hours with common defaults
  useEffect(() => {
    const defaultHours: any = {}
    DAYS.forEach(day => {
      defaultHours[day.toLowerCase()] = {
        open: day === 'Sunday' ? 'CLOSED' : '9:00 AM',
        close: day === 'Sunday' ? 'CLOSED' : '5:00 PM',
        closed: day === 'Sunday'
      }
    })
    setBusinessHours(defaultHours)
  }, [])

  // Auto-populate city/state from ZIP (mock implementation)
  useEffect(() => {
    if (watchedZip && watchedZip.length === 5) {
      // In real implementation, you'd call a ZIP code API
      // For now, just show the concept
      console.log('Would auto-populate city/state for ZIP:', watchedZip)
    }
  }, [watchedZip])

  function toggleService(service: string) {
    setSelectedServices(prev => {
      const updated = prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
      setValue('services', updated)
      return updated
    })
  }

  function selectAllServices() {
    setSelectedServices(SERVICES)
    setValue('services', SERVICES)
  }

  function clearAllServices() {
    setSelectedServices([])
    setValue('services', [])
  }

  function updateBusinessHours(day: string, field: 'open' | 'close', value: string) {
    setBusinessHours(prev => ({
      ...prev,
      [day.toLowerCase()]: {
        ...prev[day.toLowerCase()],
        [field]: value,
        closed: value === 'CLOSED'
      }
    }))
  }

  function copyHoursToAll(sourceDay: string) {
    const sourceHours = businessHours[sourceDay.toLowerCase()]
    if (!sourceHours) return
    
    const newHours = { ...businessHours }
    DAYS.forEach(day => {
      if (day.toLowerCase() !== sourceDay.toLowerCase()) {
        newHours[day.toLowerCase()] = { ...sourceHours }
      }
    })
    setBusinessHours(newHours)
  }

  function toggleHelp(field: string) {
    setShowHelp(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Create a URL-friendly slug and ensure uniqueness in the listings table
  function slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function generateUniqueSlug(businessName: string, city?: string): Promise<string> {
    const baseParts = [businessName, city].filter(Boolean) as string[]
    const base = slugify(baseParts.join(' ')) || `listing-${Date.now()}`
    let candidate = base
    // Try a few simple suffixes before timestamping
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data } = await supabase
        .from('listings')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle()
      if (!data) return candidate
      candidate = `${base}-${attempt + 1}`
    }
    return `${base}-${Date.now()}`
  }

  async function onSubmit(values: BusinessFormValues) {
    try {
      setSubmitting(true)
      setMessage(null)

      // Ensure required slug exists for insertion
      const slug = await generateUniqueSlug(values.business_name, values.city)

      // Identify current user to set as owner for dashboard visibility
      const { data: authData } = await supabase.auth.getUser()
      const ownerId = authData?.user?.id || null

      const payload = {
        business_name: values.business_name,
        year_established: Number(values.year_started),
        ffl_license_number: values.ffl_license_number,
        street_address: values.street_address,
        city: values.city,
        state_province: values.state_province,
        postal_code: values.postal_code,
        email: values.email,
        phone: values.phone,
        category: 'Gunsmith',
        website: formatWebsiteUrl(values.website_url || ''),
        facebook_url: formatSocialUrl('facebook', values.facebook_url || ''),
        instagram_url: formatSocialUrl('instagram', values.instagram_url || ''),
        business_hours: businessHours,
        tags: selectedServices.length ? selectedServices : [],
        description: values.specialties || '',
        status: 'pending',
        verification_status: 'pending',
        delivery_method: values.delivery_method || 'both',
        slug,
        logo_url: logoUrl || null,
        cover_image_url: coverUrl || null,
        image_gallery: galleryUrls.length ? galleryUrls : null,
        owner_id: ownerId,
      }

      const { error } = await supabase.from('listings').insert(payload)
      if (error) throw error

      // Notify admin of new business addition
      try {
        await fetch('/api/email/admin-business-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'business_added',
            userEmail: values.email,
            userName: values.contact_name || 'Business Owner',
            businessName: values.business_name,
            businessDetails: `Location: ${values.city}, ${values.state_province}, FFL: ${values.ffl_license_number || 'Not provided'}, Services: ${selectedServices.join(', ')}`
          })
        })
      } catch (emailError) {
        console.error('Failed to send admin notification for new business:', emailError)
      }

      setMessage('SUCCESS! Your business has been submitted for review. We will contact you within 2-3 business days.')
      setShowSuccess(true)
    } catch (e: any) {
      setMessage(`ERROR: ${e?.message || 'Failed to submit form. Please try again.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const totalSteps = 7

  return (
    <div className="max-w-4xl mx-auto">

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {message && (
          <div className={`p-6 rounded-lg border-2 text-xl font-medium ${
            message.includes('SUCCESS') 
              ? 'bg-green-900/20 border-green-500 text-green-400'
              : 'bg-red-900/20 border-red-500 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {/* Step 1: Basic Information */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">1</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">BASIC INFORMATION</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">Business Name *</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('business_name')} 
                placeholder="e.g., Smith & Sons Gunsmithing"
              />
              {errors.business_name && <p className="text-red-400 text-sm mt-1">{errors.business_name.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">Year Founded *</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('year_started')} 
                placeholder="e.g., 1999"
                type="number"
                min="1900"
                max="2024"
              />
              {errors.year_started && <p className="text-red-400 text-sm mt-1">{errors.year_started.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">FFL License Number *</label>
              <input 
                className="input text-sm p-3 h-11 w-full font-mono" 
                {...register('ffl_license_number')} 
                placeholder="e.g., 1-23-456-78-9A-12345"
              />
              {errors.ffl_license_number && <p className="text-red-400 text-sm mt-1">{errors.ffl_license_number.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">Contact Name *</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('contact_name')} 
                placeholder="e.g., John Smith"
              />
              {errors.contact_name && <p className="text-red-400 text-sm mt-1">{errors.contact_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">Phone Number *</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('phone')} 
                placeholder="(555) 123-4567"
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value)
                  e.target.value = formatted
                }}
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">Email Address *</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('email')} 
                type="email"
                placeholder="e.g., john@smithgunsmithing.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        {/* Step 2: Location */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">2</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">BUSINESS LOCATION</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">Street Address *</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('street_address', {
                  required: 'Street address is required'
                })} 
                ref={(e) => {
                  if (e) addressInputRef.current = e
                }}
                placeholder="Start typing your address..."
              />
              {errors.street_address && <p className="text-red-400 text-sm mt-1">{errors.street_address.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">City *</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('city')} 
                placeholder="e.g., Denver"
              />
              {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">State *</label>
              <select className="input text-sm p-3 h-11 w-full" {...register('state_province')} defaultValue="">
                <option value="" disabled>Select Your State</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state_province && <p className="text-red-400 text-sm mt-1">{errors.state_province.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">ZIP Code *</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('postal_code')} 
                placeholder="e.g., 80202"
                maxLength={5}
              />
              {errors.postal_code && <p className="text-red-400 text-sm mt-1">{errors.postal_code.message}</p>}
            </div>
          </div>
        </div>

        {/* Step 3: Business Hours */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">3</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">BUSINESS HOURS</h3>
          </div>

          <div className="space-y-4">
            {DAYS.map((day) => {
              const dayKey = day.toLowerCase()
              const dayHours = businessHours[dayKey] || { open: '9:00 AM', close: '5:00 PM', closed: false }
              
              return (
                <div key={day} className="grid grid-cols-12 gap-4 items-center p-4 bg-gunsmith-accent/30 rounded-lg">
                  <div className="col-span-3">
                    <label className="text-lg font-medium text-gunsmith-text">{day}</label>
                  </div>

                  <div className="col-span-3">
                    <select 
                      className="input text-base h-12"
                      value={dayHours.open}
                      onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 text-center">
                    <span className="text-gunsmith-text text-lg">to</span>
                  </div>

                  <div className="col-span-3">
                    <select 
                      className="input text-base h-12"
                      value={dayHours.close}
                      onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                      disabled={dayHours.open === 'CLOSED'}
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => copyHoursToAll(day)}
                      className="btn-secondary text-sm h-12 w-full"
                    >
                      Copy to All
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

        </div>

        {/* Step 4: Services */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">4</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">SERVICES YOU OFFER</h3>
          </div>

          <div className="mb-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={selectAllServices}
              className="btn-primary text-sm px-4 py-2"
            >
              Select All Services
            </button>
            <button
              type="button"
              onClick={clearAllServices}
              className="btn-secondary text-sm px-4 py-2"
            >
              Clear All
            </button>
            <p className="text-gunsmith-text-secondary text-sm flex items-center">
              Selected: <span className="text-gunsmith-gold font-bold ml-2">{selectedServices.length}</span>
            </p>
          </div>

          {/* Grouped services under 8 parent categories */}
          <div className="space-y-4">
            {GUNSMITH_SPECIALTIES.map(group => (
              <div key={group.key} className="border border-gunsmith-border rounded-md">
                <details>
                  <summary className="cursor-pointer select-none px-4 py-3 font-oswald text-lg text-gunsmith-gold">
                    {group.label}
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                    {group.items.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleService(item)}
                        className={`p-3 rounded-lg border transition-all duration-200 text-left min-h-[48px] flex items-center ${
                          selectedServices.includes(item)
                            ? 'bg-gunsmith-gold text-gunsmith-black border-gunsmith-gold'
                            : 'bg-gunsmith-accent border-gunsmith-border text-gunsmith-text hover:border-gunsmith-gold hover:bg-gunsmith-gold/10'
                        }`}
                      >
                        <span className="text-sm">{item}</span>
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>

        {/* Step 5: Images */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">5</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">PHOTOS OF YOUR BUSINESS</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-gunsmith-accent/30 rounded-lg">
              <h4 className="text-xl font-medium text-gunsmith-gold mb-4">Business Logo</h4>
              <p className="text-gunsmith-text-secondary mb-4">Upload your business logo (optional)</p>
              <ImageUpload
                label="📷 Click to Upload Logo"
                value={logoUrl}
                onChange={(url) => setLogoUrl(typeof url === 'string' ? url : '')}
                maxSizeMB={2}
                preview={true}
              />
            </div>
            
            <div className="p-6 bg-gunsmith-accent/30 rounded-lg">
              <h4 className="text-xl font-medium text-gunsmith-gold mb-4">Shop Photo</h4>
              <p className="text-gunsmith-text-secondary mb-4">Photo of your shop or workspace (optional)</p>
              <ImageUpload
                label="📷 Click to Upload Photo"
                value={coverUrl}
                onChange={(url) => setCoverUrl(typeof url === 'string' ? url : '')}
                maxSizeMB={5}
                preview={true}
              />
            </div>
            
            <div className="md:col-span-2 p-6 bg-gunsmith-accent/30 rounded-lg">
              <h4 className="text-xl font-medium text-gunsmith-gold mb-4">Work Examples</h4>
              <p className="text-gunsmith-text-secondary mb-4">Photos of your gunsmith work (optional, up to 10 photos)</p>
              <ImageUpload
                label="📷 Click to Upload Work Photos"
                value={galleryUrls}
                onChange={(urls) => setGalleryUrls(Array.isArray(urls) ? urls : [])}
                multiple={true}
                maxFiles={10}
                maxSizeMB={3}
                preview={true}
              />
            </div>
          </div>
        </div>

        {/* Step 6: Online Presence */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">6</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">WEBSITE & SOCIAL MEDIA</h3>
          </div>
          
          <p className="text-gunsmith-text-secondary text-lg mb-6">All fields below are optional</p>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">Website</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('website_url')} 
                placeholder="e.g., smithgunsmithing.com"
                onBlur={(e) => {
                  const formatted = formatWebsiteUrl(e.target.value)
                  setValue('website_url', formatted)
                }}
              />
              {errors.website_url && <p className="text-red-400 text-sm mt-1">{errors.website_url.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">Facebook Username</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('facebook_url')} 
                placeholder="e.g., smithgunsmithing"
                onBlur={(e) => {
                  const formatted = formatSocialUrl('facebook', e.target.value)
                  setValue('facebook_url', formatted)
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gunsmith-text mb-2">Instagram Username</label>
              <input 
                className="input text-sm p-3 h-11 w-full" 
                {...register('instagram_url')} 
                placeholder="e.g., smithgunsmithing"
                onBlur={(e) => {
                  const formatted = formatSocialUrl('instagram', e.target.value)
                  setValue('instagram_url', formatted)
                }}
              />
            </div>
          </div>
        </div>

        {/* Step 7: Delivery Preference */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">7</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">HOW DO YOU PREFER TO WORK?</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <label className={`wizard-button ${watch('delivery_method') === 'in-person' ? 'selected' : ''} text-center`}>
              <input type="radio" value="in-person" {...register('delivery_method')} className="hidden" />
              <span className="text-lg font-medium">In-Person Only</span>
              <p className="text-sm text-gunsmith-text-secondary mt-1">Visit the gunsmith's shop directly</p>
            </label>
            <label className={`wizard-button ${watch('delivery_method') === 'shipping' ? 'selected' : ''} text-center`}>
              <input type="radio" value="shipping" {...register('delivery_method')} className="hidden" />
              <span className="text-lg font-medium">Shipping Only</span>
              <p className="text-sm text-gunsmith-text-secondary mt-1">Ship your firearm to the gunsmith</p>
            </label>
            <label className={`wizard-button ${watch('delivery_method') === 'both' ? 'selected' : ''} text-center`}>
              <input type="radio" value="both" {...register('delivery_method')} className="hidden" />
              <span className="text-lg font-medium">Either Works</span>
              <p className="text-sm text-gunsmith-text-secondary mt-1">Open to both options</p>
            </label>
          </div>
        </div>

        {/* Step 8: Specialties */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">8</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">TELL US ABOUT YOUR EXPERTISE</h3>
          </div>
          
          <div>
            <label className="block text-xl font-medium text-gunsmith-text mb-3">
              What makes your gunsmith business special? (Optional)
            </label>
            <textarea 
              className="input text-lg p-6 min-h-48 w-full resize-none" 
              {...register('specialties')} 
              placeholder="e.g., 30+ years experience, specialize in vintage rifles, custom engraving, work with collectors, etc."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="bg-gunsmith-gold/10 p-8 rounded-lg border-2 border-gunsmith-gold">
          <div className="text-center">
            <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">READY TO SUBMIT?</h3>
            <p className="text-gunsmith-text text-lg mb-6">
              We will review your information and contact you within 2-3 business days for verification.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                type="submit" 
                disabled={submitting} 
                className="btn-primary text-base px-6 py-3 min-h-[50px] min-w-[180px]"
              >
                {submitting ? 'Submitting...' : 'Submit My Business'}
              </button>
              
              <button 
                type="button" 
                className="btn-secondary text-base px-6 py-3 min-h-[50px] min-w-[180px]"
                onClick={() => {
                  localStorage.setItem('business-form-draft', JSON.stringify({
                    formData: watch(),
                    selectedServices,
                    businessHours
                  }))
                  alert('Your progress has been saved! You can return later to finish.')
                }}
              >
                Save & Continue Later
              </button>
            </div>
            
            <p className="text-gunsmith-text-secondary text-base mt-4">
              By submitting, you agree your listing will be reviewed for verification.
            </p>
          </div>
        </div>
      </form>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div role="dialog" aria-modal="true" className="max-w-lg w-full bg-gunsmith-card border-2 border-gunsmith-gold rounded-lg p-8 text-center">
            <h3 className="font-bebas text-3xl text-gunsmith-gold mb-4">SUCCESS!</h3>
            <p className="text-gunsmith-text text-lg mb-6">Your business has been submitted for review. We will contact you within 2-3 business days.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setShowSuccess(false)} className="btn-secondary min-w-[140px]">Close</button>
              <Link href="/dashboard" className="btn-primary min-w-[180px] text-center">Go to Dashboard</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}