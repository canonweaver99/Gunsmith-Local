import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, reviewerName, rating, reviewTitle, reviewComment } = body

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('business_name, email, owner_id, slug')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Get business owner's email
    let businessEmail = listing.email
    if (listing.owner_id) {
      const { data: owner } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', listing.owner_id)
        .single()
      
      if (owner?.email) {
        businessEmail = owner.email
      }
    }

    if (!businessEmail) {
      return NextResponse.json({ error: 'Business email not found' }, { status: 400 })
    }

    // Send email notification
    const emailData = {
      businessName: listing.business_name,
      reviewerName,
      rating,
      reviewTitle,
      reviewComment,
      listingUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/listings/${listing.slug}`
    }

    await emailService.sendReviewNotification(emailData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending review email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
