'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Shield, CheckCircle, XCircle, Search, Loader2, X, ExternalLink } from 'lucide-react'

interface PendingListing {
  id: string
  business_name: string
  city: string | null
  state_province: string | null
  ffl_license_number: string | null
  verification_status: string | null
  email: string | null
  status: string | null
  pending_reason?: string
}

export default function AdminVerificationPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'claims' | 'ffl' | 'verified' | 'rejected'>('pending')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<PendingListing[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingItems()
    } else if (activeTab === 'claims') {
      fetchClaims('pending')
    } else if (activeTab === 'ffl') {
      fetchFFLListings()
    } else if (activeTab === 'verified') {
      fetchRows()
      fetchClaims('approved')
    } else if (activeTab === 'rejected') {
      fetchRows()
      fetchClaims('rejected')
    }
  }, [activeTab, page])

  async function fetchPendingItems() {
    setLoading(true)
    try {
      // Get all listings that need attention
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id,business_name,city,state_province,ffl_license_number,verification_status,email,status')
        .or('verification_status.eq.pending,status.eq.inactive,verification_status.is.null')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (listingsError) throw listingsError

      // Add pending reasons
      const pendingListings = (listings || []).map(listing => ({
        ...listing,
        pending_reason: 
          listing.verification_status === 'pending' ? 'Verification Pending' :
          listing.status === 'inactive' ? 'Inactive Status' :
          !listing.verification_status || listing.verification_status === 'null' ? 'No Verification Status' :
          'Needs Review'
      }))

      console.log('Pending listings query result:', listings?.length, 'listings found')
      console.log('Sample pending reasons:', pendingListings.slice(0, 3).map(l => ({ name: l.business_name, reason: l.pending_reason, status: l.status, verification: l.verification_status })))

      // Get pending claims
      const { data: pendingClaims, error: claimsError } = await supabase
        .from('business_claims')
        .select(`
          id, listing_id, claimer_email, ffl_license_number, claim_status, verification_status, submitted_at,
          listings:listing_id (business_name, city, state_province)
        `)
        .eq('claim_status', 'pending')
        .order('submitted_at', { ascending: false })

      if (claimsError) throw claimsError

      setClaims(pendingClaims || [])
      setRows(pendingListings)
    } catch (e) {
      console.error('Load pending items error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRows() {
    setLoading(true)
    try {
      let query = supabase
        .from('listings')
        .select('id,business_name,city,state_province,ffl_license_number,verification_status,email,status')
        .order('created_at', { ascending: false })

      if (activeTab === 'verified') {
        query = query.eq('verification_status', 'verified')
      } else {
        query = query.eq('verification_status', 'rejected')
      }

      const from = page * pageSize
      const to = from + pageSize - 1
      const { data, error } = await query.range(from, to)
      if (error) throw error
      setRows(data || [])
    } catch (e) {
      console.error('Load verifications error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchFFLListings() {
    setLoading(true)
    try {
      // Get listings with FFL numbers that need verification
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id,business_name,city,state_province,ffl_license_number,verification_status,email,status')
        .not('ffl_license_number', 'is', null)
        .neq('ffl_license_number', '')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (listingsError) throw listingsError
      setRows(listings || [])

      // Get FFL claims (claims with FFL numbers)
      const { data: fflClaims, error: claimsError } = await supabase
        .from('business_claims')
        .select(`
          id, listing_id, claimer_email, ffl_license_number, claim_status, verification_status, submitted_at,
          listings:listing_id (business_name, city, state_province)
        `)
        .eq('claim_status', 'pending')
        .not('ffl_license_number', 'is', null)
        .neq('ffl_license_number', '')
        .order('submitted_at', { ascending: false })

      if (claimsError) throw claimsError
      setClaims(fflClaims || [])
    } catch (e) {
      console.error('Load FFL items error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchClaims(status: 'pending' | 'approved' | 'rejected') {
    setLoading(true)
    try {
      // Pull claims joined with listing basics
      const { data, error } = await supabase
        .from('business_claims')
        .select(`
          id, listing_id, claimer_email, ffl_license_number, claim_status, verification_status, submitted_at,
          listings:listing_id (business_name, city, state_province)
        `)
        .eq('claim_status', status)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setClaims(data || [])
    } catch (e) {
      console.error('Load claims error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function setStatus(id: string, status: 'verified' | 'rejected') {
    setUpdatingId(id)
    try {
      console.log('Updating listing status:', { id, status })
      const { error } = await supabase
        .from('listings')
        .update({ 
          is_verified: status === 'verified', 
          verification_status: status, 
          status: 'active' // Also set to active when verifying
        })
        .eq('id', id)

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }
      
      console.log('Status updated successfully, refreshing data...')
      if (activeTab === 'pending') {
        await fetchPendingItems()
      } else if (activeTab === 'ffl') {
        await fetchFFLListings()
      } else {
        await fetchRows()
      }
      
      if (detail?.id === id) {
        setDetail((d: any) => d ? { ...d, verification_status: status, is_verified: status === 'verified', status: 'active' } : d)
      }
    } catch (e) {
      console.error('Update verification status error:', e)
      alert(`Failed to update status: ${e.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  async function openDetails(id: string) {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,business_name,ffl_license_number,verification_status,email,phone,website,
          street_address,city,state_province,postal_code,submitted_documents,description,
          logo_url,cover_image_url,image_gallery,created_at
        `)
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      setDetail(data)
    } catch (e) {
      console.error('Load details error:', e)
    } finally {
      setDetailLoading(false)
    }
  }

  const filtered = rows.filter(r =>
    !search || r.business_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.state_province || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.ffl_license_number || '').toLowerCase().includes(search.toLowerCase())
  )

  function exportCSV() {
    const headers = ['id','business_name','city','state_province','ffl_license_number','verification_status','email']
    const lines = [headers.join(',')]
    filtered.forEach(r => {
      const row = [r.id, r.business_name, r.city || '', r.state_province || '', r.ffl_license_number || '', r.verification_status || '', r.email || '']
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
      lines.push(row.join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `verification-${activeTab}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gunsmith-gold" />
          <h2 className="font-bebas text-2xl text-gunsmith-gold">VERIFICATION QUEUE</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            {(['pending','claims','ffl','verified','rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-sm capitalize border ${activeTab===tab ? 'bg-gunsmith-gold text-gunsmith-black border-gunsmith-gold' : 'bg-gunsmith-card text-gunsmith-text border-gunsmith-border hover:border-gunsmith-gold/60'}`}
              >
                {tab === 'ffl' ? 'FFL' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="btn-secondary text-sm mr-2">Export CSV</button>
          <div className="relative">
            <Search className="h-4 w-4 text-gunsmith-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="input pl-8"
              placeholder="Search business, city, state, FFL"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 text-gunsmith-gold animate-spin" />
        </div>
      ) : activeTab === 'pending' ? (
        <div className="space-y-4">
          {/* Pending Listings */}
          {rows.length > 0 && (
            <div>
              <h4 className="font-bebas text-xl text-gunsmith-gold mb-3">LISTINGS NEEDING ATTENTION ({rows.length})</h4>
              <div className="space-y-3">
                {rows
                  .filter(r => !search || r.business_name.toLowerCase().includes(search.toLowerCase()) || (r.city || '').toLowerCase().includes(search.toLowerCase()))
                  .map((r) => (
                  <div key={r.id} className="flex items-center justify-between border border-gunsmith-border rounded p-4">
                    <div className="cursor-pointer" onClick={() => openDetails(r.id)}>
                      <p className="font-oswald text-gunsmith-text">
                        <span className="text-gunsmith-gold">{r.business_name}</span>
                        {r.city ? ` • ${r.city}, ${r.state_province}` : ''}
                      </p>
                      <p className="text-sm text-gunsmith-text-secondary">FFL: {r.ffl_license_number || '—'}</p>
                      <p className="text-xs text-yellow-400 font-medium">⚠️ {r.pending_reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.status === 'inactive' && (
                        <button
                          onClick={async () => {
                            setUpdatingId(r.id)
                            try {
                              const { error } = await supabase
                                .from('listings')
                                .update({ status: 'active' })
                                .eq('id', r.id)
                              if (error) throw error
                              await fetchPendingItems()
                            } catch (e) {
                              console.error('Activate error:', e)
                            } finally { setUpdatingId(null) }
                          }}
                          className="btn-secondary text-sm"
                          disabled={updatingId === r.id}
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => setStatus(r.id, 'rejected')}
                        className="btn-ghost flex items-center gap-1"
                        disabled={updatingId === r.id}
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                      <button
                        onClick={() => setStatus(r.id, 'verified')}
                        className="btn-primary flex items-center gap-1"
                        disabled={updatingId === r.id}
                      >
                        {updatingId === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Claims */}
          {claims.length > 0 && (
            <div>
              <h4 className="font-bebas text-xl text-gunsmith-gold mb-3">PENDING CLAIMS ({claims.length})</h4>
              <div className="space-y-3">
                {claims
                  .filter(c => !search || c.listings?.business_name?.toLowerCase().includes(search.toLowerCase()) || (c.ffl_license_number || '').toLowerCase().includes(search.toLowerCase()))
                  .map((c) => (
                  <div key={c.id} className="flex items-center justify-between border border-gunsmith-border rounded p-4">
                    <div>
                      <p className="font-oswald text-gunsmith-text"><span className="text-gunsmith-gold">{c.listings?.business_name || 'Unknown'}</span> {c.listings?.city ? `• ${c.listings.city}, ${c.listings.state_province}` : ''}</p>
                      <p className="text-sm text-gunsmith-text-secondary">FFL: {c.ffl_license_number || '—'} • Claimer: {c.claimer_email || '—'}</p>
                      <p className="text-xs text-yellow-400 font-medium">⚠️ Business Claim Pending</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          setUpdatingId(c.id)
                          try {
                            const token = (await supabase.auth.getSession()).data.session?.access_token
                            const res = await fetch('/api/claims/admin-review', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ claimId: c.id, approve: false }) })
                            const json = await res.json().catch(() => ({}))
                            if (!res.ok) throw new Error(json.error || 'Reject failed')
                            await fetchPendingItems()
                          } catch (e:any) {
                            alert(e.message)
                          } finally { setUpdatingId(null) }
                        }}
                        className="btn-ghost text-sm"
                        disabled={updatingId === c.id}
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                      <button
                        onClick={async () => {
                          setUpdatingId(c.id)
                          try {
                            const token = (await supabase.auth.getSession()).data.session?.access_token
                            const res = await fetch('/api/claims/admin-review', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ claimId: c.id, approve: true }) })
                            const json = await res.json().catch(() => ({}))
                            if (!res.ok) throw new Error(json.error || 'Approve failed')
                            await fetchPendingItems()
                          } catch (e:any) {
                            alert(e.message)
                          } finally { setUpdatingId(null) }
                        }}
                        className="btn-primary text-sm"
                        disabled={updatingId === c.id}
                      >
                        {updatingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(rows.length === 0 && claims.length === 0) && (
            <div className="text-center py-12 text-gunsmith-text-secondary">
              🎉 No pending items - everything is up to date!
            </div>
          )}
        </div>
      ) : activeTab === 'claims' ? (
        claims.length === 0 ? (
          <div className="text-center py-12 text-gunsmith-text-secondary">No pending claims</div>
        ) : (
          <div className="space-y-3">
            {claims
              .filter(c => !search || c.listings?.business_name?.toLowerCase().includes(search.toLowerCase()) || (c.ffl_license_number || '').toLowerCase().includes(search.toLowerCase()))
              .map((c) => (
              <div key={c.id} className="flex items-center justify-between border border-gunsmith-border rounded p-4">
                <div>
                  <p className="font-oswald text-gunsmith-text"><span className="text-gunsmith-gold">{c.listings?.business_name || 'Unknown'}</span> {c.listings?.city ? `• ${c.listings.city}, ${c.listings.state_province}` : ''}</p>
                  <p className="text-sm text-gunsmith-text-secondary">FFL: {c.ffl_license_number || '—'} • Claimer: {c.claimer_email || '—'}</p>
                  <p className="text-xs text-gunsmith-text-secondary">Submitted: {new Date(c.submitted_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setUpdatingId(c.id)
                      try {
                        const token = (await supabase.auth.getSession()).data.session?.access_token
                        const res = await fetch('/api/claims/admin-review', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ claimId: c.id, approve: false }) })
                        const json = await res.json().catch(() => ({}))
                        if (!res.ok) throw new Error(json.error || 'Reject failed')
                        await fetchClaims()
                      } catch (e:any) {
                        alert(e.message)
                      } finally { setUpdatingId(null) }
                    }}
                    className="btn-ghost text-sm"
                    disabled={updatingId === c.id}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={async () => {
                      setUpdatingId(c.id)
                      try {
                        const token = (await supabase.auth.getSession()).data.session?.access_token
                        const res = await fetch('/api/claims/admin-review', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ claimId: c.id, approve: true }) })
                        const json = await res.json().catch(() => ({}))
                        if (!res.ok) throw new Error(json.error || 'Approve failed')
                        await fetchClaims();
                      } catch (e:any) {
                        alert(e.message)
                      } finally { setUpdatingId(null) }
                    }}
                    className="btn-primary text-sm"
                    disabled={updatingId === c.id}
                  >
                    {updatingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : filtered.length === 0 && (activeTab === 'verified' || activeTab === 'rejected') && claims.length === 0 ? (
        <div className="text-center py-12 text-gunsmith-text-secondary">No submissions</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center justify-between border border-gunsmith-border rounded p-4">
              <div className="cursor-pointer" onClick={() => openDetails(r.id)}>
                <p className="font-oswald text-gunsmith-text">
                  <span className="text-gunsmith-gold">{r.business_name}</span>
                  {r.city ? ` • ${r.city}, ${r.state_province}` : ''}
                </p>
                      <p className="text-sm text-gunsmith-text-secondary">FFL: {r.ffl_license_number || '—'}</p>
                      <p className="text-xs text-gunsmith-text-secondary">Status: {r.verification_status || 'unverified'} • Listing: {r.status || 'unknown'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatus(r.id, 'rejected')}
                  className="btn-ghost flex items-center gap-1"
                  disabled={updatingId === r.id}
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => setStatus(r.id, 'verified')}
                  className="btn-primary flex items-center gap-1"
                  disabled={updatingId === r.id}
                >
                  {updatingId === r.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Verify
                </button>
              </div>
            </div>
          ))}
          {/* Claims list for verified/rejected */}
          {(activeTab === 'verified' || activeTab === 'rejected') && claims.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bebas text-xl text-gunsmith-gold mb-2">{activeTab === 'verified' ? 'Verified Claims' : 'Rejected Claims'}</h4>
              <div className="space-y-3">
                {claims
                  .filter(c => !search || c.listings?.business_name?.toLowerCase().includes(search.toLowerCase()) || (c.ffl_license_number || '').toLowerCase().includes(search.toLowerCase()))
                  .map((c) => (
                  <div key={c.id} className="flex items-center justify-between border border-gunsmith-border rounded p-4">
                    <div>
                      <p className="font-oswald text-gunsmith-text"><span className="text-gunsmith-gold">{c.listings?.business_name || 'Unknown'}</span> {c.listings?.city ? `• ${c.listings.city}, ${c.listings.state_province}` : ''}</p>
                      <p className="text-sm text-gunsmith-text-secondary">FFL: {c.ffl_license_number || '—'} • Claimer: {c.claimer_email || '—'}</p>
                      <p className="text-xs text-gunsmith-text-secondary">Submitted: {new Date(c.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <button className="btn-secondary text-sm" onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0}>Previous</button>
            <span className="text-gunsmith-text-secondary text-sm">Page {page+1}</span>
            <button className="btn-secondary text-sm" onClick={() => setPage(p => p+1)} disabled={rows.length < pageSize}>Next</button>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setDetailOpen(false)} />
          <div className="w-full max-w-md bg-gunsmith-card border-l border-gunsmith-border p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bebas text-2xl text-gunsmith-gold">Submission Details</h3>
              <button className="btn-ghost" onClick={() => setDetailOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-gunsmith-gold animate-spin" />
              </div>
            ) : detail ? (
              <div className="space-y-4">
                <div>
                  <p className="text-gunsmith-text"><span className="text-gunsmith-gold">{detail.business_name}</span></p>
                  <p className="text-gunsmith-text-secondary text-sm">FFL: {detail.ffl_license_number || '—'}</p>
                  <p className="text-gunsmith-text-secondary text-sm">{detail.street_address || ''}{detail.city ? `, ${detail.city}` : ''}{detail.state_province ? `, ${detail.state_province}` : ''} {detail.postal_code || ''}</p>
                  <p className="text-gunsmith-text-secondary text-sm">Email: {detail.email || '—'}</p>
                  <p className="text-gunsmith-text-secondary text-sm">Phone: {detail.phone || '—'}</p>
                  {detail.website && (
                    <a href={detail.website} target="_blank" rel="noopener noreferrer" className="text-gunsmith-gold text-sm inline-flex items-center gap-1">
                      Website <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStatus(detail.id, 'rejected')}
                    className="btn-ghost flex items-center gap-1"
                    disabled={updatingId === detail.id}
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => setStatus(detail.id, 'verified')}
                    className="btn-primary flex items-center gap-1"
                    disabled={updatingId === detail.id}
                  >
                    {updatingId === detail.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Verify
                  </button>
                </div>
                {detail.description && (
                  <div>
                    <p className="font-oswald text-gunsmith-gold mb-1">Description</p>
                    <p className="text-gunsmith-text text-sm whitespace-pre-wrap">{detail.description}</p>
                  </div>
                )}
                {detail.submitted_documents && Object.keys(detail.submitted_documents).length > 0 && (
                  <div>
                    <p className="font-oswald text-gunsmith-gold mb-1">Submitted Documents</p>
                    <ul className="list-disc pl-5 text-sm">
                      {Object.entries(detail.submitted_documents).map(([k, v]: any) => (
                        <li key={k} className="text-gunsmith-text">
                          <a href={String(v)} target="_blank" rel="noopener noreferrer" className="text-gunsmith-gold inline-flex items-center gap-1">
                            {k} <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <p className="font-oswald text-gunsmith-gold mb-1">Audit</p>
                  <p className="text-gunsmith-text-secondary text-sm">Verification: {detail.verification_status || 'pending'}</p>
                  <p className="text-gunsmith-text-secondary text-sm">Listing Status: {detail.status || 'unknown'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gunsmith-text-secondary">No details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
