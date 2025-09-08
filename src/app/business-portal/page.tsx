'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function BusinessPortalPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow bg-gunsmith-black">
        {/* Hero */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="font-bebas text-6xl text-gunsmith-gold mb-4">
              ARE YOU A GUNSMITH SHOP OWNER?
            </h1>
            <p className="text-gunsmith-text-secondary mb-8 max-w-2xl mx-auto">
              Claim or add your business to get verified, manage your profile, and reach more customers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/claim-business" prefetch={false}
                className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
              >
                YES — I OWN A GUNSMITH SHOP
              </Link>
              <Link
                href="/listings"
                className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
              >
                NO — I’M LOOKING FOR SERVICES
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="card">
                <p className="font-bebas text-xl text-gunsmith-gold">FFL VERIFICATION</p>
                <p className="text-gunsmith-text-secondary text-sm">We verify shop owners via their FFL to build customer trust.</p>
              </div>
              <div className="card">
                <p className="font-bebas text-xl text-gunsmith-gold">FEATURED PLACEMENT</p>
                <p className="text-gunsmith-text-secondary text-sm">Boost visibility in your state with featured listings.</p>
              </div>
              <div className="card">
                <p className="font-bebas text-xl text-gunsmith-gold">EASY MANAGEMENT</p>
                <p className="text-gunsmith-text-secondary text-sm">Update hours, services, and photos anytime from your dashboard.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


