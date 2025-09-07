import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      
      try {
        // Extract metadata
        const { listingId, duration, userId } = session.metadata!
        
        // Calculate featured end date
        const durationDays = parseInt(duration)
        const featuredUntil = new Date()
        featuredUntil.setDate(featuredUntil.getDate() + durationDays)

        // Create service role client (bypasses RLS)
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        // Update the listing to be featured
        const { error: updateError } = await supabase
          .from('listings')
          .update({
            is_featured: true,
            featured_until: featuredUntil.toISOString(),
            featured_payment_id: session.payment_intent as string,
            updated_at: new Date().toISOString()
          })
          .eq('id', listingId)
          .eq('owner_id', userId)

        if (updateError) {
          console.error('Error updating listing:', updateError)
          return NextResponse.json(
            { error: 'Failed to update listing' },
            { status: 500 }
          )
        }

        // Log the featured listing transaction
        const { error: logError } = await supabase
          .from('featured_transactions')
          .insert({
            listing_id: listingId,
            user_id: userId,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            amount_paid: session.amount_total,
            duration_days: durationDays,
            featured_until: featuredUntil.toISOString(),
            status: 'completed'
          })

        if (logError) {
          console.error('Error logging transaction:', logError)
          // Don't fail the webhook for logging errors
        }

        console.log(`Successfully featured listing ${listingId} for ${duration} days`)
        
      } catch (error) {
        console.error('Error processing checkout completion:', error)
        return NextResponse.json(
          { error: 'Failed to process payment' },
          { status: 500 }
        )
      }
      break

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('Payment failed:', paymentIntent.id)
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
