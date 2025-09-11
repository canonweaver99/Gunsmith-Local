'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Shield, Save, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function PrivacySettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [privacy, setPrivacy] = useState({
    showEmail: false,
    showPhone: false,
    allowAnalytics: true,
    allowMarketing: false
  })

  useEffect(() => {
    if (user) {
      fetchPrivacySettings()
    }
  }, [user])

  const fetchPrivacySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('show_email, show_phone, allow_analytics, allow_marketing')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setPrivacy({
          showEmail: data.show_email ?? false,
          showPhone: data.show_phone ?? false,
          allowAnalytics: data.allow_analytics ?? true,
          allowMarketing: data.allow_marketing ?? false
        })
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Check if a preferences row already exists for this user
      const { data: existing, error: fetchErr } = await supabase
        .from('user_preferences')
        .select('user_id')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (fetchErr) throw fetchErr

      if (existing) {
        const { error: updErr } = await supabase
          .from('user_preferences')
          .update({
            show_email: privacy.showEmail,
            show_phone: privacy.showPhone,
            allow_analytics: privacy.allowAnalytics,
            allow_marketing: privacy.allowMarketing,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user?.id)

        if (updErr) throw updErr
      } else {
        const { error: insErr } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user?.id!,
            show_email: privacy.showEmail,
            show_phone: privacy.showPhone,
            allow_analytics: privacy.allowAnalytics,
            allow_marketing: privacy.allowMarketing,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        if (insErr) throw insErr
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to update privacy settings')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gunsmith-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-8">PRIVACY SETTINGS</h1>
            
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                    <span className="text-sm">Privacy settings updated successfully!</span>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-bebas text-xl text-gunsmith-gold">PROFILE VISIBILITY</h3>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.showEmail}
                      onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gunsmith-text font-medium flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Show Email on Profile
                      </p>
                      <p className="text-sm text-gunsmith-text-secondary">
                        Allow other users to see your email address
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.showPhone}
                      onChange={(e) => setPrivacy({ ...privacy, showPhone: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gunsmith-text font-medium flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Show Phone on Profile
                      </p>
                      <p className="text-sm text-gunsmith-text-secondary">
                        Allow other users to see your phone number
                      </p>
                    </div>
                  </label>
                </div>

                <div className="space-y-4 pt-4 border-t border-gunsmith-border">
                  <h3 className="font-bebas text-xl text-gunsmith-gold">DATA & ANALYTICS</h3>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.allowAnalytics}
                      onChange={(e) => setPrivacy({ ...privacy, allowAnalytics: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gunsmith-text font-medium">Allow Analytics</p>
                      <p className="text-sm text-gunsmith-text-secondary">
                        Help us improve by allowing anonymous usage analytics
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.allowMarketing}
                      onChange={(e) => setPrivacy({ ...privacy, allowMarketing: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gunsmith-text font-medium">Marketing Communications</p>
                      <p className="text-sm text-gunsmith-text-secondary">
                        Receive promotional emails and special offers
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gunsmith-border">
                  <p className="text-sm text-gunsmith-text-secondary mb-4">
                    For more information about how we handle your data, please read our{' '}
                    <a href="/privacy-policy" className="text-gunsmith-gold hover:text-gunsmith-goldenrod">
                      Privacy Policy
                    </a>
                  </p>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
