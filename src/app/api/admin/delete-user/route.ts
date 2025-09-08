import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { userId, requesterId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
    }

    // Verify requester is admin
    const adminClient = createClient(supabaseUrl, serviceKey)
    if (requesterId) {
      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('is_admin')
        .eq('id', requesterId)
        .maybeSingle()
      if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
      if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await adminClient.auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}


