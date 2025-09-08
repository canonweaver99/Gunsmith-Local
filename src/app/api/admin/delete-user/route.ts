import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl) return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 })
    if (!serviceKey) return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })

    // Verify requester is authenticated and is admin
    const cookieStore = cookies()
    const routeClient = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user }, error: userError } = await routeClient.auth.getUser()
    if (userError) return NextResponse.json({ error: userError.message }, { status: 401 })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createClient(supabaseUrl, serviceKey)
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await adminClient.auth.admin.deleteUser(userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}


