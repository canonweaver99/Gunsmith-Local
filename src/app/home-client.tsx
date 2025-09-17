'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GunsmithWizard from '@/components/GunsmithWizard'
import { MapPin, Shield, Wrench, Star, CheckCircle, Award, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function HomePageClient() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-gunsmith-black">
      <Header />
      
      
      <main className="flex-grow">
        {/* Hero Section with Premium Background */}
        <section className="relative overflow-hidden">
          {/* Subtle background with noise texture */}
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle at center, rgba(18, 19, 23, 0.3) 0%, transparent 70%)'
            }} />
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' seed='5' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
            }} />
          </div>
          
          <div className="relative z-10 py-24 px-4">
            <div className="container mx-auto">
              {/* Authority Badge */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gunsmith-surface-2 border border-white/5 rounded-full px-6 py-2">
                  <Award className="h-5 w-5 text-gunsmith-gold" />
                  <span className="text-gunsmith-gold font-montserrat font-semibold text-sm tracking-wider">
                    TRUSTED BY 2,300+ GUN OWNERS NATIONWIDE
                  </span>
                </div>
              </div>
              
              <div className="text-center mb-16 max-w-5xl mx-auto">
                <h1 className="font-montserrat font-black text-5xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-gunsmith-gold to-gunsmith-gold/80 mb-6 leading-none tracking-tighter">
                  FIND THE PERFECT<br/>GUNSMITH
                </h1>
                <p className="font-inter text-xl md:text-2xl text-gunsmith-text-secondary max-w-3xl mx-auto leading-relaxed">
                  Nation's #1 verified gunsmith directory. Every professional is reviewed, vetted, and ranked so you know exactly who you're working with.
                </p>
              </div>
              
              {/* Gunsmith Wizard - Prominent placement */}
              <div className="mt-12 max-w-4xl mx-auto">
                <GunsmithWizard />
              </div>
              
              {/* Trust Signals */}
              <div className="text-center mt-12">
                <div className="flex flex-wrap justify-center gap-8 items-center">
                  <div className="flex items-center gap-2 text-gunsmith-text-secondary">
                    <CheckCircle className="h-5 w-5 text-gunsmith-gold" />
                    <span className="font-inter">FFL Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-gunsmith-text-secondary">
                    <Star className="h-5 w-5 text-gunsmith-gold fill-gunsmith-gold" />
                    <span className="font-inter">4.9 Average Rating</span>
                  </div>
                  <div className="flex items-center gap-2 text-gunsmith-text-secondary">
                    <Clock className="h-5 w-5 text-gunsmith-gold" />
                    <span className="font-inter">Same Day Response</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Premium Cards */}
        <section className="relative py-20 px-4 bg-gunsmith-gunmetal">
          <div className="container mx-auto">
            <div className="text-center mb-20">
              <h2 className="font-montserrat font-black text-4xl md:text-5xl text-gunsmith-gold mb-4 tracking-tight">
                WHY GUNSMITHLOCAL?
              </h2>
              <p className="text-lg text-gunsmith-text-secondary max-w-2xl mx-auto leading-relaxed">
                In a fragmented market, we're building the first truly national gunsmith directory
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
              <div className="group relative">
                <div className="card text-center h-full transform transition-all duration-150 group-hover:translate-y-[-2px]">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gunsmith-surface-3 rounded-full mb-6 ring-1 ring-white/5">
                    <MapPin className="h-10 w-10 text-gunsmith-gold" />
                  </div>
                  <h3 className="font-montserrat font-bold text-2xl text-gunsmith-gold mb-3">LOCAL EXPERTS</h3>
                  <p className="text-gunsmith-text-secondary leading-relaxed">
                    Pre-screened professionals in your area. Real addresses, real businesses, real expertise.
                  </p>
                </div>
              </div>
              <div className="group relative">
                <div className="card text-center h-full transform transition-all duration-150 group-hover:translate-y-[-2px]">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gunsmith-surface-3 rounded-full mb-6 ring-1 ring-white/5">
                    <Shield className="h-10 w-10 text-gunsmith-gold" />
                  </div>
                  <h3 className="font-montserrat font-bold text-2xl text-gunsmith-gold mb-3">FFL VERIFIED</h3>
                  <p className="text-gunsmith-text-secondary leading-relaxed">
                    Every gunsmith verified through Federal Firearms License. No amateurs, no shortcuts.
                  </p>
                </div>
              </div>
              <div className="group relative">
                <div className="card text-center h-full transform transition-all duration-150 group-hover:translate-y-[-2px]">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gunsmith-surface-3 rounded-full mb-6 ring-1 ring-white/5">
                    <Wrench className="h-10 w-10 text-gunsmith-gold" />
                  </div>
                  <h3 className="font-montserrat font-bold text-2xl text-gunsmith-gold mb-3">FULL SERVICE</h3>
                  <p className="text-gunsmith-text-secondary leading-relaxed">
                    From basic repairs to custom builds. Find exactly the expertise you need.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium CTA Section */}
        <section className="relative py-20 px-4 overflow-hidden bg-gunsmith-surface-1">
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23F8D23C' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <div className="relative z-10 container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-montserrat font-black text-4xl md:text-5xl text-gunsmith-gold mb-6 tracking-tight">
                READY TO GET STARTED?
              </h2>
              <p className="text-xl md:text-2xl text-gunsmith-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of satisfied gun owners who've found their perfect gunsmith match
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                <Link href="/listings" className="btn-primary btn-recoil text-lg px-10 py-4">
                  Find a Gunsmith
                  <span className="block text-sm font-normal opacity-80">Browse 500+ Professionals</span>
                </Link>
                <Link href="/business-portal" className="btn-secondary text-lg px-10 py-4">
                  For Gunsmiths
                  <span className="block text-sm font-normal opacity-80">List Your Business</span>
                </Link>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 text-sm text-gunsmith-text-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gunsmith-gold" />
                  <span>Free to Browse</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gunsmith-gold" />
                  <span>No Account Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gunsmith-gold" />
                  <span>Instant Results</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto">
            {/* Press Mentions - Subtle, no glow */}
            <div className="text-center mb-16">
              <p className="text-gunsmith-text-muted mb-6 font-montserrat uppercase tracking-widest text-xs">
                As Featured In
              </p>
              <div className="flex flex-wrap justify-center gap-12 items-center opacity-40">
                <div className="text-xl font-montserrat font-medium text-gunsmith-text-secondary">Gun Digest</div>
                <div className="text-xl font-montserrat font-medium text-gunsmith-text-secondary">Shooting Times</div>
                <div className="text-xl font-montserrat font-medium text-gunsmith-text-secondary">Firearms News</div>
                <div className="text-xl font-montserrat font-medium text-gunsmith-text-secondary">American Rifleman</div>
              </div>
            </div>
            
            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
              <div className="card featured-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gunsmith-gold fill-gunsmith-gold" />
                  ))}
                </div>
                <p className="text-gunsmith-text mb-6 italic">
                  "Found a master gunsmith for my 1911 build. The vetting process gave me complete confidence. Outstanding platform."
                </p>
                <div>
                  <p className="font-montserrat font-semibold text-gunsmith-gold">Michael R.</p>
                  <p className="text-sm text-gunsmith-text-muted">Competition Shooter, Texas</p>
                </div>
              </div>
              <div className="card featured-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gunsmith-gold fill-gunsmith-gold" />
                  ))}
                </div>
                <p className="text-gunsmith-text mb-6 italic">
                  "As a gunsmith, GunsmithLocal brings me qualified customers. The featured listing pays for itself every month."
                </p>
                <div>
                  <p className="font-montserrat font-semibold text-gunsmith-gold">James T.</p>
                  <p className="text-sm text-gunsmith-text-muted">FFL Dealer, Arizona</p>
                </div>
              </div>
              <div className="card featured-card">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gunsmith-gold fill-gunsmith-gold" />
                  ))}
                </div>
                <p className="text-gunsmith-text mb-6 italic">
                  "Finally, a professional directory that takes verification seriously. Every listing I've used has been legitimate."
                </p>
                <div>
                  <p className="font-montserrat font-semibold text-gunsmith-gold">Sarah K.</p>
                  <p className="text-sm text-gunsmith-text-muted">Hunter, Montana</p>
                </div>
              </div>
            </div>
            
            {/* Realistic Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center max-w-5xl mx-auto">
              <div className="group">
                <div className="font-montserrat font-black text-5xl text-gunsmith-gold mb-2 tabular-nums">
                  523
                </div>
                <div className="text-gunsmith-text-secondary font-inter">Verified Shops</div>
              </div>
              <div className="group">
                <div className="font-montserrat font-black text-5xl text-gunsmith-gold mb-2 tabular-nums">
                  2,347
                </div>
                <div className="text-gunsmith-text-secondary font-inter">Daily Users</div>
              </div>
              <div className="group">
                <div className="font-montserrat font-black text-5xl text-gunsmith-gold mb-2 tabular-nums">
                  4.9
                </div>
                <div className="text-gunsmith-text-secondary font-inter">Avg. Rating</div>
              </div>
              <div className="group">
                <div className="font-montserrat font-black text-5xl text-gunsmith-gold mb-2 tabular-nums">
                  92%
                </div>
                <div className="text-gunsmith-text-secondary font-inter">Match Rate</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
