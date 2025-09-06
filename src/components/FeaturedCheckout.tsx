'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Star, Loader2, CreditCard } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface FeaturedCheckoutProps {
  listingId: string
  businessName: string
  onClose?: () => void
}

export default function FeaturedCheckout({ listingId, businessName, onClose }: FeaturedCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<string>('30')

  const pricingOptions = [
    {
      duration: '7',
      name: '7 Days',
      price: '$29.99',
      description: 'Perfect for short-term promotion'
    },
    {
      duration: '30',
      name: '30 Days',
      price: '$99.99',
      description: 'Most popular option',
      popular: true
    },
    {
      duration: '90',
      name: '90 Days',
      price: '$249.99',
      description: 'Best value for long-term visibility'
    }
  ]

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
        const stripe = await stripePromise
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

          {/* Pricing Options */}
          <div className="mb-8">
            <h3 className="font-bebas text-xl text-gunsmith-gold mb-4">CHOOSE YOUR PLAN</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricingOptions.map((option) => (
                <div
                  key={option.duration}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDuration === option.duration
                      ? 'border-gunsmith-gold bg-gunsmith-gold/10'
                      : 'border-gunsmith-border hover:border-gunsmith-gold/50'
                  }`}
                  onClick={() => setSelectedDuration(option.duration)}
                >
                  {option.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gunsmith-gold text-gunsmith-black text-xs font-bold px-2 py-1 rounded">
                        POPULAR
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h4 className="font-bebas text-lg text-gunsmith-gold mb-1">{option.name}</h4>
                    <p className="text-2xl font-bold text-gunsmith-text mb-2">{option.price}</p>
                    <p className="text-sm text-gunsmith-text-secondary">{option.description}</p>
                  </div>
                  <div className="mt-3 flex justify-center">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedDuration === option.duration
                        ? 'border-gunsmith-gold bg-gunsmith-gold'
                        : 'border-gunsmith-border'
                    }`} />
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
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Proceed to Checkout
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
