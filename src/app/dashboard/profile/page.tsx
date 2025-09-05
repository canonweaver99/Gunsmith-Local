'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NotificationSettings from '@/components/NotificationSettings'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { updatePassword } from '@/lib/auth'
import { Loader2, Save, User as UserIcon, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  bio: string
  website: string
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    full_name: '',
    phone: '',
    bio: '',
    website: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    } else if (user && !loading) {
      fetchProfile()
    }
  }, [user, authLoading, router])

  async function fetchProfile() {
    try {
      setLoading(true)
      
      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingProfile) {
        setProfile({
          id: existingProfile.id,
          email: user!.email || '',
          full_name: existingProfile.full_name || '',
          phone: existingProfile.phone || '',
          bio: existingProfile.bio || '',
          website: existingProfile.website || '',
        })
      } else {
        // Create profile if it doesn't exist
        if (!user!.email) {
          throw new Error('User email is required but not available')
        }
        
        const newProfile = {
          id: user!.id,
          email: user!.email,
          full_name: user!.user_metadata?.full_name || '',
        }
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
        
        if (insertError) throw insertError
        
        setProfile({
          ...newProfile,
          phone: '',
          bio: '',
          website: '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // Function to format website URL with https://
  function formatWebsiteUrl(url: string): string {
    if (!url) return ''
    
    // Remove any existing protocol
    let formattedUrl = url.replace(/^https?:\/\//, '')
    
    // Add https:// if it doesn't start with a protocol
    if (formattedUrl && !formattedUrl.startsWith('http')) {
      formattedUrl = `https://${formattedUrl}`
    }
    
    return formattedUrl
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // Format the website URL before saving
      const formattedWebsite = formatWebsiteUrl(profile.website)
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user!.id,
          full_name: profile.full_name,
          phone: profile.phone,
          bio: profile.bio,
          website: formattedWebsite,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      // Update the profile state with the formatted URL
      setProfile({ ...profile, website: formattedWebsite })
      setSuccess('Profile updated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setSaving(true)

    try {
      await updatePassword(passwordData.newPassword)
      setSuccess('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
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
        {/* Page Header */}
        <section className="bg-gunsmith-accent/20 py-12 px-4">
          <div className="container mx-auto">
            <h1 className="font-bebas text-5xl text-gunsmith-gold mb-2">
              MY PROFILE
            </h1>
            <p className="text-gunsmith-text-secondary">
              Manage your account settings and profile information
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            {/* Alerts */}
            {error && (
              <div className="mb-6 bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-500/20 border border-green-500 text-green-400 p-4 rounded flex items-start gap-2">
                <CheckCircle className="h-5 w-5 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Profile Information */}
            <div className="card mb-8">
              <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">PROFILE INFORMATION</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="input w-full pl-10 opacity-50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gunsmith-text-secondary mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="label">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="input w-full pl-10"
                        placeholder="John Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="input w-full"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="label">Website</label>
                    <input
                      type="text"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="input w-full"
                      placeholder="example.com or https://example.com"
                    />
                    <p className="text-xs text-gunsmith-text-secondary mt-1">
                      Will automatically format with https://
                    </p>
                  </div>
                </div>

                <div>
                  <label className="label">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="input w-full min-h-[100px]"
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gunsmith-text-secondary mt-1">
                    {profile.bio.length}/500 characters
                  </p>
                </div>

                <button
                  type="submit"
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
                      Save Profile
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Notification Settings */}
            <NotificationSettings />

            {/* Change Password */}
            <div className="card">
              <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">CHANGE PASSWORD</h2>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="input w-full pl-10"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="input w-full pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
