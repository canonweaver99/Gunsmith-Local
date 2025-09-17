import Link from 'next/link'
import { Crosshair } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function FooterVerifiedCount() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    let isMounted = true
    const fetchCount = async () => {
      try {
        const { count } = await supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('is_verified', true)
        if (isMounted) setCount(count || 0)
      } catch (_) {
        if (isMounted) setCount(null)
      }
    }
    fetchCount()
    const t = setInterval(fetchCount, 60_000)
    return () => { isMounted = false; clearInterval(t) }
  }, [])
  if (count === null) return <span>Verified Gunsmiths</span>
  return <span><span className="text-gunsmith-gold">{count.toLocaleString()}</span> {count === 1 ? 'Verified Gunsmith' : 'Verified Gunsmiths'}</span>
}

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 mt-auto">
      {/* Trust & Safety Strip */}
      <div className="bg-gunsmith-surface-1 border-b border-white/5">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-4 text-gunsmith-text-muted">
            <Link href="/verify-ffl" className="hover:text-gunsmith-gold transition-colors">
              Verification Policy
            </Link>
            <span className="text-gunsmith-text-muted/50">•</span>
            <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        <div className="text-gunsmith-text-muted">
          <FooterVerifiedCount />
        </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Crosshair className="h-6 w-6 text-gunsmith-gold" />
              <span className="font-montserrat font-black text-2xl text-gunsmith-gold tracking-tight">
                GUNSMITHLOCAL
              </span>
            </div>
            <p className="text-gunsmith-text-secondary text-sm">
              Your trusted directory for professional gunsmiths across America.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-montserrat font-bold text-lg text-gunsmith-gold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/listings" className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors text-sm">
                  Find Gunsmiths
                </Link>
              </li>
              <li>
                <Link href="/business-portal" className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors text-sm">
                  Business Portal
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-montserrat font-bold text-lg text-gunsmith-gold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-montserrat font-bold text-lg text-gunsmith-gold mb-4">Contact</h3>
            <p className="text-gunsmith-text-secondary text-sm">
              Questions about listings?<br />
              <a href="mailto:support@gunsmithlocal.com" className="text-gunsmith-gold hover:text-gunsmith-gold/90">
                contact@gunsmithlocal.com
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-8 text-center">
          <p className="text-gunsmith-text-muted text-sm">
            © {new Date().getFullYear()} GunsmithLocal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
