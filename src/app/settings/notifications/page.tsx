'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { Bell, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function NotificationSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [notifications, setNotifications] = useState({
    emailNewReviews: true,
    emailNewMessages: true,
    emailPromotions: false,
    emailWeeklyDigest: false
  })

  useEffect(() => {
    if (user) {
      fetchNotificationPreferences()
    }
  }, [user])

  const fetchNotificationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('email_reviews, email_contact_messages, email_marketing, email_weekly_digest')
        .eq('user_id', user?.id)
        .single()

      if (data) {
        setNotifications({
          emailNewReviews: data.email_reviews ?? true,
          emailNewMessages: data.email_contact_messages ?? true,
          emailPromotions: data.email_marketing ?? false,
          emailWeeklyDigest: data.email_weekly_digest ?? false
        })
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      // Set error message if table doesn't exist
      if (error.message?.includes('does not exist')) {
        setError('Notification settings feature not yet configured. Contact support.')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user?.id,
          email_reviews: notifications.emailNewReviews,
          email_contact_messages: notifications.emailNewMessages,
          email_marketing: notifications.emailPromotions,
          email_weekly_digest: notifications.emailWeeklyDigest,
          updated_at: new Date()
        })

      if (error) {
        console.error('Upsert error:', error)
        if (error.message?.includes('does not exist')) {
          throw new Error('Notification settings feature not yet configured. Contact support.')
        }
        throw error
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to update notification preferences')
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
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-8">NOTIFICATION SETTINGS</h1>
            
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
                    <span className="text-sm">Notification preferences updated successfully!</span>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-bebas text-xl text-gunsmith-gold">EMAIL NOTIFICATIONS</h3>
                  
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailNewReviews}
                      onChange={(e) => setNotifications({ ...notifications, emailNewReviews: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gunsmith-text font-medium">New Reviews</p>
                      <p className="text-sm text-gunsmith-text-secondary">
                        Get notified when someone leaves a review on your listing
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailNewMessages}
                      onChange={(e) => setNotifications({ ...notifications, emailNewMessages: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gunsmith-text font-medium">New Messages</p>
                      <p className="text-sm text-gunsmith-text-secondary">
                        Get notified when you receive new messages
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailPromotions}
                      onChange={(e) => setNotifications({ ...notifications, emailPromotions: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gunsmith-text font-medium">Promotions & Updates</p>
                      <p className="text-sm text-gunsmith-text-secondary">
                        Receive updates about new features and special offers
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailWeeklyDigest}
                      onChange={(e) => setNotifications({ ...notifications, emailWeeklyDigest: e.target.checked })}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-gunsmith-text font-medium">Weekly Digest</p>
                      <p className="text-sm text-gunsmith-text-secondary">
                        Get a weekly summary of activity on your listings
                      </p>
                    </div>
                  </label>
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
                        Save Preferences
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
