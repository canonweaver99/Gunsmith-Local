import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnon) {
      // Gracefully degrade instead of throwing 500 when env is missing
      return NextResponse.json(
        { available: 0, total: 3, current: 0, error: 'Supabase not configured' },
        { status: 503 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnon)

    // Prefer listings table columns if present: featured_until in the future
    const today = new Date().toISOString().slice(0, 10)
    let currentFeatured = 0

    try {
      // Primary: featured_until column (date) and is_featured flag
      const { data: flagged, error: flaggedErr } = await supabase
        .from('listings')
        .select('id')
        .eq('is_featured', true)
        .gte('featured_until', today)

      if (!flaggedErr) {
        currentFeatured = flagged?.length || 0
      } else {
        // Fallback to presence of is_featured only
        const { data: legacy, error: legacyErr } = await supabase
          .from('listings')
          .select('id')
          .eq('is_featured', true)

        if (!legacyErr) currentFeatured = legacy?.length || 0
      }
    } catch (e) {
      // Swallow and treat as zero if any schema issues occur
      currentFeatured = 0
    }
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