'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertTriangle } from 'lucide-react'

export default function DeleteListingConfirmPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, loading } = useAuth()
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState<string>('')

  useEffect(() => {
    async function load() {
      if (!params?.id) return
      const { data } = await supabase.from('listings').select('business_name, owner_id').eq('id', params.id as string).maybeSingle()
      if (data?.owner_id && user && data.owner_id !== user.id) {
        router.push('/dashboard')
        return
      }
      setName(data?.business_name || '')
    }
    if (user) load()
  }, [user, params, router])

  async function confirmDelete() {
    if (!params?.id || !user) return
    setBusy(true)
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', params.id as string)
        .eq('owner_id', user.id)
      if (error) throw error
      router.push('/dashboard?deleted=1')
    } catch (e) {
      alert((e as any)?.message || 'Failed to delete listing')
    } finally {
      setBusy(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-xl">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-gunsmith-error" />
                <h1 className="font-bebas text-3xl text-gunsmith-gold">Confirm Deletion</h1>
              </div>
              <p className="text-gunsmith-text mb-6">You're about to permanently delete <span className="text-gunsmith-gold">{name || 'this listing'}</span>. This action cannot be undone.</p>
              <div className="flex items-center gap-3">
                <button className="btn-ghost" onClick={() => router.push('/dashboard')}>Cancel</button>
                <button className="btn-primary bg-gunsmith-error hover:bg-gunsmith-error/80" onClick={confirmDelete} disabled={busy}>
                  {busy ? 'Deleting…' : 'Yes, Delete Listing'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


