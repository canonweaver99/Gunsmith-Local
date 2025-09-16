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

    // Prefer new featured_listings table if present
    // Active where status='active' and end_date >= today
    const today = new Date().toISOString().slice(0, 10)
    let currentFeatured = 0

    try {
      const { data: fl, error: flErr } = await supabase
        .from('featured_listings')
        .select('id')
        .eq('status', 'active')
        .gte('end_date', today)

      if (!flErr) {
        currentFeatured = fl?.length || 0
      } else {
        // Fallback to legacy flags if featured_listings is not available
        const { data: legacy, error: legacyErr } = await supabase
          .from('listings')
          .select('id')
          .eq('is_featured', true)

        if (!legacyErr) {
          currentFeatured = legacy?.length || 0
        }
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