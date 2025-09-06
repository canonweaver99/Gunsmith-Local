'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, Crosshair, User, LogOut, Star, Map, Shield, ChevronDown, Settings, Bell, Building2, HelpCircle, Lock, MapPin, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasListing, setHasListing] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, loading, signOut, isAdmin } = useAuth()

  useEffect(() => {
    async function checkUserListing() {
      if (!user) {
        setHasListing(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id')
          .eq('owner_id', user.id)
          .single()
        
        setHasListing(!!data && !error)
      } catch (error) {
        setHasListing(false)
      }
    }

    checkUserListing()
  }, [user])

  // Click outside handler for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-gunsmith-header border-b border-gunsmith-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Crosshair className="h-8 w-8 text-gunsmith-gold" />
            <span className="font-bebas text-3xl text-gunsmith-gold tracking-wider">
              GUNSMITHLOCAL
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors">
              Home
            </Link>
            <Link href="/listings" className="font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors">
              Find Gunsmiths
            </Link>
            <Link href="/map" className="font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors flex items-center gap-1">
              <Map className="h-4 w-4" />
              Map
            </Link>
            <Link href="/featured" className="font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors flex items-center gap-1">
              <Star className="h-4 w-4" />
              Featured
            </Link>
            {user && (!hasListing || isAdmin) && (
              <Link href="/add-business" className="font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors">
                Add Business
              </Link>
            )}
            <Link href="/about" className="font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors">
              About
            </Link>
            
            {loading ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-8 bg-gunsmith-accent animate-pulse rounded"></div>
                <div className="w-16 h-8 bg-gunsmith-accent animate-pulse rounded"></div>
              </div>
            ) : user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="font-oswald font-medium text-gunsmith-gold hover:text-gunsmith-goldenrod transition-colors flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                    <ChevronDown className={`h-4 w-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-gunsmith-card border border-gunsmith-border rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        {/* Account Section */}
                        <div className="px-4 py-2 border-b border-gunsmith-border">
                          <p className="text-xs font-bebas text-gunsmith-gold uppercase tracking-wider">Account</p>
                        </div>
                        <Link href="/settings/profile" className="block px-4 py-2 text-sm text-gunsmith-text hover:bg-gunsmith-accent hover:text-gunsmith-gold transition-colors">
                          <User className="inline-block h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        <Link href="/settings/password" className="block px-4 py-2 text-sm text-gunsmith-text hover:bg-gunsmith-accent hover:text-gunsmith-gold transition-colors">
                          <Lock className="inline-block h-4 w-4 mr-2" />
                          Password
                        </Link>
                        
                        {/* Preferences Section */}
                        <div className="px-4 py-2 border-b border-t border-gunsmith-border mt-2">
                          <p className="text-xs font-bebas text-gunsmith-gold uppercase tracking-wider">Preferences</p>
                        </div>
                        <Link href="/settings/location" className="block px-4 py-2 text-sm text-gunsmith-text hover:bg-gunsmith-accent hover:text-gunsmith-gold transition-colors">
                          <MapPin className="inline-block h-4 w-4 mr-2" />
                          Location
                        </Link>
                        <Link href="/settings/notifications" className="block px-4 py-2 text-sm text-gunsmith-text hover:bg-gunsmith-accent hover:text-gunsmith-gold transition-colors">
                          <Bell className="inline-block h-4 w-4 mr-2" />
                          Notifications
                        </Link>
                        
                        {/* Gunsmith Only Section */}
                        {hasListing && (
                          <>
                            <div className="px-4 py-2 border-b border-t border-gunsmith-border mt-2">
                              <p className="text-xs font-bebas text-gunsmith-gold uppercase tracking-wider">Business</p>
                            </div>
                            <Link href="/settings/business" className="block px-4 py-2 text-sm text-gunsmith-text hover:bg-gunsmith-accent hover:text-gunsmith-gold transition-colors">
                              <Building2 className="inline-block h-4 w-4 mr-2" />
                              Business Info
                            </Link>
                            <Link href="/settings/services" className="block px-4 py-2 text-sm text-gunsmith-text hover:bg-gunsmith-accent hover:text-gunsmith-gold transition-colors">
                              <Settings className="inline-block h-4 w-4 mr-2" />
                              Services
                            </Link>
                            <Link href="/settings/billing" className="block px-4 py-2 text-sm text-gunsmith-text hover:bg-gunsmith-accent hover:text-gunsmith-gold transition-colors">
                              <CreditCard className="inline-block h-4 w-4 mr-2" />
                              Billing
                            </Link>
                          </>
                        )}
                        
                        {/* General Section */}
                        <div className="px-4 py-2 border-b border-t border-gunsmith-border mt-2">
                          <p className="text-xs font-bebas text-gunsmith-gold uppercase tracking-wider">General</p>
                        </div>
                        <Link href="/settings/privacy" className="block px-4 py-2 text-sm text-gunsmith-text hover:bg-gunsmith-accent hover:text-gunsmith-gold transition-colors">
                          <Shield className="inline-block h-4 w-4 mr-2" />
                          Privacy
                        </Link>
                        <Link href="/help" className="block px-4 py-2 text-sm text-gunsmith-text hover:bg-gunsmith-accent hover:text-gunsmith-gold transition-colors">
                          <HelpCircle className="inline-block h-4 w-4 mr-2" />
                          Help
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false)
                            setShowSignOutConfirm(true)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gunsmith-text hover:bg-gunsmith-accent hover:text-gunsmith-gold transition-colors border-t border-gunsmith-border"
                        >
                          <LogOut className="inline-block h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gunsmith-gold"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <Link
              href="/"
              className="block py-2 font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/listings"
              className="block py-2 font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Gunsmiths
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-2 py-2 font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Map className="h-4 w-4" />
              Map
            </Link>
            <Link
              href="/featured"
              className="flex items-center gap-2 py-2 font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Star className="h-4 w-4" />
              Featured
            </Link>
            {user && (!hasListing || isAdmin) && (
              <Link
                href="/add-business"
                className="block py-2 font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Add Business
              </Link>
            )}
            <Link
              href="/about"
              className="block py-2 font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            <div className="border-t border-gunsmith-border pt-2 mt-2">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-8 bg-gunsmith-accent animate-pulse rounded"></div>
                  <div className="h-8 bg-gunsmith-accent animate-pulse rounded"></div>
                </div>
              ) : user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block py-2 font-oswald font-medium text-gunsmith-gold hover:text-gunsmith-goldenrod transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="block py-2 font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {/* Settings Menu Items for Mobile */}
                  <div className="space-y-1 py-2">
                    <p className="text-xs font-bebas text-gunsmith-gold uppercase tracking-wider px-2">Settings</p>
                    <Link
                      href="/settings/profile"
                      className="block py-2 pl-4 text-sm text-gunsmith-text hover:text-gunsmith-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings/password"
                      className="block py-2 pl-4 text-sm text-gunsmith-text hover:text-gunsmith-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Password
                    </Link>
                    <Link
                      href="/settings/location"
                      className="block py-2 pl-4 text-sm text-gunsmith-text hover:text-gunsmith-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Location
                    </Link>
                    <Link
                      href="/settings/notifications"
                      className="block py-2 pl-4 text-sm text-gunsmith-text hover:text-gunsmith-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Notifications
                    </Link>
                    {hasListing && (
                      <>
                        <Link
                          href="/settings/business"
                          className="block py-2 pl-4 text-sm text-gunsmith-text hover:text-gunsmith-gold transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Business Info
                        </Link>
                      </>
                    )}
                    <Link
                      href="/settings/privacy"
                      className="block py-2 pl-4 text-sm text-gunsmith-text hover:text-gunsmith-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Privacy
                    </Link>
                    <Link
                      href="/help"
                      className="block py-2 pl-4 text-sm text-gunsmith-text hover:text-gunsmith-gold transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Help
                    </Link>
                  </div>
                  
                  <button
                    onClick={() => setShowSignOutConfirm(true)}
                    className="block py-2 font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors w-full text-left border-t border-gunsmith-border mt-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block py-2 font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block py-2 font-oswald font-medium text-gunsmith-gold hover:text-gunsmith-goldenrod transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Sign Out Confirmation Popup */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gunsmith-card border border-gunsmith-border rounded-xl p-8 m-4 max-w-md w-full">
            <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4 text-center">
              CONFIRM SIGN OUT
            </h3>
            <p className="text-gunsmith-text text-center mb-6">
              Are you sure you want to sign out?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  signOut()
                  setShowSignOutConfirm(false)
                  setIsMenuOpen(false)
                }}
                className="btn-primary flex-1"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
