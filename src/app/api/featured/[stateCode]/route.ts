import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { stateCode: string } }
) {
  try {
    const { stateCode } = params

    // Fetch featured listings for the state
    // Support two schemas:
    // - New: is_featured_in_state = stateCode
    // - Legacy: is_featured = true AND state_province = stateCode
    const { data: featuredListings, error: featuredError } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .or(`is_featured_in_state.eq.${stateCode},and(is_featured.eq.true,state_province.eq.${stateCode})`)
      .order('is_featured', { ascending: false })
      .order('is_verified', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3)

    if (featuredError) throw featuredError

    // If we have less than 3 featured, fetch some regular listings
    let regularListings = []
    if (!featuredListings || featuredListings.length < 3) {
      const { data: regular, error: regularError } = await supabase
        .from('listings')
        .select('*')
        .eq('state_province', stateCode)
        .eq('status', 'active')
        .is('is_featured_in_state', null)
        .order('is_verified', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3 - (featuredListings?.length || 0))

      if (regularError) throw regularError
      regularListings = regular || []
    }

    return NextResponse.json({
      featured: featuredListings || [],
      regular: regularListings,
      availableSlots: 3 - (featuredListings?.length || 0)
    })
  } catch (error) {
    console.error('Error fetching featured listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured listings' },
      { status: 500 }
    )
  }
}
