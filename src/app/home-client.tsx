'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { MapPin, Shield, Wrench, Star, Search } from 'lucide-react'
import { useState } from 'react'

export default function HomePageClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gunsmith-black py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="font-bebas text-5xl md:text-7xl text-gunsmith-gold mb-4 tracking-wider">
              FIND TRUSTED GUNSMITHS NEAR YOU
            </h1>
            <p className="font-oswald text-xl text-gunsmith-text-secondary mb-8 max-w-2xl mx-auto">
              Connect with professional gunsmiths for repairs, customization, and expert firearms services
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by location, service, or gunsmith name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 bg-gunsmith-card border border-gunsmith-border rounded-lg text-gunsmith-text placeholder-gunsmith-text-secondary focus:outline-none focus:border-gunsmith-gold transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gunsmith-gold hover:text-gunsmith-goldenrod transition-colors"
                >
                  <Search className="h-6 w-6" />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gunsmith-accent/20 py-16 px-4">
          <div className="container mx-auto">
            <h2 className="font-bebas text-4xl text-center text-gunsmith-gold mb-12">
              WHY CHOOSE GUNSMITHLOCAL?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">LOCAL EXPERTS</h3>
                <p className="text-gunsmith-text-secondary">
                  Find qualified gunsmiths in your area with verified credentials and reviews
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">VERIFIED PROFESSIONALS</h3>
                <p className="text-gunsmith-text-secondary">
                  All listed gunsmiths are verified for credentials and professional standards
                </p>
              </div>
              <div className="text-center">
                <Wrench className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">COMPREHENSIVE SERVICES</h3>
                <p className="text-gunsmith-text-secondary">
                  From repairs to custom builds, find specialists for all your firearm needs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gunsmith-black py-16 px-4 border-t border-gunsmith-border">
          <div className="container mx-auto text-center">
            <h2 className="font-bebas text-4xl text-gunsmith-gold mb-4">
              READY TO FIND YOUR GUNSMITH?
            </h2>
            <p className="text-gunsmith-text-secondary mb-8 max-w-xl mx-auto">
              Browse our directory of professional gunsmiths or add your business to reach more customers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/listings" className="btn-primary">
                Find a Gunsmith
              </Link>
              <Link href="/add-business" className="btn-secondary">
                Add Your Business
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gunsmith-accent/10 py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="font-bebas text-5xl text-gunsmith-gold">500+</div>
                <div className="text-gunsmith-text-secondary">Verified Gunsmiths</div>
              </div>
              <div>
                <div className="font-bebas text-5xl text-gunsmith-gold">50</div>
                <div className="text-gunsmith-text-secondary">States Covered</div>
              </div>
              <div>
                <div className="flex justify-center items-center gap-1 mb-2">
                  <Star className="h-8 w-8 text-gunsmith-gold fill-gunsmith-gold" />
                  <span className="font-bebas text-5xl text-gunsmith-gold">4.8</span>
                </div>
                <div className="text-gunsmith-text-secondary">Average Rating</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
