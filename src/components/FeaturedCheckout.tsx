'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Star, Loader2, CreditCard } from 'lucide-react'

// Lazy-init Stripe to avoid crashing when the key is missing in local/dev
let stripePromise: ReturnType<typeof loadStripe> | null = null
function getStripe() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) return null
  if (!stripePromise) {
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

interface FeaturedCheckoutProps {
  listingId: string
  businessName: string
  onClose?: () => void
}

export default function FeaturedCheckout({ listingId, businessName, onClose }: FeaturedCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<string>('30')
  const [availableSlots, setAvailableSlots] = useState<number>(3)
  const [loadingSlots, setLoadingSlots] = useState(true)

  const pricingOptions = [
    {
      duration: '30',
      name: 'Monthly Featured',
      price: '$50.00',
      description: 'Premium placement for 30 days',
      popular: true
    }
  ]

  // Check available featured slots
  useEffect(() => {
    const checkAvailableSlots = async () => {
      try {
        const response = await fetch('/api/featured/availability')
        const data = await response.json()
        setAvailableSlots(data.available || 0)
      } catch (error) {
        console.error('Error checking availability:', error)
        setAvailableSlots(0)
      } finally {
        setLoadingSlots(false)
      }
    }
    
    checkAvailableSlots()
  }, [])

  const handleCheckout = async () => {
    if (!selectedDuration) return

    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          duration: selectedDuration,
          successUrl: `${window.location.origin}/dashboard?featured=success`,
          cancelUrl: `${window.location.origin}/dashboard?featured=cancelled`
        }),
      })

      const { sessionId, url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        const stripeLoader = getStripe()
        if (!stripeLoader) {
          alert('Payments are disabled in this environment (missing Stripe key).')
          return
        }
        const stripe = await stripeLoader
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId })
          if (error) {
            throw new Error(error.message)
          }
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout process. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-gunsmith-card border border-gunsmith-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-gunsmith-gold" />
              <div>
                <h2 className="font-bebas text-2xl text-gunsmith-gold">FEATURE YOUR LISTING</h2>
                <p className="text-gunsmith-text-secondary">{businessName}</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <h3 className="font-bebas text-xl text-gunsmith-gold mb-4">FEATURED BENEFITS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-gunsmith-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gunsmith-text font-medium">Priority Placement</p>
                  <p className="text-sm text-gunsmith-text-secondary">Appear at the top of search results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-gunsmith-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gunsmith-text font-medium">Featured Badge</p>
                  <p className="text-sm text-gunsmith-text-secondary">Stand out with a special badge</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-gunsmith-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gunsmith-text font-medium">Increased Visibility</p>
                  <p className="text-sm text-gunsmith-text-secondary">Get more views and inquiries</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-gunsmith-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gunsmith-text font-medium">Featured Page</p>
                  <p className="text-sm text-gunsmith-text-secondary">Appear on the featured listings page</p>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Notice */}
          <div className="mb-6 p-4 bg-gunsmith-gold/10 border border-gunsmith-gold/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bebas text-lg text-gunsmith-gold">LIMITED AVAILABILITY</h3>
                <p className="text-gunsmith-text-secondary text-sm">
                  Only 3 featured slots available at any time
                </p>
              </div>
              <div className="text-right">
                {loadingSlots ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gunsmith-gold" />
                ) : (
                  <>
                    <p className="font-bebas text-2xl text-gunsmith-gold">{availableSlots}</p>
                    <p className="text-xs text-gunsmith-text-secondary">slots left</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="mb-8">
            <h3 className="font-bebas text-xl text-gunsmith-gold mb-4">FEATURED LISTING</h3>
            <div className="max-w-md mx-auto">
              {pricingOptions.map((option) => (
                <div
                  key={option.duration}
                  className={`relative border rounded-lg p-6 ${
                    availableSlots > 0 
                      ? 'border-gunsmith-gold bg-gunsmith-gold/10' 
                      : 'border-gunsmith-border bg-gunsmith-border/10 opacity-50'
                  }`}
                >
                  {option.popular && availableSlots > 0 && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gunsmith-gold text-gunsmith-black text-xs font-bold px-2 py-1 rounded">
                        AVAILABLE
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h4 className="font-bebas text-xl text-gunsmith-gold mb-2">{option.name}</h4>
                    <p className="text-3xl font-bold text-gunsmith-text mb-3">{option.price}<span className="text-lg">/month</span></p>
                    <p className="text-sm text-gunsmith-text-secondary mb-4">{option.description}</p>
                    {availableSlots === 0 && (
                      <p className="text-sm text-red-400 font-medium">All slots currently taken</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Button */}
          <div className="flex justify-end gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleCheckout}
              disabled={loading || availableSlots === 0 || loadingSlots}
              className={`flex items-center gap-2 ${
                availableSlots === 0 || loadingSlots
                  ? 'btn-secondary opacity-50 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : availableSlots === 0 ? (
                <>
                  <CreditCard className="h-5 w-5" />
                  No Slots Available
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Get Featured - $50/month
                </>
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gunsmith-text-secondary">
              Secure payment powered by Stripe. Your card information is never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
