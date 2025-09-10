'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, Listing } from '@/lib/supabase'
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock,
  Edit,
  Trash2,
  Eye,
  Building2,
  AlertCircle,
  Loader2
} from 'lucide-react'

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newBiz, setNewBiz] = useState({ business_name: '', city: '', state_province: '' })

  useEffect(() => {
    fetchListings()
  }, [])

  useEffect(() => {
    filterListings()
  }, [listings, searchTerm, statusFilter])

  async function fetchListings() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setListings(data || [])
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterListings() {
    let filtered = [...listings]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.state_province?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(listing => listing.status === statusFilter)
    }

    setFilteredListings(filtered)
  }

  async function createListingAsAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!newBiz.business_name || newBiz.business_name.trim().length === 0) {
      alert('Please enter a business name')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/listings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBiz)
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create listing')
      await fetchListings()
      setNewBiz({ business_name: '', city: '', state_province: '' })
    } catch (err) {
      alert((err as any).message || 'Failed to create listing')
    } finally {
      setCreating(false)
    }
  }

  async function updateListingStatus(id: string, newStatus: string) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setListings(prev => prev.map(listing => 
        listing.id === id ? { ...listing, status: newStatus } : listing
      ))
    } catch (error) {
      console.error('Error updating listing status:', error)
      alert('Failed to update listing status')
    } finally {
      setActionLoading(null)
    }
  }

  async function toggleVerification(id: string, currentStatus: boolean) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          is_verified: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setListings(prev => prev.map(listing => 
        listing.id === id ? { ...listing, is_verified: !currentStatus } : listing
      ))
    } catch (error) {
      console.error('Error updating verification status:', error)
      alert('Failed to update verification status')
    } finally {
      setActionLoading(null)
    }
  }

  async function toggleFeatured(id: string, currentStatus: boolean) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          is_featured: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Update local state
      setListings(prev => prev.map(listing => 
        listing.id === id ? { ...listing, is_featured: !currentStatus } : listing
      ))
    } catch (error) {
      console.error('Error updating featured status:', error)
      alert('Failed to update featured status')
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteListing(id: string) {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }

    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Update local state
      setListings(prev => prev.filter(listing => listing.id !== id))
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Failed to delete listing')
    } finally {
      setActionLoading(null)
    }
  }

  const statusCounts = {
    all: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    pending: listings.filter(l => l.status === 'pending').length,
    inactive: listings.filter(l => l.status === 'inactive').length,
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gunsmith-card border border-gunsmith-border rounded-lg p-6">
        <h1 className="font-bebas text-3xl text-gunsmith-gold mb-6">MANAGE LISTINGS</h1>

        {/* Quick Create + Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Quick Create (admin-owned = false) */}
          <form onSubmit={createListingAsAdmin} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Business name"
              value={newBiz.business_name}
              onChange={(e) => setNewBiz({ ...newBiz, business_name: e.target.value })}
              required
              className="input w-56"
            />
            <input
              type="text"
              placeholder="City"
              value={newBiz.city}
              onChange={(e) => setNewBiz({ ...newBiz, city: e.target.value })}
              className="input w-36"
            />
            <input
              type="text"
              placeholder="State"
              value={newBiz.state_province}
              onChange={(e) => setNewBiz({ ...newBiz, state_province: e.target.value })}
              className="input w-24"
            />
            <button type="submit" className="btn-primary px-4" disabled={creating}>
              {creating ? 'Adding…' : 'Add Listing'}
            </button>
          </form>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gunsmith-text-secondary" />
              <input
                type="text"
                placeholder="Search by name, email, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {(['all', 'active', 'pending', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded font-oswald capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-gunsmith-gold text-gunsmith-black'
                    : 'bg-gunsmith-accent text-gunsmith-text hover:bg-gunsmith-gold hover:text-gunsmith-black'
                }`}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gunsmith-text-secondary mb-4">
          Showing {filteredListings.length} of {listings.length} listings
        </p>

        {/* Listings Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gunsmith-border">
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Business</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Location</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Status</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Verified</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Featured</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Created</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gunsmith-text-secondary">
                    No listings found
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-gunsmith-border hover:bg-gunsmith-hover">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-oswald text-gunsmith-text">{listing.business_name}</p>
                        {listing.email && (
                          <p className="text-xs text-gunsmith-text-secondary">{listing.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gunsmith-text-secondary text-sm">
                      {listing.city && listing.state_province ? (
                        <span>{listing.city}, {listing.state_province}</span>
                      ) : (
                        <span className="text-gunsmith-text-secondary/50">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={listing.status || 'pending'}
                        onChange={(e) => updateListingStatus(listing.id, e.target.value)}
                        disabled={actionLoading === listing.id}
                        className="text-xs bg-gunsmith-accent text-gunsmith-text px-2 py-1 rounded border border-gunsmith-border"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleVerification(listing.id, listing.is_verified || false)}
                        disabled={actionLoading === listing.id}
                        className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors"
                      >
                        {listing.is_verified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleFeatured(listing.id, listing.is_featured || false)}
                        disabled={actionLoading === listing.id}
                        className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors"
                      >
                        {listing.is_featured ? (
                          <CheckCircle className="h-5 w-5 text-gunsmith-gold" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gunsmith-text-secondary text-sm">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/listings/${listing.slug}`}
                          className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/listings/${listing.id}/edit`}
                          className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          disabled={actionLoading === listing.id}
                          className="text-gunsmith-text-secondary hover:text-gunsmith-error transition-colors"
                          title="Delete"
                        >
                          {actionLoading === listing.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
