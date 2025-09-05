'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Building2, 
  Users, 
  MessageSquare, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Star
} from 'lucide-react'

interface DashboardStats {
  totalListings: number
  activeListings: number
  pendingListings: number
  totalUsers: number
  totalMessages: number
  unreadMessages: number
  totalReviews: number
  averageRating: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    totalUsers: 0,
    totalMessages: 0,
    unreadMessages: 0,
    totalReviews: 0,
    averageRating: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentListings, setRecentListings] = useState<any[]>([])
  const [recentMessages, setRecentMessages] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      // Fetch listings stats
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })

      const { count: activeListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const { count: pendingListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Fetch users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch messages stats
      const { count: totalMessages } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })

      const { count: unreadMessages } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread')

      // Fetch reviews stats
      const { data: reviewsData, count: totalReviews } = await supabase
        .from('reviews')
        .select('rating', { count: 'exact' })

      const averageRating = reviewsData && reviewsData.length > 0
        ? reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length
        : 0

      // Fetch recent listings
      const { data: recentListingsData } = await supabase
        .from('listings')
        .select('id, business_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent messages
      const { data: recentMessagesData } = await supabase
        .from('contact_messages')
        .select('id, sender_name, subject, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        pendingListings: pendingListings || 0,
        totalUsers: totalUsers || 0,
        totalMessages: totalMessages || 0,
        unreadMessages: unreadMessages || 0,
        totalReviews: totalReviews || 0,
        averageRating,
      })

      setRecentListings(recentListingsData || [])
      setRecentMessages(recentMessagesData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: 'Total Listings',
      value: stats.totalListings,
      icon: Building2,
      color: 'text-gunsmith-gold',
    },
    {
      label: 'Active Listings',
      value: stats.activeListings,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      label: 'Pending Approval',
      value: stats.pendingListings,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Total Messages',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'text-purple-500',
    },
    {
      label: 'Unread Messages',
      value: stats.unreadMessages,
      icon: AlertCircle,
      color: 'text-gunsmith-error',
    },
    {
      label: 'Total Reviews',
      value: stats.totalReviews,
      icon: Star,
      color: 'text-gunsmith-gold',
    },
    {
      label: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: TrendingUp,
      color: 'text-green-500',
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gunsmith-gold"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-gunsmith-card border border-gunsmith-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`h-8 w-8 ${stat.color}`} />
                <span className="font-bebas text-3xl text-gunsmith-gold">
                  {stat.value}
                </span>
              </div>
              <p className="text-gunsmith-text-secondary text-sm">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Listings */}
        <div className="bg-gunsmith-card border border-gunsmith-border rounded-lg p-6">
          <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">
            RECENT LISTINGS
          </h2>
          <div className="space-y-3">
            {recentListings.length === 0 ? (
              <p className="text-gunsmith-text-secondary">No listings yet</p>
            ) : (
              recentListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between p-3 bg-gunsmith-accent/20 rounded">
                  <div>
                    <p className="font-oswald text-gunsmith-text">
                      {listing.business_name}
                    </p>
                    <p className="text-xs text-gunsmith-text-secondary">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    listing.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : listing.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {listing.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-gunsmith-card border border-gunsmith-border rounded-lg p-6">
          <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">
            RECENT MESSAGES
          </h2>
          <div className="space-y-3">
            {recentMessages.length === 0 ? (
              <p className="text-gunsmith-text-secondary">No messages yet</p>
            ) : (
              recentMessages.map((message) => (
                <div key={message.id} className="flex items-center justify-between p-3 bg-gunsmith-accent/20 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-oswald text-gunsmith-text truncate">
                      {message.subject}
                    </p>
                    <p className="text-xs text-gunsmith-text-secondary">
                      From: {message.sender_name} • {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {message.status === 'unread' && (
                    <span className="px-2 py-1 text-xs bg-gunsmith-error/20 text-gunsmith-error rounded">
                      Unread
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
