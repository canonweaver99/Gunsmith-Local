"use server"

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const listingSchema = z.object({
  business_name: z.string().min(2),
  slug: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state_province: z.string().optional(),
  postal_code: z.string().optional(),
  latitude: z.preprocess(v => v === '' || v === undefined ? undefined : Number(v), z.number().finite().optional()),
  longitude: z.preprocess(v => v === '' || v === undefined ? undefined : Number(v), z.number().finite().optional()),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
  business_hours: z.any().optional(),
  is_featured: z.boolean().optional().default(false),
  status: z.enum(['Active','Inactive'])
})

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')</n+    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function assertAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const admin = createClient(url, anon)
  const { data: { user } } = await admin.auth.getUser()
  if (!user) return { isAdmin: false, user: null, client: admin }
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
  return { isAdmin: profile?.role === 'admin', user, client: admin }
}

export async function createListing(formData: FormData) {
  const { isAdmin, client } = await assertAdmin()
  if (!isAdmin) redirect('/admin')

  // Build object
  const raw = Object.fromEntries(formData.entries()) as Record<string, any>
  // Parse JSON field if provided
  if (typeof raw.business_hours === 'string' && raw.business_hours.trim() !== '') {
    try {
      raw.business_hours = JSON.parse(raw.business_hours)
    } catch {
      return { ok: false, error: 'Invalid business_hours JSON' }
    }
  } else {
    raw.business_hours = null
  }

  // Normalize status to lower-case labels used in DB if applicable
  const parsed = listingSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors.map(e => e.message).join(', ') }
  }
  const values = parsed.data

  // Generate/ensure unique slug
  let base = slugify(values.slug || values.business_name)
  if (!base) base = slugify(values.business_name)
  let unique = base
  for (let i = 2; i < 22; i++) {
    const { data: existing } = await client.from('listings').select('id').eq('slug', unique).maybeSingle()
    if (!existing) break
    unique = `${base}-${i}`
  }

  const payload: any = {
    business_name: values.business_name,
    slug: unique,
    description: values.description || null,
    category: values.category || null,
    address: values.address || null,
    city: values.city || null,
    state_province: values.state_province || null,
    postal_code: values.postal_code || null,
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    phone: values.phone || null,
    email: values.email || null,
    website: values.website || null,
    cover_image_url: values.cover_image_url || null,
    business_hours: values.business_hours || null,
    is_featured: values.is_featured || false,
    status: values.status,
  }

  // Try insert, handle duplicate slug race by suffix loop
  for (let attempt = 0; attempt < 20; attempt++) {
    const { error } = await client.from('listings').insert(payload)
    if (!error) {
      redirect('/admin/listings?created=1')
    }
    if (String(error.message || '').toLowerCase().includes('duplicate') || String(error.code || '') === '23505') {
      payload.slug = `${base}-${Math.floor(2 + Math.random() * 10000)}`
      continue
    }
    return { ok: false, error: error.message }
  }

  return { ok: false, error: 'Failed to create listing after multiple attempts' }
}


