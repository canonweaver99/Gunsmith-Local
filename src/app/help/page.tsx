import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { HelpCircle, Mail, Phone, MessageSquare, Book, FileQuestion } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gunsmith-black">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="h-16 w-16 text-gunsmith-gold mx-auto mb-4" />
              <h1 className="font-bebas text-5xl text-gunsmith-gold mb-4">HELP & SUPPORT</h1>
              <p className="text-gunsmith-text-secondary text-lg">
                We're here to help you get the most out of GunsmithLocal
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="card">
                <MessageSquare className="h-10 w-10 text-gunsmith-gold mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">CONTACT SUPPORT</h3>
                <p className="text-gunsmith-text-secondary mb-4">
                  Have a question or issue? Our support team is ready to help.
                </p>
                <a href="mailto:support@gunsmithlocal.com" className="btn-primary inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Support
                </a>
              </div>

              <div className="card">
                <Book className="h-10 w-10 text-gunsmith-gold mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">GETTING STARTED</h3>
                <p className="text-gunsmith-text-secondary mb-4">
                  New to GunsmithLocal? Learn how to make the most of our platform.
                </p>
                <ul className="space-y-2 text-gunsmith-text-secondary">
                  <li>• Create your business listing</li>
                  <li>• Find gunsmiths in your area</li>
                  <li>• Leave and manage reviews</li>
                  <li>• Use the gunsmith wizard</li>
                </ul>
              </div>
            </div>

            <div className="card mb-12">
              <FileQuestion className="h-10 w-10 text-gunsmith-gold mb-4" />
              <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">FREQUENTLY ASKED QUESTIONS</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-oswald text-lg text-gunsmith-gold mb-2">How do I add my gunsmith business?</h4>
                  <p className="text-gunsmith-text-secondary">
                    Click "Add Business" in the navigation menu and fill out the required information. 
                    You'll need to verify your email and provide your FFL license number for verification.
                  </p>
                </div>

                <div>
                  <h4 className="font-oswald text-lg text-gunsmith-gold mb-2">How does FFL verification work?</h4>
                  <p className="text-gunsmith-text-secondary">
                    When you add your business, provide your FFL license number. Our admin team will 
                    verify it and you'll receive a verified badge on your listing once approved.
                  </p>
                </div>

                <div>
                  <h4 className="font-oswald text-lg text-gunsmith-gold mb-2">Can I update my business information?</h4>
                  <p className="text-gunsmith-text-secondary">
                    Yes! Go to your dashboard or settings to update your business details, hours, 
                    services, and more at any time.
                  </p>
                </div>

                <div>
                  <h4 className="font-oswald text-lg text-gunsmith-gold mb-2">How do I find gunsmiths near me?</h4>
                  <p className="text-gunsmith-text-secondary">
                    Use the search bar on the listings page to search by location, or try our 
                    gunsmith wizard for a guided experience to find exactly what you need.
                  </p>
                </div>

                <div>
                  <h4 className="font-oswald text-lg text-gunsmith-gold mb-2">Is my information secure?</h4>
                  <p className="text-gunsmith-text-secondary">
                    Yes! We use industry-standard security measures to protect your data. 
                    See our privacy policy for more details.
                  </p>
                </div>
              </div>
            </div>

            <div className="card text-center">
              <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">STILL NEED HELP?</h3>
              <p className="text-gunsmith-text-secondary mb-6">
                Our support team is available Monday-Friday, 9AM-5PM CST
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:support@gunsmithlocal.com" className="btn-primary inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  support@gunsmithlocal.com
                </a>
                <a href="tel:1-800-GUNSMITH" className="btn-secondary inline-flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  1-800-GUNSMITH
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
