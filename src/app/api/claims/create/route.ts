import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { listingId, proposedEdits, fflLicenseNumber, fflDocumentUrl, userId } = await req.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const adminClient = createClient(supabaseUrl, serviceKey)

    // Execute SECURITY DEFINER RPC (auth.uid() unused here; we pass userId for auditing if needed)
    const { data, error } = await adminClient.rpc('create_business_claim', {
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


