import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { requesterId } = await request.json()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    if (!requesterId) {
      return NextResponse.json({ error: 'requesterId is required' }, { status: 400 })
    }

    const adminClient = createClient(supabaseUrl, serviceKey)

    // Verify requester is admin
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', requesterId)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all listing ids
    const { data: listings, error: listErr } = await adminClient
      .from('listings')
      .select('id')

    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 500 })
    }

    const ids = (listings || []).map(l => l.id)
    if (ids.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 })
    }

    const inFilter = (col: string) => ({ method: 'in', column: col, values: ids })

    // Delete dependent rows first to avoid FK issues
    const steps: Array<Promise<any>> = [
      adminClient.from('favorites').delete().in('listing_id', ids),
      adminClient.from('reviews').delete().in('listing_id', ids),
      adminClient.from('featured_transactions').delete().in('listing_id', ids),
      adminClient.from('business_claims').delete().in('listing_id', ids),
      // Some schemas might use claimed_listing_id
      adminClient.from('business_claims').delete().in('claimed_listing_id', ids),
    ]

    for (const p of steps) {
      const { error } = await p
      if (error && !String(error.message || '').includes('does not exist')) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    const { error: delListingsErr } = await adminClient.from('listings').delete().in('id', ids)
    if (delListingsErr) {
      return NextResponse.json({ error: delListingsErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted: ids.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}


