import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Page Header */}
        <section className="bg-gunsmith-accent/20 py-16 px-4">
          <div className="container mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold rounded-full mb-4">
              <FileText className="h-8 w-8 text-gunsmith-black" />
            </div>
            <h1 className="font-bebas text-5xl text-gunsmith-gold mb-4">
              TERMS OF SERVICE
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
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">1. ACCEPTANCE OF TERMS</h2>
                  <p>
                    By accessing and using GunsmithLocal ("the Service"), you accept and agree to be bound by the terms 
                    and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">2. USE LICENSE</h2>
                  <p className="mb-4">
                    Permission is granted to temporarily access the materials on GunsmithLocal for personal, 
                    non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
                    and under this license you may not:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on GunsmithLocal</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">3. USER ACCOUNTS</h2>
                  <p className="mb-4">
                    When you create an account with us, you must provide information that is accurate, complete, 
                    and current at all times. You are responsible for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintaining the confidentiality of your account and password</li>
                    <li>Restricting access to your computer and account</li>
                    <li>All activities that occur under your account</li>
                    <li>Ensuring your email address is current and valid</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">4. BUSINESS LISTINGS</h2>
                  <p className="mb-4">
                    If you list a business on GunsmithLocal, you represent and warrant that:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You have the authority to list the business</li>
                    <li>All information provided is accurate and truthful</li>
                    <li>Your business complies with all applicable laws and regulations</li>
                    <li>You will maintain current and accurate business information</li>
                    <li>You will respond to customer inquiries in a timely manner</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">5. PROHIBITED USES</h2>
                  <p className="mb-4">You may not use our Service:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                    <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                    <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                    <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                    <li>To submit false or misleading information</li>
                    <li>To upload or transmit viruses or any other type of malicious code</li>
                  </ul>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">6. REVIEWS AND CONTENT</h2>
                  <p>
                    Users may post reviews, comments, and other content as long as the content is not illegal, obscene, 
                    threatening, defamatory, invasive of privacy, infringing of intellectual property rights, or otherwise 
                    injurious to third parties. We reserve the right to remove any content at our sole discretion.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">7. DISCLAIMER</h2>
                  <p>
                    The materials on GunsmithLocal are provided on an 'as is' basis. GunsmithLocal makes no warranties, 
                    expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
                    implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
                    of intellectual property or other violation of rights.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">8. LIMITATIONS</h2>
                  <p>
                    In no event shall GunsmithLocal or its suppliers be liable for any damages (including, without limitation, 
                    damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                    to use the materials on GunsmithLocal, even if GunsmithLocal or an authorized representative has been 
                    notified orally or in writing of the possibility of such damage.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">9. INDEMNIFICATION</h2>
                  <p>
                    You agree to defend, indemnify, and hold harmless GunsmithLocal, its officers, directors, employees, 
                    agents, and affiliates, from and against any claims, actions, or demands, including without limitation 
                    reasonable legal and accounting fees, arising from your use of the Service or your breach of these Terms.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">10. TERMINATION</h2>
                  <p>
                    We may terminate or suspend your account and bar access to the Service immediately, without prior notice 
                    or liability, under our sole discretion, for any reason whatsoever and without limitation, including but 
                    not limited to a breach of the Terms.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">11. GOVERNING LAW</h2>
                  <p>
                    These Terms shall be governed and construed in accordance with the laws of the United States, 
                    without regard to its conflict of law provisions. Our failure to enforce any right or provision 
                    of these Terms will not be considered a waiver of those rights.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">12. CHANGES TO TERMS</h2>
                  <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                    If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                  </p>
                </div>

                <div>
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">13. CONTACT INFORMATION</h2>
                  <p>
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <p className="mt-4">
                    <strong>Email:</strong> legal@gunsmithlocal.com<br />
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
