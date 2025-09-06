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
import { Loader2, Save, User as UserIcon, Mail, Lock, AlertCircle, CheckCircle, MapPin, Plus, X } from 'lucide-react'

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

  const [hasListing, setHasListing] = useState(false)
  const [listing, setListing] = useState<any>(null)
  const [additionalLocations, setAdditionalLocations] = useState<any[]>([])
  const [savingLocations, setSavingLocations] = useState(false)

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

      // Fetch user's listing
      const { data: userListing, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user!.id)
        .single()
      
      if (userListing && !listingError) {
        setHasListing(true)
        setListing(userListing)
        setAdditionalLocations(userListing.additional_locations || [])
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

  // Location management functions
  const addLocation = () => {
    setAdditionalLocations(prev => [...prev, {
      street_address: '',
      city: '',
      state_province: '',
      postal_code: ''
    }])
  }

  const removeLocation = (index: number) => {
    setAdditionalLocations(prev => prev.filter((_, i) => i !== index))
  }

  const updateLocation = (index: number, field: string, value: string) => {
    setAdditionalLocations(prev => prev.map((loc, i) => 
      i === index ? { ...loc, [field]: value } : loc
    ))
  }

  async function handleLocationsUpdate(e: React.FormEvent) {
    e.preventDefault()
    setSavingLocations(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('listings')
        .update({ additional_locations: additionalLocations })
        .eq('id', listing.id)

      if (error) throw error
      setSuccess('Locations updated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to update locations')
    } finally {
      setSavingLocations(false)
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

            {/* Additional Business Locations */}
            {hasListing && (
              <div className="card mb-8">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">ADDITIONAL BUSINESS LOCATIONS</h2>
                
                <form onSubmit={handleLocationsUpdate} className="space-y-6">
                  {additionalLocations.map((location, index) => (
                    <div key={index} className="p-4 bg-gunsmith-accent/20 rounded space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-oswald text-gunsmith-gold">Location {index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="text-gunsmith-error hover:text-gunsmith-error/80 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="label">Street Address</label>
                          <input
                            type="text"
                            value={location.street_address}
                            onChange={(e) => updateLocation(index, 'street_address', e.target.value)}
                            className="input w-full"
                            placeholder="123 Main St"
                          />
                        </div>
                        
                        <div>
                          <label className="label">City</label>
                          <input
                            type="text"
                            value={location.city}
                            onChange={(e) => updateLocation(index, 'city', e.target.value)}
                            className="input w-full"
                            placeholder="Springfield"
                          />
                        </div>
                        
                        <div>
                          <label className="label">State</label>
                          <select
                            value={location.state_province}
                            onChange={(e) => updateLocation(index, 'state_province', e.target.value)}
                            className="input w-full"
                          >
                            <option value="">Select State</option>
                            {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                              'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                              'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                              'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                              'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
                            ].map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="label">ZIP Code</label>
                          <input
                            type="text"
                            value={location.postal_code}
                            onChange={(e) => updateLocation(index, 'postal_code', e.target.value)}
                            className="input w-full"
                            placeholder="12345"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addLocation}
                    className="flex items-center gap-2 text-gunsmith-gold hover:text-gunsmith-goldenrod transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Add Another Location
                  </button>
                  
                  <button
                    type="submit"
                    disabled={savingLocations}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {savingLocations ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Save Locations
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

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
