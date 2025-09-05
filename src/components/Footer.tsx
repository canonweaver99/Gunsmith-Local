import Link from 'next/link'
import { Crosshair } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gunsmith-header border-t border-gunsmith-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Crosshair className="h-6 w-6 text-gunsmith-gold" />
              <span className="font-bebas text-2xl text-gunsmith-gold tracking-wider">
                GUNSMITHLOCAL
              </span>
            </div>
            <p className="text-gunsmith-text-secondary text-sm">
              Your trusted directory for professional gunsmiths across America.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bebas text-xl text-gunsmith-gold mb-4">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/listings" className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors text-sm">
                  Find Gunsmiths
                </Link>
              </li>
              <li>
                <Link href="/add-business" className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors text-sm">
                  Add Your Business
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors text-sm">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bebas text-xl text-gunsmith-gold mb-4">SERVICES</h3>
            <ul className="space-y-2 text-sm text-gunsmith-text-secondary">
              <li>Repairs & Maintenance</li>
              <li>Custom Work</li>
              <li>Restoration</li>
              <li>Cerakoting</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bebas text-xl text-gunsmith-gold mb-4">CONTACT</h3>
            <p className="text-gunsmith-text-secondary text-sm">
              Questions about listings?<br />
              <a href="mailto:support@gunsmithlocal.com" className="text-gunsmith-gold hover:text-gunsmith-goldenrod">
                support@gunsmithlocal.com
              </a>
            </p>
          </div>
        </div>

        <div className="border-t border-gunsmith-border mt-8 pt-8 text-center">
          <p className="text-gunsmith-text-secondary text-sm">
            © {new Date().getFullYear()} GunsmithLocal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
