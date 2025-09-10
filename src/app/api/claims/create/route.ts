import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { listingId, proposedEdits, fflLicenseNumber, fflDocumentUrl, userId } = await req.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    // Use the user's auth token so auth.uid() inside the RPC is set correctly
    const authHeader = req.headers.get('authorization') || ''
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    })

    // Execute SECURITY DEFINER RPC as the user
    const { data, error } = await userClient.rpc('create_business_claim', {
      in_listing_id: listingId,
      in_proposed_edits: proposedEdits || {},
      in_ffl_license_number: fflLicenseNumber || null,
      in_ffl_document_url: fflDocumentUrl || null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ claimId: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}


