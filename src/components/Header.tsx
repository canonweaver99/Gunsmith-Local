'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Crosshair, User, LogOut, Star, Map, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasListing, setHasListing] = useState(false)
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
            {user && !hasListing && (
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
                <button
                  onClick={() => signOut()}
                  className="font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
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
            {user && !hasListing && (
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
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="block py-2 font-oswald font-medium text-gunsmith-text hover:text-gunsmith-gold transition-colors w-full text-left"
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
    </header>
  )
}
