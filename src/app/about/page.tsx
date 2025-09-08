import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Shield, Target, Users, Award } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gunsmith-accent/20 py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="font-bebas text-5xl md:text-7xl text-gunsmith-gold mb-4">
              ABOUT GUNSMITHLOCAL
            </h1>
            <p className="text-xl text-gunsmith-text-secondary max-w-3xl mx-auto">
              Connecting firearm owners with skilled gunsmiths across America since 2024
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="card">
              <h2 className="font-bebas text-4xl text-gunsmith-gold mb-6">OUR MISSION</h2>
              <p className="text-gunsmith-text-secondary text-lg leading-relaxed mb-6">
                GunsmithLocal was founded with a simple mission: to make it easy for gun owners to find 
                qualified, professional gunsmiths in their area. We understand that your firearms are 
                valuable investments that require proper care and maintenance from skilled professionals.
              </p>
              <p className="text-gunsmith-text-secondary text-lg leading-relaxed">
                Our directory connects responsible firearm owners with licensed gunsmiths who specialize 
                in everything from basic repairs and maintenance to custom builds and restorations. 
                Whether you're a hunter, competitive shooter, collector, or simply a firearm enthusiast, 
                GunsmithLocal helps you find the right expert for your needs.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4 bg-gunsmith-accent/20">
          <div className="container mx-auto">
            <h2 className="font-bebas text-4xl text-center text-gunsmith-gold mb-12">
              OUR VALUES
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card text-center">
                <Shield className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">SAFETY FIRST</h3>
                <p className="text-gunsmith-text-secondary">
                  We promote responsible firearm ownership and safe gunsmithing practices.
                </p>
              </div>
              <div className="card text-center">
                <Target className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">QUALITY SERVICE</h3>
                <p className="text-gunsmith-text-secondary">
                  We list only professional gunsmiths committed to quality workmanship.
                </p>
              </div>
              <div className="card text-center">
                <Users className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">COMMUNITY</h3>
                <p className="text-gunsmith-text-secondary">
                  Building connections between firearm enthusiasts and skilled professionals.
                </p>
              </div>
              <div className="card text-center">
                <Award className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">EXCELLENCE</h3>
                <p className="text-gunsmith-text-secondary">
                  Maintaining high standards for listings and user experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-bebas text-4xl text-center text-gunsmith-gold mb-12">
              HOW IT WORKS
            </h2>
            <div className="space-y-8">
              <div className="card">
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">FOR GUN OWNERS</h3>
                <ol className="list-decimal list-inside space-y-2 text-gunsmith-text-secondary">
                  <li>Search for gunsmiths in your area by location, services, or specialties</li>
                  <li>Browse detailed business profiles with contact information and services offered</li>
                  <li>Contact gunsmiths directly to discuss your needs and get quotes</li>
                  <li>Find the right professional for your specific firearm service requirements</li>
                </ol>
              </div>
              <div className="card">
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">FOR GUNSMITHS</h3>
                <ol className="list-decimal list-inside space-y-2 text-gunsmith-text-secondary">
                  <li>Submit your business information through our simple form</li>
                  <li>Create a comprehensive profile showcasing your services and expertise</li>
                  <li>Get discovered by customers searching for gunsmith services in your area</li>
                  <li>Grow your business by connecting with new clients</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gunsmith-accent/20">
          <div className="container mx-auto text-center">
            <h2 className="font-bebas text-4xl text-gunsmith-gold mb-4">
              JOIN THE GUNSMITHLOCAL COMMUNITY
            </h2>
            <p className="text-xl text-gunsmith-text-secondary mb-8 max-w-2xl mx-auto">
              Whether you're looking for a gunsmith or are one yourself, we're here to help make the connection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/listings" className="btn-primary">
                Find a Gunsmith
              </a>
              <a href="/business-portal" className="btn-secondary">
                Business Portal
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
