'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessFormSchema, type BusinessFormValues, STATES } from '@/lib/validations/businessForm'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/ImageUpload'
import { HelpCircle, CheckCircle, Clock, Upload, MapPin } from 'lucide-react'

declare global {
  interface Window {
    google: any
  }
}

const SERVICES = [
  'Custom Rifle Builds','Custom Pistol Builds','AR-15 Builds','Bolt Action Rifle Work','Trigger Installation/Tuning','Barrel Threading','Muzzle Device Installation','Scope Mounting','Sight Installation','Cerakote Coating','Bluing/Refinishing','Stock Work/Bedding','Action Blueprinting','Barrel Installation','Recoil Pad Installation','Sling Swivel Installation','Safety Repairs','Feed Ramp Polishing','Chamber Work','Headspace Checking','Trigger Guard Installation','Magazine Well Work','Checkering','Engraving','Parts Fabrication','Restoration Work','Competition Prep','Hunting Rifle Setup','Tactical Modifications','General Repairs'
]

const TIME_OPTIONS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', 'CLOSED'
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function BusinessRegistrationForm() {
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [coverUrl, setCoverUrl] = useState<string>('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [businessHours, setBusinessHours] = useState<{[key: string]: {open: string, close: string, closed: boolean}}>({})
  const [message, setMessage] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState<{[key: string]: boolean}>({})
  const addressInputRef = useRef<HTMLInputElement | null>(null)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      services: [],
    },
  })

  const watchedZip = watch('postal_code')

  // Load Google Places API
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.google && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.onload = initializeAutocomplete
      document.head.appendChild(script)
    } else if (window.google) {
      initializeAutocomplete()
    }
  }, [])

  function initializeAutocomplete() {
    if (!addressInputRef.current || !window.google) return

    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'us' }
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.address_components) return

      let street = '', city = '', state = '', zip = ''
      
      place.address_components.forEach((component: any) => {
        const types = component.types
        if (types.includes('street_number') || types.includes('route')) {
          street += component.long_name + ' '
        } else if (types.includes('locality')) {
          city = component.long_name
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name
        } else if (types.includes('postal_code')) {
          zip = component.long_name
        }
      })

      setValue('street_address', street.trim())
      setValue('city', city)
      setValue('state_province', state as any)
      setValue('postal_code', zip)
    })
  }

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

  async function onSubmit(values: BusinessFormValues) {
    try {
      setSubmitting(true)
      setMessage(null)

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
        website: formatWebsiteUrl(values.website_url || ''),
        facebook_url: formatSocialUrl('facebook', values.facebook_url || ''),
        instagram_url: formatSocialUrl('instagram', values.instagram_url || ''),
        business_hours: businessHours,
        tags: selectedServices.length ? selectedServices : [],
        description: values.specialties || '',
        status: 'pending',
        verification_status: 'pending',
        logo_url: logoUrl || null,
        cover_image_url: coverUrl || null,
        image_gallery: galleryUrls.length ? galleryUrls : null,
      }

      const { error } = await supabase.from('listings').insert(payload)
      if (error) throw error
      setMessage('✅ SUCCESS! Your business has been submitted for review. We will contact you within 2-3 business days.')
    } catch (e: any) {
      setMessage(`❌ ERROR: ${e?.message || 'Failed to submit form. Please try again.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const totalSteps = 7

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8 bg-gunsmith-card p-6 rounded-lg border-2 border-gunsmith-gold">
        <div className="text-center mb-4">
          <h2 className="font-bebas text-3xl text-gunsmith-gold">BUSINESS REGISTRATION</h2>
          <p className="text-xl text-gunsmith-text mt-2">Step {currentStep} of {totalSteps}</p>
        </div>
        <div className="w-full bg-gunsmith-accent rounded-full h-4">
          <div 
            className="bg-gunsmith-gold h-4 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

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
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">
                Business Name *
                <button type="button" onClick={() => toggleHelp('business_name')} className="ml-2 text-gunsmith-gold">
                  <HelpCircle className="h-5 w-5 inline" />
                </button>
              </label>
              {showHelp.business_name && (
                <p className="text-gunsmith-text-secondary mb-3 p-3 bg-gunsmith-accent rounded">
                  Enter the official name of your gunsmith business as it appears on your FFL license.
                </p>
              )}
              <input 
                className="input text-lg p-4 h-14" 
                {...register('business_name')} 
                placeholder="e.g., Smith & Sons Gunsmithing"
              />
              {errors.business_name && <p className="text-red-400 text-lg mt-2">⚠️ {errors.business_name.message}</p>}
            </div>
            
            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">
                Year Founded *
                <button type="button" onClick={() => toggleHelp('year_founded')} className="ml-2 text-gunsmith-gold">
                  <HelpCircle className="h-5 w-5 inline" />
                </button>
              </label>
              {showHelp.year_founded && (
                <p className="text-gunsmith-text-secondary mb-3 p-3 bg-gunsmith-accent rounded">
                  What year did you start your gunsmith business?
                </p>
              )}
              <input 
                className="input text-lg p-4 h-14" 
                {...register('year_started')} 
                placeholder="e.g., 1999"
                type="number"
                min="1900"
                max="2024"
              />
              {errors.year_started && <p className="text-red-400 text-lg mt-2">⚠️ {errors.year_started.message}</p>}
            </div>

            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">
                FFL License Number *
                <button type="button" onClick={() => toggleHelp('ffl')} className="ml-2 text-gunsmith-gold">
                  <HelpCircle className="h-5 w-5 inline" />
                </button>
              </label>
              {showHelp.ffl && (
                <p className="text-gunsmith-text-secondary mb-3 p-3 bg-gunsmith-accent rounded">
                  Your Federal Firearms License number (15 characters: 14 numbers + 1 letter).
                </p>
              )}
              <input 
                className="input text-lg p-4 h-14 font-mono" 
                {...register('ffl_license_number')} 
                placeholder="e.g., 12345678901234A"
              />
              {errors.ffl_license_number && <p className="text-red-400 text-lg mt-2">⚠️ {errors.ffl_license_number.message}</p>}
            </div>

            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">
                Contact Name *
                <button type="button" onClick={() => toggleHelp('contact_name')} className="ml-2 text-gunsmith-gold">
                  <HelpCircle className="h-5 w-5 inline" />
                </button>
              </label>
              {showHelp.contact_name && (
                <p className="text-gunsmith-text-secondary mb-3 p-3 bg-gunsmith-accent rounded">
                  The main person customers should contact (usually the owner or manager).
                </p>
              )}
              <input 
                className="input text-lg p-4 h-14" 
                {...register('contact_name')} 
                placeholder="e.g., John Smith"
              />
              {errors.contact_name && <p className="text-red-400 text-lg mt-2">⚠️ {errors.contact_name.message}</p>}
            </div>

            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">Phone Number *</label>
              <input 
                className="input text-lg p-4 h-14" 
                {...register('phone')} 
                placeholder="(555) 123-4567"
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value)
                  e.target.value = formatted
                }}
              />
              {errors.phone && <p className="text-red-400 text-lg mt-2">⚠️ {errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">Email Address *</label>
              <input 
                className="input text-lg p-4 h-14" 
                {...register('email')} 
                type="email"
                placeholder="e.g., john@smithgunsmithing.com"
              />
              {errors.email && <p className="text-red-400 text-lg mt-2">⚠️ {errors.email.message}</p>}
            </div>
          </div>
        </div>

        {/* Step 2: Location */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">2</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">BUSINESS LOCATION</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xl font-medium text-gunsmith-text mb-3">
                Street Address *
                <MapPin className="h-5 w-5 inline ml-2 text-gunsmith-gold" />
              </label>
              <input 
                className="input text-lg p-4 h-14" 
                {...register('street_address', {
                  required: 'Street address is required'
                })} 
                ref={(e) => {
                  if (e) addressInputRef.current = e
                }}
                placeholder="🔍 Start typing your address..."
              />
              {errors.street_address && <p className="text-red-400 text-lg mt-2">⚠️ {errors.street_address.message}</p>}
            </div>
            
            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">City *</label>
              <input 
                className="input text-lg p-4 h-14" 
                {...register('city')} 
                placeholder="e.g., Denver"
              />
              {errors.city && <p className="text-red-400 text-lg mt-2">⚠️ {errors.city.message}</p>}
            </div>

            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">ZIP Code *</label>
              <input 
                className="input text-lg p-4 h-14" 
                {...register('postal_code')} 
                placeholder="e.g., 80202"
                maxLength={5}
              />
              {errors.postal_code && <p className="text-red-400 text-lg mt-2">⚠️ {errors.postal_code.message}</p>}
            </div>

            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">State *</label>
              <select className="input text-lg p-4 h-14" {...register('state_province')} defaultValue="">
                <option value="" disabled>👆 Click to Select Your State</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state_province && <p className="text-red-400 text-lg mt-2">⚠️ {errors.state_province.message}</p>}
            </div>
          </div>
        </div>

        {/* Step 3: Business Hours */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">3</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">BUSINESS HOURS</h3>
            <Clock className="h-6 w-6 text-gunsmith-gold" />
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

          <div className="mt-6 p-4 bg-gunsmith-gold/10 rounded-lg">
            <p className="text-gunsmith-text text-lg">
              💡 <strong>Tip:</strong> Set one day's hours, then click "Copy to All" to save time!
            </p>
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
              className="btn-primary text-lg px-6 py-3"
            >
              ✅ Select All Services
            </button>
            <button
              type="button"
              onClick={clearAllServices}
              className="btn-secondary text-lg px-6 py-3"
            >
              ❌ Clear All
            </button>
            <p className="text-gunsmith-text-secondary text-lg flex items-center">
              Selected: <span className="text-gunsmith-gold font-bold ml-2">{selectedServices.length}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={`p-6 rounded-lg border-2 transition-all duration-200 text-left min-h-[80px] flex items-center ${
                  selectedServices.includes(service)
                    ? 'bg-gunsmith-gold text-gunsmith-black border-gunsmith-gold shadow-lg transform scale-105'
                    : 'bg-gunsmith-accent border-gunsmith-border text-gunsmith-text hover:border-gunsmith-gold hover:bg-gunsmith-gold/10'
                }`}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedServices.includes(service) ? 'bg-gunsmith-black border-gunsmith-black' : 'border-gunsmith-gold'
                  }`}>
                    {selectedServices.includes(service) && <CheckCircle className="h-4 w-4 text-gunsmith-gold" />}
                  </div>
                  <span className="text-lg font-medium">{service}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 5: Images */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">5</div>
            <h3 className="font-bebas text-3xl text-gunsmith-gold">PHOTOS OF YOUR BUSINESS</h3>
            <Upload className="h-6 w-6 text-gunsmith-gold" />
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
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">
                Website
                <button type="button" onClick={() => toggleHelp('website')} className="ml-2 text-gunsmith-gold">
                  <HelpCircle className="h-5 w-5 inline" />
                </button>
              </label>
              {showHelp.website && (
                <p className="text-gunsmith-text-secondary mb-3 p-3 bg-gunsmith-accent rounded">
                  Just type your website name (we'll add https:// automatically).
                </p>
              )}
              <input 
                className="input text-lg p-4 h-14" 
                {...register('website_url')} 
                placeholder="e.g., smithgunsmithing.com"
                onBlur={(e) => {
                  const formatted = formatWebsiteUrl(e.target.value)
                  setValue('website_url', formatted)
                }}
              />
              {errors.website_url && <p className="text-red-400 text-lg mt-2">⚠️ {errors.website_url.message as string}</p>}
            </div>
            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">
                Facebook Username
                <button type="button" onClick={() => toggleHelp('facebook')} className="ml-2 text-gunsmith-gold">
                  <HelpCircle className="h-5 w-5 inline" />
                </button>
              </label>
              {showHelp.facebook && (
                <p className="text-gunsmith-text-secondary mb-3 p-3 bg-gunsmith-accent rounded">
                  Just your Facebook page name (we'll create the full link).
                </p>
              )}
              <input 
                className="input text-lg p-4 h-14" 
                {...register('facebook_url')} 
                placeholder="e.g., smithgunsmithing"
                onBlur={(e) => {
                  const formatted = formatSocialUrl('facebook', e.target.value)
                  setValue('facebook_url', formatted)
                }}
              />
            </div>
            <div>
              <label className="block text-xl font-medium text-gunsmith-text mb-3">
                Instagram Username
                <button type="button" onClick={() => toggleHelp('instagram')} className="ml-2 text-gunsmith-gold">
                  <HelpCircle className="h-5 w-5 inline" />
                </button>
              </label>
              {showHelp.instagram && (
                <p className="text-gunsmith-text-secondary mb-3 p-3 bg-gunsmith-accent rounded">
                  Just your Instagram username (we'll create the full link).
                </p>
              )}
              <input 
                className="input text-lg p-4 h-14" 
                {...register('instagram_url')} 
                placeholder="e.g., @smithgunsmithing"
                onBlur={(e) => {
                  const formatted = formatSocialUrl('instagram', e.target.value)
                  setValue('instagram_url', formatted)
                }}
              />
            </div>
          </div>
        </div>

        {/* Step 7: Specialties */}
        <div className="bg-gunsmith-card p-8 rounded-lg border-2 border-gunsmith-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gunsmith-gold text-gunsmith-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">7</div>
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
                className="btn-primary text-xl px-8 py-4 min-h-[60px] min-w-[200px]"
              >
                {submitting ? '⏳ Submitting...' : '🚀 Submit My Business'}
              </button>
              
              <button 
                type="button" 
                className="btn-secondary text-xl px-8 py-4 min-h-[60px] min-w-[200px]"
                onClick={() => {
                  localStorage.setItem('business-form-draft', JSON.stringify({
                    formData: watch(),
                    selectedServices,
                    businessHours
                  }))
                  alert('✅ Your progress has been saved! You can return later to finish.')
                }}
              >
                💾 Save & Continue Later
              </button>
            </div>
            
            <p className="text-gunsmith-text-secondary text-base mt-4">
              By submitting, you agree your listing will be reviewed for verification.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}