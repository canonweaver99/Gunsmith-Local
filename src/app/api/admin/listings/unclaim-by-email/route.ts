import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })

    const admin = createClient(supabaseUrl, serviceKey)

    // Find user id by email
    const { data: userRow, error: userErr } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 })
    if (!userRow) return NextResponse.json({ success: true, updated: 0 })

    // Unclaim all listings owned by this user
    const { data, error } = await admin
      .from('listings')
      .update({ owner_id: null, claimed_by: null, claimed_at: null })
      .eq('owner_id', userRow.id)
      .select('id')

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true, updated: (data || []).length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}


