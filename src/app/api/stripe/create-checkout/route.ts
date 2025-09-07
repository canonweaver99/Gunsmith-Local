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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
    )
    
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

    // Define pricing based on duration
    const pricing = {
      '30': { amount: 5000, name: 'Monthly Featured' }, // $50.00
    }

    const selectedPricing = pricing[duration as keyof typeof pricing]
    if (!selectedPricing) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be 30 days' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${selectedPricing.name} - ${listing.business_name}`,
              description: `Feature your gunsmith business listing for ${duration} days`,
            },
            unit_amount: selectedPricing.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?featured=success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?featured=cancelled`,
      metadata: {
        listingId: listingId,
        duration: duration,
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
