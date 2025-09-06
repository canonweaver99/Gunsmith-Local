import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id
    
    // Get the IP address for basic duplicate prevention
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Get or create a session ID from cookie
    const sessionId = request.cookies.get('session_id')?.value || 
                     crypto.randomUUID()
    
    // Check if this IP/session has already viewed this listing recently (within 24 hours)
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    
    const { data: recentView } = await supabase
      .from('listing_views')
      .select('id')
      .eq('listing_id', listingId)
      .eq('session_id', sessionId)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .single()
    
    // If no recent view, record the view
    if (!recentView) {
      // Record the view in the views table
      await supabase
        .from('listing_views')
        .insert({
          listing_id: listingId,
          session_id: sessionId,
          ip_address: ip,
          user_agent: request.headers.get('user-agent') || 'unknown'
        })
      
      // Increment the view count on the listing
      const { data: listing } = await supabase
        .from('listings')
        .select('view_count')
        .eq('id', listingId)
        .single()
      
      if (listing) {
        await supabase
          .from('listings')
          .update({ view_count: (listing.view_count || 0) + 1 })
          .eq('id', listingId)
      }
    }
    
    // Set session cookie if new
    const response = NextResponse.json({ success: true })
    if (!request.cookies.get('session_id')) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365 // 1 year
      })
    }
    
    return response
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}
