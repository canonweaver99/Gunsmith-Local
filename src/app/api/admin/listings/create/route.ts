import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      business_name,
      city,
      state_province,
      address,
      postal_code,
      phone,
      email,
      website,
      description,
      category = 'Gunsmith',
      status = 'active',
    } = body || {}

    if (!business_name) return NextResponse.json({ error: 'business_name is required' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

    const admin = createClient(supabaseUrl, serviceKey)

    // Build base slug from name + city
    const base = slugify(`${business_name}-${city || ''}`)
    let unique = base || slugify(business_name)
    let attempt = 1
    // Ensure uniqueness
    while (true) {
      const { data: exists } = await admin
        .from('listings')
        .select('id')
        .eq('slug', unique)
        .maybeSingle()
      if (!exists) break
      attempt += 1
      unique = `${base}-${attempt}`
    }

    const payload: any = {
      business_name,
      slug: unique,
      city: city || null,
      state_province: state_province || null,
      address: address || null,
      street_address: address || null,
      postal_code: postal_code || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      description: description || null,
      category,
      status,
      // key requirement: do NOT assign ownership when created by admin
      owner_id: null,
    }

    const { data, error } = await admin.from('listings').insert(payload).select('id, slug').maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ id: data?.id, slug: data?.slug })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}


