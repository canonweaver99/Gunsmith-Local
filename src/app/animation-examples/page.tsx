'use client'

import CrosshairLoader from '@/components/CrosshairLoader'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AnimationExamples() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <main className="flex-grow py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-montserrat font-black text-5xl text-gunsmith-gold mb-12 text-center tracking-tight">
            Animation Examples
          </h1>
          
          {/* Crosshair Loader Examples */}
          <section className="mb-20">
            <h2 className="font-montserrat font-bold text-3xl text-gunsmith-gold mb-8">Crosshair Loader</h2>
            
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div className="card text-center">
                <p className="text-gunsmith-text-muted mb-4">Small</p>
                <div className="flex justify-center">
                  <CrosshairLoader size="sm" className="text-gunsmith-gold" />
                </div>
              </div>
              
              <div className="card text-center">
                <p className="text-gunsmith-text-muted mb-4">Medium</p>
                <div className="flex justify-center">
                  <CrosshairLoader size="md" className="text-gunsmith-gold" />
                </div>
              </div>
              
              <div className="card text-center">
                <p className="text-gunsmith-text-muted mb-4">Large</p>
                <div className="flex justify-center">
                  <CrosshairLoader size="lg" className="text-gunsmith-gold" />
                </div>
              </div>
            </div>
            
            <div className="card bg-gunsmith-surface-2">
              <p className="text-gunsmith-text-muted mb-4">Usage Example:</p>
              <pre className="bg-gunsmith-surface-3 p-4 rounded text-sm overflow-x-auto">
                <code className="text-gunsmith-text">{`import CrosshairLoader from '@/components/CrosshairLoader'

// Basic usage
<CrosshairLoader />

// With size and color
<CrosshairLoader size="lg" className="text-gunsmith-gold" />

// In a loading state
{isLoading ? (
  <CrosshairLoader size="md" />
) : (
  <Content />
)}`}</code>
              </pre>
            </div>
          </section>
          
          {/* Recoil Button Examples */}
          <section className="mb-20">
            <h2 className="font-montserrat font-bold text-3xl text-gunsmith-gold mb-8">Recoil Button</h2>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <button className="btn-primary btn-recoil">
                Primary Recoil
              </button>
              
              <button className="btn-secondary btn-recoil">
                Secondary Recoil
              </button>
              
              <button className="btn-ghost btn-recoil">
                Ghost Recoil
              </button>
            </div>
            
            <div className="card bg-gunsmith-surface-2">
              <p className="text-gunsmith-text-muted mb-4">Usage Example:</p>
              <pre className="bg-gunsmith-surface-3 p-4 rounded text-sm overflow-x-auto">
                <code className="text-gunsmith-text">{`// Add btn-recoil class to any button
<button className="btn-primary btn-recoil">
  Click Me
</button>

// Works with all button variants
<Link href="/path" className="btn-secondary btn-recoil">
  Navigate
</Link>`}</code>
              </pre>
            </div>
          </section>
          
          {/* Featured Card Examples */}
          <section className="mb-20">
            <h2 className="font-montserrat font-bold text-3xl text-gunsmith-gold mb-8">Gold Reflect Featured Card</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="card featured-card">
                <h3 className="font-montserrat font-bold text-xl text-gunsmith-gold mb-4">
                  Featured Listing
                </h3>
                <p className="text-gunsmith-text-secondary mb-4">
                  Hover over this card to see the gold shine sweep animation.
                </p>
                <div className="flex items-center gap-2 text-sm text-gunsmith-text-muted">
                  <span className="inline-block w-2 h-2 bg-gunsmith-gold rounded-full"></span>
                  Premium Placement
                </div>
              </div>
              
              <div className="card">
                <h3 className="font-montserrat font-bold text-xl text-gunsmith-text mb-4">
                  Regular Card
                </h3>
                <p className="text-gunsmith-text-secondary mb-4">
                  This is a regular card without the featured animation.
                </p>
                <div className="flex items-center gap-2 text-sm text-gunsmith-text-muted">
                  <span className="inline-block w-2 h-2 bg-gunsmith-text-muted rounded-full"></span>
                  Standard Listing
                </div>
              </div>
            </div>
            
            <div className="card bg-gunsmith-surface-2">
              <p className="text-gunsmith-text-muted mb-4">Usage Example:</p>
              <pre className="bg-gunsmith-surface-3 p-4 rounded text-sm overflow-x-auto">
                <code className="text-gunsmith-text">{`// Add featured-card class to any card element
<div className="card featured-card">
  <h3>Premium Listing</h3>
  <p>This card has the gold sweep on hover</p>
</div>

// Use with listing cards
<ListingCard 
  listing={featuredListing} 
  className="featured-card" 
/>`}</code>
              </pre>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
