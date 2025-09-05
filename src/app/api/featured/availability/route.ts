import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const stateCode = searchParams.get('state')

    if (!stateCode) {
      return NextResponse.json(
        { error: 'State code is required' },
        { status: 400 }
      )
    }

    // Count active featured listings in the state
    const { count, error } = await supabase
      .from('featured_listings')
      .select('*', { count: 'exact', head: true })
      .eq('state_code', stateCode)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())

    if (error) throw error

    const availableSlots = 3 - (count || 0)

    return NextResponse.json({
      stateCode,
      totalSlots: 3,
      usedSlots: count || 0,
      availableSlots,
      available: availableSlots > 0
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}
