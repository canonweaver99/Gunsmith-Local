'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BusinessRegistrationForm from '@/components/BusinessRegistrationForm'

export default function AddBusinessNewPage() {
  return (
    <div className="min-h-screen bg-gunsmith-black flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-5xl flex-1 w-full">
        <h1 className="font-bebas text-5xl text-gunsmith-gold mb-2">ADD YOUR BUSINESS</h1>
        <p className="text-gunsmith-text-secondary mb-6">Quick, simple registration for FFL/gunsmith businesses.</p>
        <BusinessRegistrationForm />
      </main>
      <Footer />
    </div>
  )
}


