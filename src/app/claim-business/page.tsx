'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Building2, Shield, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react'
import { GUNSMITH_SPECIALTIES } from '@/lib/gunsmith-specialties'

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
  const [edits, setEdits] = useState<any>({ tags: [], specialties: [], delivery_method: null })
  const SPECIALTIES = ['Rifle','Pistol','Sniper','Shotgun','Other']
  const DELIVERY_OPTIONS: Array<'in-person'|'shipping'|'both'> = ['in-person','shipping','both']

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/claim-business')
      return
    }
    // Preselect listing if navigated with ?listingId
    const listingId = searchParams?.get('listingId')
    if (listingId) {
      ;(async () => {
        try {
          const { data } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listingId)
            .maybeSingle()
          if (data) setSelectedBusiness(data)
        } catch (e) {
          // ignore
        }
      })()
    }
  }, [user, router, searchParams])

  // Initialize editable fields when a business is selected
  useEffect(() => {
    if (selectedBusiness) {
      setEdits({
        business_name: selectedBusiness.business_name || '',
        street_address: selectedBusiness.street_address || selectedBusiness.address || '',
        city: selectedBusiness.city || '',
        state_province: selectedBusiness.state_province || '',
        postal_code: selectedBusiness.postal_code || '',
        phone: selectedBusiness.phone || '',
        email: selectedBusiness.email || '',
        website: selectedBusiness.website || '',
        description: selectedBusiness.description || '',
        tags: Array.isArray(selectedBusiness.tags) ? selectedBusiness.tags : [],
        specialties: Array.isArray((selectedBusiness as any).specialties) ? (selectedBusiness as any).specialties : [],
        delivery_method: (selectedBusiness as any).delivery_method || null
      })
    }
  }, [selectedBusiness])

  // Validate FFL: format X-XX-XXX-XX-XX-XXXXX (15 digits with hyphens)
  const isValidFfl = (value: string): boolean => {
    const rawDigits = value.replace(/\D/g, '')
    if (rawDigits.length !== 15) return false
    // optional: enforce hyphen groups if user included separators
    const cleaned = value.trim()
    const hasHyphen = cleaned.includes('-')
    if (hasHyphen) {
      return /^\d-\d{2}-\d{3}-\d{2}-\d{2}-\d{5}$/.test(cleaned)
    }
    return true
  }

  const searchBusinesses = async () => {
    const raw = searchQuery.trim()
    if (!raw) return
    setSearchLoading(true)
    try {
      // Parse "City, ST" quick format
      const cityStateMatch = raw.match(/^([^,]+),\s*([A-Za-z]{2})$/)
      let primaryQuery
      if (cityStateMatch) {
        const city = cityStateMatch[1].trim()
        const state = cityStateMatch[2].toUpperCase()
        primaryQuery = supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .is('owner_id', null)
          .ilike('city', `%${city}%`)
          .eq('state_province', state)
          .limit(25)
      } else {
        // Tokenize and build ORs across multiple fields for best-effort matching
        const tokens = raw.split(/\s+/).filter(Boolean)
        const searchableFields = [
          'business_name',
          'city',
          'state_province',
          'street_address',
          'postal_code',
          'description',
          'website',
          'phone'
        ]
        const orParts: string[] = []
        for (const field of searchableFields) {
          for (const t of tokens) {
            orParts.push(`${field}.ilike.%${t}%`)
          }
        }
        const orClause = orParts.join(',')
        primaryQuery = supabase
          .from('listings')
          .select('*')
          .or(orClause)
          .eq('status', 'active')
          .is('owner_id', null)
          .limit(25)
      }

      let { data, error } = await primaryQuery
      if (error) throw error

      // Fallback: include claimed businesses if none unclaimed matched
      if (!data || data.length === 0) {
        let fallback
        if (cityStateMatch) {
          const city = cityStateMatch[1].trim()
          const state = cityStateMatch[2].toUpperCase()
          const { data: fb, error: fbErr } = await supabase
            .from('listings')
            .select('*')
            .eq('status', 'active')
            .ilike('city', `%${city}%`)
            .eq('state_province', state)
            .limit(25)
          if (fbErr) throw fbErr
          fallback = fb
        } else {
          const tokens = raw.split(/\s+/).filter(Boolean)
          const searchableFields = ['business_name','city','state_province','street_address','postal_code','description','website','phone']
          const orParts: string[] = []
          for (const field of searchableFields) {
            for (const t of tokens) {
              orParts.push(`${field}.ilike.%${t}%`)
            }
          }
          const { data: fb, error: fbErr } = await supabase
            .from('listings')
            .select('*')
            .or(orParts.join(','))
            .eq('status', 'active')
            .limit(25)
          if (fbErr) throw fbErr
          fallback = fb
        }
        setSearchResults(fallback || [])
      } else {
        setSearchResults(data)
      }
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
      // FFL is optional at claim time
      const ffl = claimData.ffl_license_number?.trim()
      if (ffl && !isValidFfl(ffl)) {
        throw new Error('Invalid FFL number. Expected 15 digits, optionally formatted as X-XX-XXX-XX-XX-XXXXX.')
      }

      const proposedEdits: any = edits

      // Include the user's access token so the RPC runs as the user
      const { data: session } = await supabase.auth.getSession()
      const accessToken = session?.session?.access_token

      const res = await fetch('/api/claims/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          listingId: selectedBusiness.id,
          proposedEdits,
          fflLicenseNumber: ffl || '',
          fflDocumentUrl: claimData.verification_documents || null,
          userId: user.id,
        })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to submit claim')

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

            {/* Search for Business (hidden when preselected via listingId) */}
            {!selectedBusiness && (
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

              {/* Not listed CTA */}
              <div className="mt-8 p-6 rounded-lg bg-gunsmith-accent/20 border border-gunsmith-border">
                <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">MY BUSINESS ISN'T LISTED</h3>
                <p className="text-gunsmith-text-secondary mb-4">Can't find your shop? Add it now and get verified.</p>
                <button
                  onClick={() => router.push('/add-business/new')}
                  className="btn-primary"
                >
                  Add My Business
                </button>
              </div>
            </div>
            )}

            {/* Claim Form */}
            {selectedBusiness && (
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">
                  CLAIM: {selectedBusiness.business_name}
                </h2>
                
                <form onSubmit={handleClaim} className="space-y-6">
                  {/* Editable fields prefilled with listing data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Business Name</label>
                      <input className="input w-full" value={edits.business_name || ''} onChange={(e)=>setEdits({...edits, business_name:e.target.value})}/>
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input className="input w-full" value={edits.phone || ''} onChange={(e)=>setEdits({...edits, phone:e.target.value})}/>
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input className="input w-full" value={edits.email || ''} onChange={(e)=>setEdits({...edits, email:e.target.value})}/>
                    </div>
                    <div>
                      <label className="label">Website</label>
                      <input className="input w-full" value={edits.website || ''} onChange={(e)=>setEdits({...edits, website:e.target.value})}/>
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Street Address</label>
                      <input className="input w-full" value={edits.street_address || ''} onChange={(e)=>setEdits({...edits, street_address:e.target.value})}/>
                    </div>
                    <div>
                      <label className="label">City</label>
                      <input className="input w-full" value={edits.city || ''} onChange={(e)=>setEdits({...edits, city:e.target.value})}/>
                    </div>
                    <div>
                      <label className="label">State</label>
                      <input className="input w-full" value={edits.state_province || ''} onChange={(e)=>setEdits({...edits, state_province:e.target.value})}/>
                    </div>
                    <div>
                      <label className="label">Postal Code</label>
                      <input className="input w-full" value={edits.postal_code || ''} onChange={(e)=>setEdits({...edits, postal_code:e.target.value})}/>
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Description</label>
                      <textarea className="input w-full h-28 resize-none" value={edits.description || ''} onChange={(e)=>setEdits({...edits, description:e.target.value})}/>
                    </div>
                  </div>

                  {/* Services Provided */}
                  <div className="card">
                    <h3 className="font-bebas text-xl text-gunsmith-gold mb-3">SERVICES PROVIDED</h3>
                    <div className="flex justify-end mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const all = new Set<string>(edits.tags || [])
                          GUNSMITH_SPECIALTIES.forEach(g => g.items.forEach(i => all.add(i)))
                          setEdits({ ...edits, tags: Array.from(all) })
                        }}
                        className="btn-secondary text-xs"
                      >
                        Select All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {GUNSMITH_SPECIALTIES.map(group => (
                        <div key={group.key}>
                          <p className="text-gunsmith-text mb-2">{group.label}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {group.items.map(item => (
                              <label key={item} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={(edits.tags || []).includes(item)}
                                  onChange={() => {
                                    const curr = new Set(edits.tags || [])
                                    curr.has(item) ? curr.delete(item) : curr.add(item)
                                    setEdits({ ...edits, tags: Array.from(curr) })
                                  }}
                                  className="w-4 h-4 rounded border-gunsmith-border bg-gunsmith-accent text-gunsmith-gold focus:ring-gunsmith-gold"
                                />
                                <span className="text-sm text-gunsmith-text">{item}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      {/* Other service input */}
                      <div className="mt-4">
                        <label className="label">Other Service</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a service not listed"
                            className="input flex-1"
                            onKeyDown={(e) => {
                              const val = (e.target as HTMLInputElement).value.trim()
                              if (e.key === 'Enter' && val) {
                                const curr = new Set(edits.tags || [])
                                curr.add(val)
                                setEdits({ ...edits, tags: Array.from(curr) })
                                ;(e.target as HTMLInputElement).value = ''
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={(e) => {
                              const input = (e.currentTarget.previousSibling as HTMLInputElement)
                              const val = input?.value?.trim()
                              if (!val) return
                              const curr = new Set(edits.tags || [])
                              curr.add(val)
                              setEdits({ ...edits, tags: Array.from(curr) })
                              if (input) input.value = ''
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="card">
                    <h3 className="font-bebas text-xl text-gunsmith-gold mb-3">SPECIALTIES</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {SPECIALTIES.map(sp => (
                        <label key={sp} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(edits.specialties || []).includes(sp)}
                            onChange={() => {
                              const curr = new Set(edits.specialties || [])
                              curr.has(sp) ? curr.delete(sp) : curr.add(sp)
                              setEdits({ ...edits, specialties: Array.from(curr) })
                            }}
                            className="w-4 h-4 rounded border-gunsmith-border bg-gunsmith-accent text-gunsmith-gold focus:ring-gunsmith-gold"
                          />
                          <span className="text-sm text-gunsmith-text">{sp}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Method */}
                  <div className="card">
                    <h3 className="font-bebas text-xl text-gunsmith-gold mb-3">DELIVERY METHOD</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {DELIVERY_OPTIONS.map((opt) => (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => setEdits({ ...edits, delivery_method: opt })}
                          className={`px-3 py-2 rounded text-sm ${edits.delivery_method===opt ? 'bg-gunsmith-gold text-gunsmith-black' : 'bg-gunsmith-accent text-gunsmith-text hover:bg-gunsmith-gold/80 hover:text-gunsmith-black'}`}
                        >
                          {opt === 'in-person' ? 'In Person' : opt === 'shipping' ? 'Shipped' : 'Both'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gunsmith-gold/10 border border-gunsmith-gold/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-gunsmith-gold" />
                      <span className="font-bebas text-lg text-gunsmith-gold">OPTIONAL FFL VERIFICATION</span>
                    </div>
                    <p className="text-gunsmith-text-secondary text-sm">
                      You can submit this claim now and add your FFL later from your dashboard. We’ll mark it as unverified until an admin reviews your FFL.
                    </p>
                  </div>

                  <div>
                    <label className="label">FFL License Number (optional)</label>
                    <input
                      type="text"
                      value={claimData.ffl_license_number}
                      onChange={(e) => setClaimData({ ...claimData, ffl_license_number: e.target.value })}
                      className="input w-full"
                      placeholder="e.g., 1-23-456-78-90-12345"
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
