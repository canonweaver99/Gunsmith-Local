import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { listingId, approve } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    // Call the appropriate Supabase function
    const { data, error } = await supabase.rpc(
      approve ? 'verify_business' : 'reject_business_verification',
      { listing_id: listingId }
    )

    if (error) {
      console.error('Error processing FFL verification:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: approve ? 'FFL license verified successfully' : 'Verification rejected'
    })
  } catch (error) {
    console.error('Error in verify-ffl API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
