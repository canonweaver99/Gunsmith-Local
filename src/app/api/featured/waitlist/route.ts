import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { listingId, userId, stateCode } = await request.json()

    if (!listingId || !userId || !stateCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if already on waitlist
    const { data: existing } = await supabase
      .from('featured_waitlist')
      .select('id')
      .eq('listing_id', listingId)
      .eq('user_id', userId)
      .eq('status', 'waiting')
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Already on waitlist for this listing' },
        { status: 400 }
      )
    }

    // Add to waitlist
    const { data, error } = await supabase
      .from('featured_waitlist')
      .insert([{
        listing_id: listingId,
        user_id: userId,
        state_code: stateCode,
        status: 'waiting'
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, waitlistEntry: data })

  } catch (error: any) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}
