import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { claimId, action, adminId, listingId } = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    const adminClient = createClient(supabaseUrl, serviceKey)

    if (!claimId || !action || !adminId) {
      return NextResponse.json({ error: 'claimId, action, adminId are required' }, { status: 400 })
    }

    if (action === 'approve') {
      await adminClient
        .from('business_claims')
        .update({ status: 'approved', verified_by: adminId, verified_at: new Date().toISOString() })
        .eq('id', claimId)

      if (listingId) {
        const { data: claim } = await adminClient
          .from('business_claims')
          .select('claimer_id, claimer_email')
          .eq('id', claimId)
          .maybeSingle()
        if (claim?.claimer_id) {
          await adminClient
            .from('listings')
            .update({ owner_id: claim.claimer_id, updated_at: new Date().toISOString() })
            .eq('id', listingId)
        }
      }
    } else if (action === 'reject') {
      await adminClient
        .from('business_claims')
        .update({ status: 'rejected', verified_by: adminId, verified_at: new Date().toISOString() })
        .eq('id', claimId)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}
