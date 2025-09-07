'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Building2, Shield, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react'

export default function ClaimBusinessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [claimData, setClaimData] = useState({
    ffl_license_number: '',
    verification_documents: '',
    additional_info: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/claim-business')
    }
  }, [user, router])

  const searchBusinesses = async () => {
    if (!searchQuery.trim()) return
    
    setSearchLoading(true)
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .or(`business_name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,state_province.ilike.%${searchQuery}%`)
        .is('owner_id', null) // Only unclaimed businesses
        .eq('status', 'active')
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error: any) {
      setError(error.message || 'Failed to search businesses')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBusiness || !user) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Create a claim request
      const { error: claimError } = await supabase
        .from('business_claims')
        .insert({
          listing_id: selectedBusiness.id,
          claimer_id: user.id,
          claimer_email: user.email,
          ffl_license_number: claimData.ffl_license_number,
          verification_documents: claimData.verification_documents,
          additional_info: claimData.additional_info,
          status: 'pending',
          submitted_at: new Date().toISOString()
        })

      if (claimError) throw claimError

      setSuccess(true)
      setSelectedBusiness(null)
      setClaimData({
        ffl_license_number: '',
        verification_documents: '',
        additional_info: ''
      })
    } catch (error: any) {
      setError(error.message || 'Failed to submit claim')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gunsmith-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Building2 className="h-16 w-16 text-gunsmith-gold mx-auto mb-4" />
              <h1 className="font-bebas text-4xl text-gunsmith-gold mb-4">CLAIM YOUR BUSINESS</h1>
              <p className="text-gunsmith-text-secondary max-w-2xl mx-auto">
                If your gunsmith business is already listed but not claimed, you can claim ownership 
                by providing your FFL license verification.
              </p>
            </div>

            {error && (
              <div className="bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2 mb-6">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded flex items-start gap-2 mb-6">
                <CheckCircle className="h-5 w-5 mt-0.5" />
                <span className="text-sm">
                  Claim submitted successfully! We'll review your FFL verification and contact you within 2-3 business days.
                </span>
              </div>
            )}

            {/* Search for Business */}
            <div className="card mb-8">
              <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">SEARCH FOR YOUR BUSINESS</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchBusinesses()}
                  className="input flex-1"
                  placeholder="Enter business name, city, or state..."
                />
                <button
                  onClick={searchBusinesses}
                  disabled={searchLoading}
                  className="btn-primary flex items-center gap-2"
                >
                  {searchLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  Search
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-bebas text-lg text-gunsmith-gold">UNCLAIMED BUSINESSES</h3>
                  {searchResults.map((business) => (
                    <div
                      key={business.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedBusiness?.id === business.id
                          ? 'border-gunsmith-gold bg-gunsmith-gold/10'
                          : 'border-gunsmith-border hover:border-gunsmith-gold/50'
                      }`}
                      onClick={() => setSelectedBusiness(business)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bebas text-lg text-gunsmith-gold">{business.business_name}</h4>
                          <p className="text-gunsmith-text-secondary text-sm">
                            {business.street_address}, {business.city}, {business.state_province}
                          </p>
                          <p className="text-gunsmith-text-secondary text-xs">
                            Listed: {new Date(business.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedBusiness?.id === business.id
                            ? 'border-gunsmith-gold bg-gunsmith-gold'
                            : 'border-gunsmith-border'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Claim Form */}
            {selectedBusiness && (
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">
                  CLAIM: {selectedBusiness.business_name}
                </h2>
                
                <form onSubmit={handleClaim} className="space-y-6">
                  <div className="bg-gunsmith-gold/10 border border-gunsmith-gold/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-gunsmith-gold" />
                      <span className="font-bebas text-lg text-gunsmith-gold">FFL VERIFICATION REQUIRED</span>
                    </div>
                    <p className="text-gunsmith-text-secondary text-sm">
                      To claim this business, you must provide your FFL license number for verification. 
                      This ensures only legitimate gunsmith businesses can claim listings.
                    </p>
                  </div>

                  <div>
                    <label className="label">FFL License Number *</label>
                    <input
                      type="text"
                      value={claimData.ffl_license_number}
                      onChange={(e) => setClaimData({ ...claimData, ffl_license_number: e.target.value })}
                      className="input w-full"
                      placeholder="Enter your FFL license number"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Additional Information</label>
                    <textarea
                      value={claimData.additional_info}
                      onChange={(e) => setClaimData({ ...claimData, additional_info: e.target.value })}
                      className="input w-full h-24 resize-none"
                      placeholder="Any additional information to help verify your claim..."
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedBusiness(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5" />
                          Submit Claim
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Instructions */}
            <div className="card mt-8">
              <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">HOW IT WORKS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gunsmith-gold text-gunsmith-black rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                    1
                  </div>
                  <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">SEARCH</h3>
                  <p className="text-gunsmith-text-secondary text-sm">
                    Find your business in our directory of unclaimed listings
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gunsmith-gold text-gunsmith-black rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                    2
                  </div>
                  <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">VERIFY</h3>
                  <p className="text-gunsmith-text-secondary text-sm">
                    Provide your FFL license number for verification
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gunsmith-gold text-gunsmith-black rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-3">
                    3
                  </div>
                  <h3 className="font-bebas text-lg text-gunsmith-gold mb-2">APPROVED</h3>
                  <p className="text-gunsmith-text-secondary text-sm">
                    Once verified, you'll have full control of your listing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
