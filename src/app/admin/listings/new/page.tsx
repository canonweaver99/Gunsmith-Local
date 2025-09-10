'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminNewListingPage() {
  const router = useRouter()
  const [form, setForm] = useState<any>({ business_name: '', city: '', state_province: '' })
  const [submitting, setSubmitting] = useState(false)
  const [csvSubmitting, setCsvSubmitting] = useState(false)
  const [csvError, setCsvError] = useState<string | null>(null)

  async function submitManual(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create listing')
      router.push('/admin/listings')
    } catch (e: any) {
      alert(e?.message || 'Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError(null)
    setCsvSubmitting(true)
    try {
      const text = await file.text()
      const rows = parseCsv(text)
      const res = await fetch('/api/admin/listings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Import failed')
      router.push('/admin/listings')
    } catch (e: any) {
      setCsvError(e?.message || 'Import failed')
    } finally {
      setCsvSubmitting(false)
    }
  }

  function parseCsv(text: string) {
    const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean)
    const headers = headerLine.split(',').map(h => h.trim())
    return lines.map(line => {
      const cols = line.split(',')
      const obj: any = {}
      headers.forEach((h, i) => obj[h] = (cols[i] || '').trim())
      return obj
    })
  }

  return (
    <div className="min-h-screen bg-gunsmith-black py-10 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="card">
          <h1 className="font-bebas text-3xl text-gunsmith-gold mb-6">ADD LISTING (ADMIN)</h1>

          <form onSubmit={submitManual} className="space-y-4 mb-8">
            <div>
              <label className="label">Business Name</label>
              <input className="input w-full" value={form.business_name} onChange={(e)=>setForm({ ...form, business_name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">City</label>
                <input className="input w-full" value={form.city} onChange={(e)=>setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="label">State</label>
                <input className="input w-full" value={form.state_province} onChange={(e)=>setForm({ ...form, state_province: e.target.value })} />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </form>

          <div className="border-t border-gunsmith-border pt-6">
            <h2 className="font-bebas text-2xl text-gunsmith-gold mb-2">CSV IMPORT</h2>
            <p className="text-gunsmith-text-secondary text-sm mb-4">Upload a CSV with columns like: business_name, address, city, state_province, postal_code, phone, email, website, description, category, status</p>
            <input type="file" accept=".csv" onChange={handleCsv} disabled={csvSubmitting} />
            {csvError && <p className="text-gunsmith-error text-sm mt-2">{csvError}</p>}
          </div>

          <div className="mt-6">
            <Link href="/admin/listings" className="btn-secondary">Back to Manage Listings</Link>
          </div>
        </div>
      </div>
    </div>
  )
}


