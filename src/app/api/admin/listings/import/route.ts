import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

export async function POST(req: NextRequest) {
  try {
    const { rows } = await req.json()
    if (!Array.isArray(rows) || rows.length === 0) return NextResponse.json({ error: 'No rows provided' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

    const admin = createClient(supabaseUrl, serviceKey)

    const payloads = [] as any[]
    for (const r of rows) {
      const name = (r.business_name || r.name || '').trim()
      if (!name) continue
      const city = (r.city || '').trim()
      const base = slugify(`${name}-${city}` || name)
      let slug = base
      let i = 1
      while (true) {
        const { data: exists } = await admin.from('listings').select('id').eq('slug', slug).maybeSingle()
        if (!exists) break
        i += 1
        slug = `${base}-${i}`
      }
      payloads.push({
        business_name: name,
        slug,
        address: r.address || null,
        street_address: r.address || null,
        city: city || null,
        state_province: r.state_province || r.state || null,
        postal_code: r.postal_code || r.zip || null,
        phone: r.phone || null,
        email: r.email || null,
        website: r.website || null,
        description: r.description || null,
        category: r.category || 'Gunsmith',
        status: r.status || 'active',
        owner_id: null,
      })
      if (payloads.length >= 500) {
        const { error } = await admin.from('listings').insert(payloads)
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        payloads.length = 0
      }
    }

    if (payloads.length > 0) {
      const { error } = await admin.from('listings').insert(payloads)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}


