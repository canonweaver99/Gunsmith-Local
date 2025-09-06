'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import VerificationBadge from '@/components/VerificationBadge'
import { Shield, Check, X, Clock, ExternalLink, MapPin, Calendar } from 'lucide-react'

interface PendingListing {
  id: string
  business_name: string
  ffl_license_number: string
  email: string
  city: string
  state_province: string
  created_at: string
  verification_status: 'pending' | 'verified' | 'rejected'
  is_verified: boolean
  owner_id: string
}

export default function AdminVerificationPage() {
  const { user, isAdmin } = useAuth()
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) {
      fetchPendingVerifications()
    }
  }, [isAdmin])

  const fetchPendingVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_verification_queue')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setPendingListings(data || [])
    } catch (error) {
      console.error('Error fetching pending verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyFFL = async (listingId: string, approve: boolean) => {
    setProcessingId(listingId)
    
    try {
      const { error } = await supabase.rpc(
        approve ? 'verify_business' : 'reject_business_verification',
        { listing_id: listingId }
      )

      if (error) throw error

      // Remove from pending list
      setPendingListings(prev => prev.filter(listing => listing.id !== listingId))
      
      // Show success message
      alert(approve ? 'FFL License verified successfully!' : 'Verification rejected')
    } catch (error) {
      console.error('Error processing verification:', error)
      alert('Error processing verification. Please try again.')
    } finally {
      setProcessingId(null)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gunsmith-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gunsmith-gold mx-auto mb-4" />
          <h1 className="font-bebas text-3xl text-gunsmith-gold mb-2">ACCESS DENIED</h1>
          <p className="text-gunsmith-text-secondary">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gunsmith-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-bebas text-4xl text-gunsmith-gold mb-2">FFL VERIFICATION QUEUE</h1>
          <p className="text-gunsmith-text-secondary">
            Review and verify FFL licenses for pending business listings
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Clock className="h-8 w-8 text-gunsmith-gold mx-auto mb-4 animate-spin" />
            <p className="text-gunsmith-text-secondary">Loading pending verifications...</p>
          </div>
        ) : pendingListings.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gunsmith-gold mx-auto mb-4" />
            <h2 className="font-bebas text-2xl text-gunsmith-gold mb-2">ALL CAUGHT UP!</h2>
            <p className="text-gunsmith-text-secondary">No businesses are waiting for FFL verification.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingListings.map((listing) => (
              <div key={listing.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Business Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">
                          {listing.business_name}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                            <Shield className="h-4 w-4" />
                            <span className="font-medium">FFL:</span>
                            <span className="font-mono text-gunsmith-gold">{listing.ffl_license_number}</span>
                          </div>
                          
                          {listing.email && (
                            <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                              <span>📧</span>
                              <span>{listing.email}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                            <MapPin className="h-4 w-4" />
                            <span>{listing.city}, {listing.state_province}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted: {new Date(listing.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <VerificationBadge 
                          isVerified={listing.is_verified}
                          verificationStatus={listing.verification_status}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <a
                      href={`https://www.atf.gov/firearms/listing-federal-firearms-licensees`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost text-sm flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Check ATF Database
                    </a>
                    
                    <button
                      onClick={() => handleVerifyFFL(listing.id, false)}
                      disabled={processingId === listing.id}
                      className="btn-secondary bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20 text-sm flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    
                    <button
                      onClick={() => handleVerifyFFL(listing.id, true)}
                      disabled={processingId === listing.id}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Verify FFL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
