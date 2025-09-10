import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json()
    if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const admin = createClient(supabaseUrl, serviceKey)

    // Best-effort cleanup of dependent rows before deletion
    const cleanupTables = [
      { table: 'pending_edits', column: 'listing_id' },
      { table: 'business_claims', column: 'listing_id' },
      { table: 'contact_messages', column: 'listing_id' },
      { table: 'featured_transactions', column: 'listing_id' },
      { table: 'listing_views', column: 'listing_id' },
      { table: 'reviews', column: 'listing_id' },
    ] as const

    for (const c of cleanupTables) {
      await admin.from(c.table as any).delete().eq(c.column as any, listingId)
    }

    const { error } = await admin.from('listings').delete().eq('id', listingId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}


