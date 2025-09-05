'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, Save, Mail, Bell, CheckCircle, AlertCircle } from 'lucide-react'

interface NotificationSettings {
  email_contact_messages: boolean
  email_reviews: boolean
  email_weekly_digest: boolean
  email_marketing: boolean
}

export default function NotificationSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings>({
    email_contact_messages: true,
    email_reviews: true,
    email_weekly_digest: true,
    email_marketing: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  async function fetchSettings() {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setSettings({
          email_contact_messages: data.email_contact_messages ?? true,
          email_reviews: data.email_reviews ?? true,
          email_weekly_digest: data.email_weekly_digest ?? true,
          email_marketing: data.email_marketing ?? false,
        })
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setSuccess('Notification settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">EMAIL NOTIFICATIONS</h2>
      
      {error && (
        <div className="mb-4 bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-500/20 border border-green-500 text-green-400 p-4 rounded flex items-start gap-2">
          <CheckCircle className="h-5 w-5 mt-0.5" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Contact Messages */}
        <div className="flex items-center justify-between p-4 bg-gunsmith-accent/20 rounded">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gunsmith-gold" />
            <div>
              <h3 className="font-oswald font-medium text-gunsmith-text">Contact Messages</h3>
              <p className="text-sm text-gunsmith-text-secondary">
                Get notified when someone contacts your business
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email_contact_messages}
              onChange={(e) => setSettings({ ...settings, email_contact_messages: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gunsmith-accent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gunsmith-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gunsmith-gold"></div>
          </label>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between p-4 bg-gunsmith-accent/20 rounded">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-gunsmith-gold" />
            <div>
              <h3 className="font-oswald font-medium text-gunsmith-text">New Reviews</h3>
              <p className="text-sm text-gunsmith-text-secondary">
                Get notified when someone reviews your business
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email_reviews}
              onChange={(e) => setSettings({ ...settings, email_reviews: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gunsmith-accent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gunsmith-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gunsmith-gold"></div>
          </label>
        </div>

        {/* Weekly Digest */}
        <div className="flex items-center justify-between p-4 bg-gunsmith-accent/20 rounded">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gunsmith-gold" />
            <div>
              <h3 className="font-oswald font-medium text-gunsmith-text">Weekly Digest</h3>
              <p className="text-sm text-gunsmith-text-secondary">
                Weekly summary of your business activity
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email_weekly_digest}
              onChange={(e) => setSettings({ ...settings, email_weekly_digest: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gunsmith-accent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gunsmith-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gunsmith-gold"></div>
          </label>
        </div>

        {/* Marketing */}
        <div className="flex items-center justify-between p-4 bg-gunsmith-accent/20 rounded">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-gunsmith-gold" />
            <div>
              <h3 className="font-oswald font-medium text-gunsmith-text">Marketing Updates</h3>
              <p className="text-sm text-gunsmith-text-secondary">
                Tips, features, and platform updates
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.email_marketing}
              onChange={(e) => setSettings({ ...settings, email_marketing: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gunsmith-accent peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gunsmith-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gunsmith-gold"></div>
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
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
    </div>
  )
}
