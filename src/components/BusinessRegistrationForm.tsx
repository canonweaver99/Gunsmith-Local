'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessFormSchema, type BusinessFormValues, STATES } from '@/lib/validations/businessForm'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/ImageUpload'
import BusinessHoursEditor from '@/components/BusinessHoursEditor'

const SERVICES = [
  'Custom Rifle Builds','Custom Pistol Builds','AR-15 Builds','Bolt Action Rifle Work','Trigger Installation/Tuning','Barrel Threading','Muzzle Device Installation','Scope Mounting','Sight Installation','Cerakote Coating','Bluing/Refinishing','Stock Work/Bedding','Action Blueprinting','Barrel Installation','Recoil Pad Installation','Sling Swivel Installation','Safety Repairs','Feed Ramp Polishing','Chamber Work','Headspace Checking','Trigger Guard Installation','Magazine Well Work','Checkering','Engraving','Parts Fabrication','Restoration Work','Competition Prep','Hunting Rifle Setup','Tactical Modifications','General Repairs'
]

export default function BusinessRegistrationForm() {
  const [submitting, setSubmitting] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [coverUrl, setCoverUrl] = useState<string>('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([])
  const [businessHours, setBusinessHours] = useState<any>({})
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      services: [],
    },
  })

  function toggleService(service: string) {
    setSelectedServices(prev => {
      const updated = prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
      setValue('services', updated)
      return updated
    })
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
        website: values.website_url,
        facebook_url: values.facebook_url,
        instagram_url: values.instagram_url,
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
      setMessage('Submission received! We will review and verify your information.')
    } catch (e: any) {
      setMessage(e?.message || 'Failed to submit form')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {message && (
        <div className="card border-gunsmith-gold/40 text-gunsmith-gold">{message}</div>
      )}

      {/* Basic Information */}
      <div className="card">
        <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">BASIC INFORMATION</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Business Name</label>
            <input className="input" {...register('business_name')} />
            {errors.business_name && <p className="error-text">{errors.business_name.message}</p>}
          </div>
          <div>
            <label className="label">Year Founded</label>
            <input className="input" {...register('year_started')} placeholder="1999" />
            {errors.year_started && <p className="error-text">{errors.year_started.message}</p>}
          </div>
          <div>
            <label className="label">FFL License Number</label>
            <input className="input" {...register('ffl_license_number')} />
            {errors.ffl_license_number && <p className="error-text">{errors.ffl_license_number.message}</p>}
          </div>
          <div>
            <label className="label">Contact Name</label>
            <input className="input" {...register('contact_name')} />
            {errors.contact_name && <p className="error-text">{errors.contact_name.message}</p>}
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" {...register('phone')} placeholder="(555) 555-5555" />
            {errors.phone && <p className="error-text">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="label">Email Address</label>
            <input className="input" {...register('email')} type="email" />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="card">
        <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">LOCATION</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">Street Address</label>
            <input className="input" {...register('street_address')} />
            {errors.street_address && <p className="error-text">{errors.street_address.message}</p>}
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" {...register('city')} />
            {errors.city && <p className="error-text">{errors.city.message}</p>}
          </div>
          <div>
            <label className="label">State</label>
            <select className="input" {...register('state_province')} defaultValue="">
              <option value="" disabled>Select a state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.state_province && <p className="error-text">{errors.state_province.message}</p>}
          </div>
          <div>
            <label className="label">ZIP Code</label>
            <input className="input" {...register('postal_code')} />
            {errors.postal_code && <p className="error-text">{errors.postal_code.message}</p>}
          </div>
        </div>
      </div>

      {/* Hours */}
      <div className="card">
        <BusinessHoursEditor
          value={businessHours}
          onChange={setBusinessHours}
        />
      </div>

      {/* Online */}
      <div className="card">
        <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">ONLINE PRESENCE</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">Website</label>
            <input className="input" {...register('website_url')} placeholder="https://" />
            {errors.website_url && <p className="error-text">{errors.website_url.message as string}</p>}
          </div>
          <div>
            <label className="label">Facebook</label>
            <input className="input" {...register('facebook_url')} placeholder="https://" />
          </div>
          <div>
            <label className="label">Instagram</label>
            <input className="input" {...register('instagram_url')} placeholder="https://" />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="card">
        <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">IMAGES & MEDIA</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <ImageUpload
              label="Business Logo"
              value={logoUrl}
              onChange={(url) => setLogoUrl(typeof url === 'string' ? url : '')}
              maxSizeMB={2}
              preview={true}
            />
          </div>
          <div>
            <ImageUpload
              label="Cover Image"
              value={coverUrl}
              onChange={(url) => setCoverUrl(typeof url === 'string' ? url : '')}
              maxSizeMB={5}
              preview={true}
            />
          </div>
          <div className="md:col-span-2">
            <ImageUpload
              label="Project Photos"
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

      {/* Services */}
      <div className="card">
        <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">SERVICES OFFERED</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
          {SERVICES.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => toggleService(service)}
              className={`p-3 rounded-lg border transition-all duration-200 text-sm text-left ${
                selectedServices.includes(service)
                  ? 'bg-gunsmith-gold text-gunsmith-black border-gunsmith-gold'
                  : 'bg-gunsmith-accent border-gunsmith-border text-gunsmith-text hover:border-gunsmith-gold hover:bg-gunsmith-gold/10'
              }`}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div className="card">
        <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">SPECIALTIES</h3>
        <textarea className="input min-h-24" {...register('specialties')} placeholder="Describe your unique expertise..." />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
        <span className="text-gunsmith-text-secondary text-sm">By submitting, you agree your listing will be reviewed for verification.</span>
      </div>
    </form>
  )
}