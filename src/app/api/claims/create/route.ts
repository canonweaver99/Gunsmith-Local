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

    // Get business and user info for admin notification
    try {
      const { data: listing } = await userClient
        .from('listings')
        .select('business_name')
        .eq('id', listingId)
        .single()

      const { data: profile } = await userClient
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single()

      // Notify admin of business claim
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email/admin-business-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'business_claimed',
          userEmail: profile?.email || 'Unknown',
          userName: profile?.full_name || 'Unknown User',
          businessName: listing?.business_name || 'Unknown Business',
          businessDetails: `FFL: ${fflLicenseNumber || 'Not provided'}, Claim ID: ${data}`
        })
      })
    } catch (emailError) {
      console.error('Failed to send admin notification for claim:', emailError)
    }

    return NextResponse.json({ claimId: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
  }
}


