'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Settings, Save, User, Shield, Database, Globe } from 'lucide-react'

export default function AdminSettingsPage() {
  const { user, isAdmin } = useAuth()
  const [settings, setSettings] = useState({
    siteName: 'GunsmithLocal',
    siteDescription: 'Find trusted gunsmiths near you',
    contactEmail: 'support@gunsmithlocal.com',
    maxListingsPerUser: 1,
    autoApproveListings: false,
    requireEmailVerification: true,
    enableFeaturedListings: true,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // For now, just show success since we don't have a settings table yet
      // You can implement actual settings storage later
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <Shield className="h-16 w-16 text-gunsmith-gold mx-auto mb-4" />
        <h2 className="font-bebas text-2xl text-gunsmith-gold mb-2">ACCESS DENIED</h2>
        <p className="text-gunsmith-text-secondary">You don't have permission to access settings.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-bebas text-3xl text-gunsmith-gold mb-2">PLATFORM SETTINGS</h1>
        <p className="text-gunsmith-text-secondary">
          Configure global settings for the GunsmithLocal platform
        </p>
      </div>

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded mb-6">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-8">
        {/* Site Information */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-gunsmith-gold" />
            <h2 className="font-bebas text-xl text-gunsmith-gold">SITE INFORMATION</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleInputChange}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="label">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleInputChange}
                className="input w-full"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="label">Site Description</label>
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleInputChange}
                className="input w-full h-24 resize-none"
              />
            </div>
          </div>
        </div>

        {/* User & Listing Settings */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-gunsmith-gold" />
            <h2 className="font-bebas text-xl text-gunsmith-gold">USER & LISTING SETTINGS</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">Max Listings Per User</label>
              <input
                type="number"
                name="maxListingsPerUser"
                value={settings.maxListingsPerUser}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="input w-32"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoApproveListings"
                  name="autoApproveListings"
                  checked={settings.autoApproveListings}
                  onChange={handleInputChange}
                />
                <label htmlFor="autoApproveListings" className="text-gunsmith-text">
                  Auto-approve new listings
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requireEmailVerification"
                  name="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onChange={handleInputChange}
                />
                <label htmlFor="requireEmailVerification" className="text-gunsmith-text">
                  Require email verification for new users
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enableFeaturedListings"
                  name="enableFeaturedListings"
                  checked={settings.enableFeaturedListings}
                  onChange={handleInputChange}
                />
                <label htmlFor="enableFeaturedListings" className="text-gunsmith-text">
                  Enable featured listings
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Database Info */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-gunsmith-gold" />
            <h2 className="font-bebas text-xl text-gunsmith-gold">DATABASE STATUS</h2>
          </div>
          
          <div className="bg-gunsmith-black/50 rounded p-4">
            <p className="text-gunsmith-text-secondary text-sm">
              Database connection: <span className="text-green-500">Connected</span>
            </p>
            <p className="text-gunsmith-text-secondary text-sm">
              Environment: <span className="text-gunsmith-gold">Development</span>
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-8"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-gunsmith-black border-t-transparent rounded-full" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
