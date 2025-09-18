import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/claims/magic-claim?token=... -> claims the listing for the logged-in user and redirects
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token') || ''
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', url.origin))
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !serviceRole || !anon) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 503 })
    }

    // We need two clients: one to read the session from cookie (anon) and one service for the write
    const supabaseAuth = createClient(supabaseUrl, anon, {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const supabaseSrv = createClient(supabaseUrl, serviceRole)

    // Identify user from session
    const { data: sessionData } = await supabaseAuth.auth.getUser()
    const userId = sessionData?.user?.id
    if (!userId) {
      // If not logged in, send to login, then bounce back to this URL
      const redirectTo = encodeURIComponent(url.toString())
      return NextResponse.redirect(new URL(`/auth/login?redirect=${redirectTo}`, url.origin))
    }

    // Validate token and fetch target listing
    const { data: link, error: linkErr } = await supabaseSrv
      .from('claim_magic_links')
      .select('id, listing_id, expires_at, used_at')
      .eq('token', token)
      .maybeSingle()

    if (linkErr || !link) {
      return NextResponse.redirect(new URL('/dashboard', url.origin))
    }
    if (link.used_at || (link.expires_at && new Date(link.expires_at) < new Date())) {
      return NextResponse.redirect(new URL(`/listings/${link.listing_id}`, url.origin))
    }

    // Claim the listing for the user (set owner_id) if not already owned
    const { data: listing } = await supabaseSrv
      .from('listings')
      .select('id, owner_id')
      .eq('id', link.listing_id)
      .maybeSingle()

    if (!listing) {
      return NextResponse.redirect(new URL('/dashboard', url.origin))
    }

    if (!listing.owner_id) {
      await supabaseSrv
        .from('listings')
        .update({ owner_id: userId, verification_status: 'pending' })
        .eq('id', link.listing_id)
    }

    // Mark token as used
    await supabaseSrv
      .from('claim_magic_links')
      .update({ used_at: new Date().toISOString() })
      .eq('id', link.id)

    // Redirect to Get Featured page, preselect listing
    return NextResponse.redirect(new URL(`/get-featured?listingId=${link.listing_id}`, url.origin))
  } catch (e) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
}


