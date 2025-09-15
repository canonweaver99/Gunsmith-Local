import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20'
})

export async function POST(request: NextRequest) {
  try {
    const { listingId, duration, successUrl, cancelUrl } = await request.json()

    if (!listingId || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: listingId, duration' },
        { status: 400 }
      )
    }

    // Get listing info (temporarily skip auth for testing)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      )
    }
    const supabase = createClient(supabaseUrl, supabaseAnon)
    
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, business_name')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Use a recurring Price for subscription
    const priceId = process.env.STRIPE_FEATURED_PRICE_ID
    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing STRIPE_FEATURED_PRICE_ID environment variable' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session (subscription)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?featured=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?featured=cancelled`,
      metadata: {
        listingId: listingId,
        duration: duration || '30',
        userId: 'temp-user-id',
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
