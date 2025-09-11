import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { listingId } = await req.json()
    if (!listingId) return NextResponse.json({ error: 'listingId is required' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

    const admin = createClient(supabaseUrl, serviceKey)

    // Null out owner and claimed fields
    const { error } = await admin
      .from('listings')
      .update({ owner_id: null, claimed_by: null, claimed_at: null })
      .eq('id', listingId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}


