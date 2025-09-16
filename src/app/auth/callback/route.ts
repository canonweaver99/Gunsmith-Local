import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // Use service role to exchange code for session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    try {
      const { data } = await supabase.auth.exchangeCodeForSession(code)
      
      // Check if this is a new user (first time signup via Google)
      if (data?.user && data?.user?.email) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.user.email)
          .single()

        // If no existing profile, this is a new signup
        if (!existingProfile) {
          // Create profile
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          // Notify admin of new Google signup
          try {
            await fetch(`${requestUrl.origin}/api/email/admin-signup-notification`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userEmail: data.user.email,
                userName: data.user.user_metadata?.full_name || 'Google User',
                signupMethod: 'google'
              })
            })
          } catch (adminEmailError) {
            console.error('Failed to send admin notification:', adminEmailError)
          }
        }
      }
    } catch (error) {
      console.error('Error exchanging code for session:', error)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
