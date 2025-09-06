import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Page Header */}
        <section className="bg-gunsmith-accent/20 py-16 px-4">
          <div className="container mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold rounded-full mb-4">
              <Shield className="h-8 w-8 text-gunsmith-black" />
            </div>
            <h1 className="font-bebas text-5xl text-gunsmith-gold mb-4">
              PRIVACY POLICY
            </h1>
            <p className="text-gunsmith-text-secondary">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8 text-gunsmith-text">
                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">1. INFORMATION WE COLLECT</h2>
                  <p className="mb-4">
                    At GunsmithLocal, we collect information you provide directly to us, such as when you create an account, 
                    list a business, submit a review, or contact us for support.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account information (name, email, password)</li>
                    <li>Business information (name, address, phone, services, hours)</li>
                    <li>Communications between users and businesses</li>
                    <li>Reviews and ratings</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">2. HOW WE USE YOUR INFORMATION</h2>
                  <p className="mb-4">We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices, updates, and support messages</li>
                    <li>Respond to your comments, questions, and requests</li>
                    <li>Monitor and analyze trends, usage, and activities</li>
                    <li>Detect, investigate, and prevent fraudulent transactions</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">3. INFORMATION SHARING</h2>
                  <p className="mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties. 
                    We may share your information in the following situations:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>With your consent or at your direction</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights, privacy, safety, or property</li>
                    <li>With service providers who assist in our operations</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">4. DATA SECURITY</h2>
                  <p>
                    We implement appropriate technical and organizational measures to protect your personal information 
                    against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, 
                    no method of transmission over the Internet or electronic storage is 100% secure.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">5. YOUR RIGHTS</h2>
                  <p className="mb-4">You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Object to processing of your data</li>
                    <li>Request portability of your data</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">6. COOKIES</h2>
                  <p>
                    We use cookies and similar tracking technologies to track activity on our website and hold certain 
                    information. You can instruct your browser to refuse all cookies or to indicate when a cookie is 
                    being sent.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">7. CHILDREN'S PRIVACY</h2>
                  <p>
                    Our services are not directed to individuals under 18. We do not knowingly collect personal 
                    information from children under 18. If we become aware that a child under 18 has provided us 
                    with personal information, we will take steps to delete such information.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">8. CHANGES TO THIS POLICY</h2>
                  <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                    the new Privacy Policy on this page and updating the "Last updated" date.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">9. CONTACT US</h2>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <p className="mt-4">
                    <strong>Email:</strong> privacy@gunsmithlocal.com<br />
                    <strong>Address:</strong> GunsmithLocal, LLC<br />
                    United States
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
