import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { userId, requesterId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl) return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
    if (!serviceKey) return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })

    // Verify requester is admin. Prefer cookie user id if present in X-Requester-Id header or body.
    const effectiveRequesterId = requesterId || request.headers.get('x-requester-id') || null
    if (!effectiveRequesterId) {
      return NextResponse.json({ error: 'Requester not provided' }, { status: 401 })
    }

    const adminClient = createClient(supabaseUrl, serviceKey)
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', effectiveRequesterId)
      .maybeSingle()
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Clean up dependent records to avoid FK violations
    const cleanupSteps = [
      () => adminClient.from('favorites').delete().eq('user_id', userId),
      () => adminClient.from('reviews').delete().eq('user_id', userId),
      () => adminClient.from('notification_settings').delete().eq('user_id', userId),
      () => adminClient.from('featured_transactions').delete().eq('user_id', userId),
      () => adminClient.from('business_claims').delete().eq('claimer_id', userId),
      () => adminClient.from('listings').update({ owner_id: null }).eq('owner_id', userId),
      () => adminClient.from('profiles').delete().eq('id', userId),
    ]

    for (const step of cleanupSteps) {
      const { error: stepError } = await step()
      if (stepError) {
        return NextResponse.json({ error: `Cleanup failed: ${stepError.message}` }, { status: 500 })
      }
    }

    const { error } = await adminClient.auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: `Auth delete failed: ${error.message}` }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}


