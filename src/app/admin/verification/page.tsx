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
}

export default function AdminVerificationPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected'>('pending')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<PendingListing[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    fetchRows()
  }, [activeTab, page])

  async function fetchRows() {
    setLoading(true)
    try {
      let query = supabase
        .from('listings')
        .select('id,business_name,city,state_province,ffl_license_number,verification_status,email')
        .order('created_at', { ascending: false })

      if (activeTab === 'pending') {
        query = query.eq('verification_status', 'pending')
      } else if (activeTab === 'verified') {
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
      console.error('Load pending verifications error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function setStatus(id: string, status: 'verified' | 'rejected') {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          is_verified: status === 'verified', 
          verification_status: status, 
          verified_at: status === 'verified' ? new Date().toISOString() : null,
          verified_by: user?.id || null,
        })
        .eq('id', id)

      if (error) throw error
      await fetchRows()
      if (detail?.id === id) {
        setDetail((d: any) => d ? { ...d, verification_status: status, is_verified: status === 'verified', verified_at: status === 'verified' ? new Date().toISOString() : null, verified_by: user?.id || null } : d)
      }
    } catch (e) {
      console.error('Update verification status error:', e)
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
          <h2 className="font-bebas text-2xl text-gunsmith-gold">FFL VERIFICATION QUEUE</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            {(['pending','verified','rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-sm capitalize border ${activeTab===tab ? 'bg-gunsmith-gold text-gunsmith-black border-gunsmith-gold' : 'bg-gunsmith-card text-gunsmith-text border-gunsmith-border hover:border-gunsmith-gold/60'}`}
              >
                {tab}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gunsmith-text-secondary">No pending submissions</div>
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
                <p className="text-xs text-gunsmith-text-secondary">Status: {r.verification_status}</p>
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
                  <p className="text-gunsmith-text-secondary text-sm">Status: {detail.verification_status || 'pending'}</p>
                  {detail.verified_at && (
                    <p className="text-gunsmith-text-secondary text-sm">Verified at: {new Date(detail.verified_at).toLocaleString()}</p>
                  )}
                  {detail.verified_by && (
                    <p className="text-gunsmith-text-secondary text-sm">Verified by (user id): {detail.verified_by}</p>
                  )}
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
