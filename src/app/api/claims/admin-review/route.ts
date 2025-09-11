import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { claimId, approve } = await req.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    // Use user's auth token so auth.uid() is set inside the RPC
    const authHeader = req.headers.get('authorization') || ''
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error } = await userClient.rpc('admin_review_claim', {
      in_claim_id: claimId,
      in_approve: !!approve,
    })
    if (error) return NextResponse.json({ error: error.message || 'RPC failed' }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}


