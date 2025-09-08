import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'

interface Props {
  params: { id: string }
}

export default async function SubmissionStatusPage({ params }: Props) {
  const { data, error } = await supabase
    .from('listings')
    .select('business_name, verification_status, ffl_license_number')
    .eq('id', params.id)
    .maybeSingle()

  const status = data?.verification_status || 'pending'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gunsmith-black">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <h1 className="font-bebas text-4xl text-gunsmith-gold mb-4 text-center">SUBMISSION RECEIVED</n1>
          <div className="card">
            <p className="text-gunsmith-text mb-2">Business: <span className="text-gunsmith-gold">{data?.business_name || 'Your Business'}</span></p>
            <p className="text-gunsmith-text mb-2">FFL: <span className="text-gunsmith-gold">{data?.ffl_license_number || '—'}</span></p>
            <p className="text-gunsmith-text">Status: <span className="text-gunsmith-gold capitalize">{status}</span></p>
          </div>
          <p className="text-gunsmith-text-secondary mt-6 text-center">
            We will review your submission and notify you via email once verified.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}


