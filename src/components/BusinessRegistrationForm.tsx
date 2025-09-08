'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessFormSchema, type BusinessFormValues, STATES } from '@/lib/validations/businessForm'
import { supabase } from '@/lib/supabase'

const SERVICES = [
  'Custom Rifle Builds','Custom Pistol Builds','AR-15 Builds','Bolt Action Rifle Work','Trigger Installation/Tuning','Barrel Threading','Muzzle Device Installation','Scope Mounting','Sight Installation','Cerakote Coating','Bluing/Refinishing','Stock Work/Bedding','Action Blueprinting','Barrel Installation','Recoil Pad Installation','Sling Swivel Installation','Safety Repairs','Feed Ramp Polishing','Chamber Work','Headspace Checking','Trigger Guard Installation','Magazine Well Work','Checkering','Engraving','Parts Fabrication','Restoration Work','Competition Prep','Hunting Rifle Setup','Tactical Modifications','General Repairs'
]

type UploadPreview = { file: File, url: string }

export default function BusinessRegistrationForm() {
  const [submitting, setSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<UploadPreview | null>(null)
  const [coverPreview, setCoverPreview] = useState<UploadPreview | null>(null)
  const [projectPreviews, setProjectPreviews] = useState<UploadPreview[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      services: [],
    },
  })

  function validateAndPreview(file: File, maxMB: number, set: (p: UploadPreview) => void) {
    const ok = ['image/jpeg','image/png'].includes(file.type) && file.size <= maxMB * 1024 * 1024
    if (!ok) { setMessage(`Invalid file. JPG/PNG up to ${maxMB}MB.`); return }
    const url = URL.createObjectURL(file)
    set({ file, url })
  }

  function handleProjects(files: FileList | null) {
    if (!files) return
    const arr: UploadPreview[] = []
    Array.from(files).slice(0, 10).forEach((f) => {
      const ok = ['image/jpeg','image/png'].includes(f.type) && f.size <= 3 * 1024 * 1024
      if (ok) arr.push({ file: f, url: URL.createObjectURL(f) })
    })
    setProjectPreviews(arr)
  }

  async function uploadToStorage(bucket: string, path: string, file: File): Promise<string | null> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) return null
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return pub?.publicUrl || null
  }

  async function onSubmit(values: BusinessFormValues) {
    try {
      setSubmitting(true)
      setMessage(null)

      // Upload media
      const uploads: Record<string, string | null> = {}
      const id = crypto.randomUUID()

      if (logoPreview?.file) {
        uploads.logo_url = await uploadToStorage('images', `logos/${id}-logo-${logoPreview.file.name}`, logoPreview.file)
      }
      if (coverPreview?.file) {
        uploads.cover_image_url = await uploadToStorage('images', `covers/${id}-cover-${coverPreview.file.name}`, coverPreview.file)
      }
      let gallery: string[] = []
      if (projectPreviews.length) {
        for (const p of projectPreviews) {
          const url = await uploadToStorage('images', `projects/${id}-${p.file.name}`, p.file)
          if (url) gallery.push(url)
        }
      }

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
        business_hours: {
          mon_fri: values.hours_mon_fri || '',
          sat: values.hours_sat || '',
          sun: values.hours_sun || '',
        },
        tags: values.services && values.services.length ? values.services : [],
        description: values.specialties || '',
        status: 'pending',
        verification_status: 'pending',
        ...uploads,
        image_gallery: gallery,
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
            <label className="label">Year Started</label>
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
        <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">BUSINESS HOURS</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label">Mon - Fri</label>
            <input className="input" {...register('hours_mon_fri')} placeholder="9AM - 6PM" />
          </div>
          <div>
            <label className="label">Saturday</label>
            <input className="input" {...register('hours_sat')} placeholder="9AM - 4PM" />
          </div>
          <div>
            <label className="label">Sunday</label>
            <input className="input" {...register('hours_sun')} placeholder="Closed" />
          </div>
        </div>
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
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Business Logo (JPG/PNG, max 2MB)</label>
            <input type="file" accept="image/jpeg,image/png" onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) validateAndPreview(f, 2, (p) => setLogoPreview(p))
            }} />
            {logoPreview && <img src={logoPreview.url} alt="logo preview" className="mt-2 h-16 w-16 object-cover rounded" />}
          </div>
          <div>
            <label className="label">Cover Image (JPG/PNG, max 5MB)</label>
            <input type="file" accept="image/jpeg,image/png" onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) validateAndPreview(f, 5, (p) => setCoverPreview(p))
            }} />
            {coverPreview && <img src={coverPreview.url} alt="cover preview" className="mt-2 h-24 w-full object-cover rounded" />}
          </div>
          <div className="md:col-span-2">
            <label className="label">Project Photos (JPG/PNG, up to 10)</label>
            <input type="file" accept="image/jpeg,image/png" multiple onChange={(e) => handleProjects(e.target.files)} />
            {projectPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2">
                {projectPreviews.map((p, i) => (
                  <img key={i} src={p.url} className="h-20 w-full object-cover rounded" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="card">
        <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">SERVICES OFFERED</h3>
        <div className="grid md:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-2">
          {SERVICES.map((s) => (
            <label key={s} className="flex items-center gap-2 text-gunsmith-text">
              <input type="checkbox" className="checkbox" value={s} onChange={(e) => {
                setValue('services', (prev => {
                  const p = prev || []
                  if (e.target.checked) return [...p, s]
                  return p.filter((x) => x !== s)
                })())
              }} />
              <span>{s}</span>
            </label>
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


