'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  MessageSquare, 
  Settings,
  ChevronRight,
  Shield
} from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading, isAdmin } = useAuth()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/')
    }
  }, [user, loading, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gunsmith-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const adminLinks = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/listings',
      label: 'Manage Listings',
      icon: Building2,
    },
    {
      href: '/admin/verification',
      label: 'Verification',
      icon: Shield,
    },
    {
      href: '/admin/users',
      label: 'Manage Users',
      icon: Users,
    },
    {
      href: '/admin/messages',
      label: 'Contact Messages',
      icon: MessageSquare,
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
    },
  ]

  return (
    <div className="min-h-screen bg-gunsmith-black">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="mb-8 bg-gunsmith-card border border-gunsmith-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-gunsmith-gold" />
            <h1 className="font-bebas text-3xl text-gunsmith-gold">ADMIN DASHBOARD</h1>
          </div>
          <p className="text-gunsmith-text-secondary">
            Manage listings, users, and platform settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-gunsmith-card border border-gunsmith-border rounded-lg overflow-hidden">
              {adminLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gunsmith-hover transition-colors border-b border-gunsmith-border last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-gunsmith-gold" />
                      <span className="font-oswald text-gunsmith-text">
                        {link.label}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gunsmith-text-secondary" />
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}
