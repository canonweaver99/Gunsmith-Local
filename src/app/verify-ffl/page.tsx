'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Shield, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function VerifyFFLPage() {
  const router = useRouter()
  const params = useSearchParams()
  const { user } = useAuth()
  const listingId = params.get('listingId') || null

  const [ffl, setFfl] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const normalize = (v: string) => v.replace(/[^A-Za-z0-9]/g, '')
  const isValidFfl = (value: string) => {
    const raw = normalize(value)
    if (raw.length !== 15) return false
    const digits = (raw.match(/\d/g) || []).length
    const letters = (raw.match(/[A-Za-z]/g) || []).length
    return digits === 14 && letters === 1
  }

  async function submitClaim(e: React.FormEvent) {
    e.preventDefault()
    if (!user) {
      router.push('/auth/login?redirect=/verify-ffl')
      return
    }
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      if (!isValidFfl(ffl)) throw new Error('Invalid FFL: must be 15 chars with 14 digits and 1 letter')

      const { error } = await supabase.from('business_claims').insert({
        listing_id: listingId,
        claimer_id: user.id,
        claimer_email: user.email,
        ffl_license_number: normalize(ffl),
        additional_info: notes,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      if (error) throw error
      setSuccess(true)
      setFfl('')
      setNotes('')
    } catch (e: any) {
      setError(e?.message || 'Failed to submit claim')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gunsmith-black">
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-gunsmith-gold" />
              <h1 className="font-bebas text-3xl text-gunsmith-gold">VERIFY YOUR FFL</h1>
            </div>
            <p className="text-gunsmith-text-secondary mb-6">
              Enter your FFL license number to request ownership verification. We will review and notify you when approved.
            </p>

            {error && (
              <div className="bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-3 rounded flex items-start gap-2 mb-4">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success ? (
              <div className="bg-green-500/20 border border-green-500 text-green-500 p-3 rounded flex items-start gap-2">
                <CheckCircle className="h-5 w-5 mt-0.5" />
                <span className="text-sm">Submitted! We will email you after review.</span>
              </div>
            ) : (
              <form onSubmit={submitClaim} className="space-y-4">
                <div>
                  <label className="label">FFL License Number *</label>
                  <input
                    value={ffl}
                    onChange={(e) => setFfl(e.target.value)}
                    placeholder="1-23-456-78-9A-12345"
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input w-full h-24 resize-none"
                    placeholder="Anything that helps verify your ownership"
                  />
                </div>
                <div className="flex justify-end">
                  <button disabled={loading} className="btn-primary flex items-center gap-2">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                    Submit for Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


