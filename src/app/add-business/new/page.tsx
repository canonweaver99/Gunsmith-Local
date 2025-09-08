'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function AddBusinessNewPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gunsmith-accent/20 py-12 px-4">
          <div className="container mx-auto text-center">
            <h1 className="font-bebas text-5xl text-gunsmith-gold mb-2">ADD YOUR BUSINESS</h1>
            <p className="text-gunsmith-text-secondary">Manual entry form coming next. For now, continue to the dashboard to manage details.</p>
            <div className="mt-6">
              <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


