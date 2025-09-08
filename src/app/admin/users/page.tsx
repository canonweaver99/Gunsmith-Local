'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Search, 
  Shield,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  Phone
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
  bio: string | null
  website: string | null
  listings_count?: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm])

  async function fetchUsers() {
    try {
      // Fetch all user profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch listing counts for each user
      const usersWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count } = await supabase
            .from('listings')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', profile.id)

          return {
            ...profile,
            listings_count: count || 0
          }
        })
      )

      setUsers(usersWithCounts)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterUsers() {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredUsers(filtered)
  }

  async function toggleAdminStatus(userId: string, currentStatus: boolean) {
    setActionLoading(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_admin: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_admin: !currentStatus } : user
      ))
    } catch (error) {
      console.error('Error updating admin status:', error)
      alert('Failed to update admin status')
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their listings and data. This action cannot be undone.')) {
      return
    }

    setActionLoading(userId)
    try {
      // Get requester id
      const { data: session } = await supabase.auth.getSession()
      const requesterId = session.session?.user?.id

      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, requesterId }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to delete user')

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId))
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(`Failed to delete user: ${error?.message || 'Unknown error'}`)
    } finally {
      setActionLoading(null)
    }
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
        <h1 className="font-bebas text-3xl text-gunsmith-gold mb-6">MANAGE USERS</h1>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gunsmith-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gunsmith-text-secondary mb-4">
          Showing {filteredUsers.length} of {users.length} users
        </p>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gunsmith-border">
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">User</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Contact</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Listings</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Admin</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Joined</th>
                <th className="text-left py-3 px-4 font-bebas text-gunsmith-gold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gunsmith-text-secondary">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gunsmith-border hover:bg-gunsmith-hover">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gunsmith-accent rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gunsmith-gold" />
                        </div>
                        <div>
                          <p className="font-oswald text-gunsmith-text">
                            {user.full_name || 'No name'}
                          </p>
                          <p className="text-xs text-gunsmith-text-secondary">
                            ID: {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gunsmith-text-secondary">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gunsmith-gold" />
                        <span className="text-gunsmith-text">{user.listings_count}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                        disabled={actionLoading === user.id}
                        className="flex items-center gap-2 text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors"
                      >
                        {user.is_admin ? (
                          <>
                            <Shield className="h-5 w-5 text-gunsmith-gold" />
                            <span className="text-xs text-gunsmith-gold">Admin</span>
                          </>
                        ) : (
                          <>
                            <User className="h-5 w-5" />
                            <span className="text-xs">User</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-gunsmith-text-secondary text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={actionLoading === user.id || user.is_admin}
                        className="text-gunsmith-text-secondary hover:text-gunsmith-error transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user.is_admin ? "Cannot delete admin users" : "Delete user"}
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </button>
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
