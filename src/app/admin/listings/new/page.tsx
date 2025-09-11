'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'
import ImageUpload from '@/components/ImageUpload'
import { createListing } from './actions'

const listingSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  slug: z.string().min(1, 'Slug required'),
  description: z.string().optional(),
  category: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  latitude: z.preprocess(v => v === '' ? undefined : Number(v), z.number().finite().optional()),
  longitude: z.preprocess(v => v === '' ? undefined : Number(v), z.number().finite().optional()),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  website: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  cover_image_url: z.string().url().optional(),
  business_hours: z.any().optional(),
  is_featured: z.boolean().default(false),
  status: z.enum(['Active','Inactive'])
})

type FormValues = z.infer<typeof listingSchema>

export default function AdminNewListingPage() {
  const router = useRouter()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const DAYS: Array<keyof any> = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '10:00', close: '14:00', closed: true },
    sunday: { open: '10:00', close: '14:00', closed: true },
  })

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: { status: 'Active', is_featured: false }
  })

  const name = watch('business_name')
  useEffect(() => {
    if (name) setValue('slug', slugify(name))
  }, [name, setValue])

  const slug = watch('slug')
  const [slugStatus, setSlugStatus] = useState<'checking' | 'available' | 'taken' | null>(null)
  useEffect(() => {
    let active = true
    async function check() {
      if (!slug) return
      setSlugStatus('checking')
      const { data } = await supabase.from('listings').select('id').eq('slug', slug).maybeSingle()
      if (!active) return
      setSlugStatus(data ? 'taken' : 'available')
    }
    check()
    return () => { active = false }
  }, [slug])

  async function onSubmit(values: FormValues) {
    // Prepare FormData for server action
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (k === 'business_hours') return
      fd.append(k, String(v))
    })
    // Attach business_hours from table
    const hoursPayload: Record<string, any> = {}
    Object.entries(hours).forEach(([day, cfg]) => {
      hoursPayload[day] = cfg.closed
        ? { closed: true }
        : { open: cfg.open, close: cfg.close, closed: false }
    })
    fd.append('business_hours', JSON.stringify(hoursPayload))
    const res = await createListing(fd)
    if ((res as any)?.ok === false) {
      setToast({ type: 'error', message: (res as any).error })
    }
  }

  return (
    <div className="min-h-screen bg-gunsmith-black py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="card">
          {toast && (
            <div className={`mb-4 p-3 rounded border ${toast.type==='success' ? 'bg-green-500/15 border-green-500 text-green-400' : 'bg-gunsmith-error/20 border-gunsmith-error text-gunsmith-error'}`}>{toast.message}</div>
          )}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-bebas text-3xl text-gunsmith-gold">ADD LISTING</h1>
            <button className="btn-secondary" onClick={() => router.push('/admin/listings')}>Cancel</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: main fields */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="label">Business Name</label>
                <input className="input w-full" {...register('business_name')} />
                {errors.business_name && <p className="text-gunsmith-error text-sm">{errors.business_name.message}</p>}
              </div>
              <div>
                <label className="label">Slug</label>
                <div className="flex items-center gap-2">
                  <input className="input w-full" readOnly {...register('slug')} />
                  <button type="button" className="btn-secondary" onClick={() => setValue('slug', slugify(watch('business_name') || ''))}>Refresh</button>
                </div>
                {slug && (
                  <p className={`text-xs mt-1 ${slugStatus==='available' ? 'text-green-400' : slugStatus==='taken' ? 'text-gunsmith-error' : 'text-gunsmith-text-secondary'}`}>
                    {slugStatus==='checking' ? 'Checking…' : slugStatus==='available' ? '✓ available' : slugStatus==='taken' ? '✕ taken' : ''}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input w-full h-28" {...register('description')} />
              </div>
              <div>
                <label className="label">Category</label>
                <input className="input w-full" {...register('category')} />
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input w-full" {...register('address')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">City</label>
                  <input className="input w-full" {...register('city')} />
                </div>
                <div>
                  <label className="label">State/Province</label>
                  <input className="input w-full" {...register('state_province')} />
                </div>
                <div>
                  <label className="label">Postal Code</label>
                  <input className="input w-full" {...register('postal_code')} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude</label>
                  <input className="input w-full" {...register('latitude')} />
                </div>
                <div>
                  <label className="label">Longitude</label>
                  <input className="input w-full" {...register('longitude')} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input className="input w-full" {...register('phone')} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input w-full" {...register('email')} />
                </div>
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input w-full" placeholder="https://example.com" {...register('website')} />
                {errors.website && <p className="text-gunsmith-error text-sm">Invalid URL</p>}
              </div>

              <div>
                <label className="label">Specialties (multi-select)</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {['Rifle','Pistol','Sniper','Shotgun','Other'].map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const current = (watch('specialties') as any) || []
                          const next = e.target.checked ? [...current, opt] : current.filter((v: string) => v !== opt)
                          setValue('specialties' as any, next as any)
                        }}
                        className="w-4 h-4 rounded border-gunsmith-border bg-gunsmith-accent text-gunsmith-gold focus:ring-gunsmith-gold"
                      />
                      <span className="text-sm text-gunsmith-text">{opt}</span>
                    </label>
                  ))}
                </div>
                {/* store as hidden JSON string for server action parsing */}
                <input type="hidden" value={JSON.stringify((watch('specialties') as any) || [])} {...register('specialties' as any)} />
              </div>

              <div>
                <label className="label">Business Hours</label>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gunsmith-text-secondary">
                        <th className="py-2 pr-4">Day</th>
                        <th className="py-2 pr-4">Open</th>
                        <th className="py-2 pr-4">Close</th>
                        <th className="py-2">Closed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day) => (
                        <tr key={String(day)} className="border-t border-gunsmith-border">
                          <td className="py-2 pr-4 capitalize text-gunsmith-text">{String(day)}</td>
                          <td className="py-2 pr-4">
                            <input
                              type="time"
                              className="input w-full"
                              value={hours[String(day)].open}
                              disabled={hours[String(day)].closed}
                              onChange={(e) => setHours((prev) => ({
                                ...prev,
                                [String(day)]: { ...prev[String(day)], open: e.target.value },
                              }))}
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              type="time"
                              className="input w-full"
                              value={hours[String(day)].close}
                              disabled={hours[String(day)].closed}
                              onChange={(e) => setHours((prev) => ({
                                ...prev,
                                [String(day)]: { ...prev[String(day)], close: e.target.value },
                              }))}
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={hours[String(day)].closed}
                              onChange={(e) => setHours((prev) => ({
                                ...prev,
                                [String(day)]: { ...prev[String(day)], closed: e.target.checked },
                              }))}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      // Copy Monday to Tue–Fri
                      setHours((prev) => {
                        const m = prev.monday
                        return {
                          ...prev,
                          tuesday: { ...m },
                          wednesday: { ...m },
                          thursday: { ...m },
                          friday: { ...m },
                        }
                      })
                    }}
                  >Copy Mon → Fri</button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setHours((prev) => {
                      const next = { ...prev }
                      Object.keys(next).forEach((d) => { next[d] = { open: '09:00', close: '17:00', closed: false } })
                      return next
                    })}
                  >Reset All</button>
                </div>
              </div>
            </div>

            {/* Right: image & meta */}
            <div className="space-y-4">
              <div>
                <label className="label">Cover Image</label>
                <ImageUpload
                  value={watch('cover_image_url') || ''}
                  onChange={(val) => setValue('cover_image_url', (val as string) || '')}
                  multiple={false}
                  maxSizeMB={5}
                />
                <input className="input w-full mt-2" placeholder="...or paste image URL" {...register('cover_image_url')} />
              </div>
              <div>
                <label className="label">Is Featured</label>
                <select className="input w-full" {...register('is_featured') as any}>
                  <option value={false as any}>No</option>
                  <option value={true as any}>Yes</option>
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input w-full" {...register('status')}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Listing'}</button>
                <button type="button" className="btn-ghost w-full mt-2" onClick={() => router.push('/admin/listings')}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
