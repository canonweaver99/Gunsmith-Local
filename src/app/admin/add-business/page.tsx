'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'
import ImageUpload from '@/components/ImageUpload'
import { uploadFile, STORAGE_BUCKETS, STORAGE_PATHS } from '@/lib/storage'

const schema = z.object({
  business_name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state_province: z.string().optional().or(z.literal('')),
  postal_code: z.string().optional().or(z.literal('')),
  latitude: z.preprocess(v => v === '' ? undefined : Number(v), z.number().finite().optional()),
  longitude: z.preprocess(v => v === '' ? undefined : Number(v), z.number().finite().optional()),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  business_hours: z.string().optional().or(z.literal('')),
  is_featured: z.boolean().default(false),
  verification_status: z.enum(['unverified','pending','verified','rejected']).default('unverified'),
  status: z.enum(['active','inactive']).default('active'),
})

type FormValues = z.infer<typeof schema>

export default function AdminAddBusinessPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.push('/')
  }, [user, isAdmin, loading, router])

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { verification_status: 'unverified', is_featured: false, status: 'active' }
  })

  const name = watch('business_name')
  useEffect(() => {
    if (name) setValue('slug', slugify(name))
  }, [name, setValue])

  async function checkSlugUnique(slug: string) {
    const { data } = await supabase.from('listings').select('slug').eq('slug', slug).maybeSingle()
    return !data
  }

  async function onSubmit(values: FormValues) {
    // validate slug uniqueness
    const ok = await checkSlugUnique(values.slug)
    if (!ok) {
      alert('Slug is already taken')
      return
    }

    let hours: any = null
    if (values.business_hours && values.business_hours.trim() !== '') {
      try { hours = JSON.parse(values.business_hours) } catch (e) { alert('Invalid business_hours JSON'); return }
    }

    const payload = {
      ...values,
      business_hours: hours,
    }

    const { error } = await supabase.rpc('admin_create_listing', { p_listing: payload })
    if (error) {
      setToast({ type: 'error', message: error.message })
    } else {
      setToast({ type: 'success', message: 'Listing created' })
      setTimeout(() => router.push('/admin/listings'), 800)
    }
  }

  return (
    <div className="min-h-screen bg-gunsmith-black py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="card">
          {toast && (
            <div className={`mb-4 p-3 rounded border ${toast.type==='success' ? 'bg-green-500/15 border-green-500 text-green-400' : 'bg-gunsmith-error/20 border-gunsmith-error text-gunsmith-error'}`}>
              {toast.message}
            </div>
          )}
          <h1 className="font-bebas text-3xl text-gunsmith-gold mb-4">ADD BUSINESS</h1>
          <p className="text-gunsmith-text-secondary mb-6">Admin-only. Created listings are unclaimed by default.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Business Name</label>
              <input className="input w-full" {...register('business_name')} />
              {errors.business_name && <p className="text-gunsmith-error text-sm">{errors.business_name.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="label">Slug</label>
              <input className="input w-full" {...register('slug')} />
              <p className="text-xs text-gunsmith-text-secondary">Used for the public URL</p>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input w-full h-28" {...register('description')} />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input w-full" {...register('category')} />
            </div>
            <div>
              <label className="label">Website</label>
              <input className="input w-full" {...register('website')} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Cover Image</label>
              <div className="space-y-2">
                <ImageUpload
                  value={watch('cover_image_url') || ''}
                  onChange={(val) => setValue('cover_image_url', (val as string) || '')}
                  multiple={false}
                  maxSizeMB={5}
                  label="Upload or paste a URL below"
                />
                <input className="input w-full" placeholder="...or paste an image URL" {...register('cover_image_url')} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">Address</label>
              <input className="input w-full" {...register('address')} />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input w-full" {...register('city')} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input w-full" {...register('state_province')} />
            </div>
            <div>
              <label className="label">Postal Code</label>
              <input className="input w-full" {...register('postal_code')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input w-full" {...register('phone')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input w-full" {...register('email')} />
            </div>
            <div>
              <label className="label">Latitude</label>
              <input className="input w-full" {...register('latitude')} />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input className="input w-full" {...register('longitude')} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Business Hours (JSON)</label>
              <textarea className="input w-full h-28" placeholder='{"monday":{"open":"09:00","close":"17:00"}}' {...register('business_hours')} />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    const raw = (watch('business_hours') || '').trim()
                    if (!raw) return
                    try {
                      const pretty = JSON.stringify(JSON.parse(raw), null, 2)
                      setValue('business_hours', pretty)
                    } catch (e) {
                      alert('Invalid JSON')
                    }
                  }}
                >Validate & Pretty Print</button>
              </div>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input w-full" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="label">Verification Status</label>
              <select className="input w-full" {...register('verification_status')}>
                <option value="unverified">Unverified</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Create Listing'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


