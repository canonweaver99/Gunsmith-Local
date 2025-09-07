import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Count current active featured listings
    const { data: featuredListings, error } = await supabase
      .from('listings')
      .select('id')
      .eq('is_featured', true)
      .gt('featured_until', new Date().toISOString())

    if (error) {
      console.error('Error checking featured listings:', error)
      return NextResponse.json({ available: 0, total: 3 })
    }

    const currentFeatured = featuredListings?.length || 0
    const maxFeatured = 3
    const available = Math.max(0, maxFeatured - currentFeatured)

    return NextResponse.json({
      available,
      total: maxFeatured,
      current: currentFeatured
    })
  } catch (error) {
    console.error('Error in availability API:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}