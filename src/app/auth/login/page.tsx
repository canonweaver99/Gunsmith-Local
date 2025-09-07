'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { signIn } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import { supabase } from '@/lib/supabase'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const analytics = useAnalytics()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [rememberMe, setRememberMe] = useState(false)
  
  const redirect = searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    setMounted(true)
    if (user) {
      router.push(redirect)
    } else {
      // Check if user had previously selected "Remember Me"
      const rememberedEmail = localStorage.getItem('rememberedEmail')
      const wasRemembered = localStorage.getItem('rememberMe') === 'true'
      
      if (rememberedEmail && wasRemembered) {
        setFormData(prev => ({ ...prev, email: rememberedEmail }))
        setRememberMe(true)
      }
    }
  }, [user, router, redirect])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(formData.email, formData.password, rememberMe)
      
      // Track successful login
      analytics.trackUserLogin('email')
      
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        console.error('Error:', error)
        setError('Failed to sign in with Google')
      } else {
        // Track Google login attempt
        analytics.trackUserLogin('google')
      }
    } catch (err) {
      console.error('Error signing in with Google:', err)
      setError('Failed to sign in with Google')
    }
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-2 text-center">
              WELCOME BACK
            </h1>
            <p className="text-gunsmith-text-secondary text-center mb-8">
              Sign in to manage your listings
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input w-full pl-10"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input w-full pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gunsmith-border text-gunsmith-gold"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-gunsmith-text">
                    Remember me
                  </label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-gunsmith-gold hover:text-gunsmith-goldenrod">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gunsmith-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gunsmith-black text-gunsmith-text-secondary">OR</span>
                </div>
              </div>

              <button 
                onClick={signInWithGoogle}
                className="mt-6 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gunsmith-border rounded-md shadow-sm hover:bg-gunsmith-accent transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gunsmith-text-secondary">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-gunsmith-gold hover:text-gunsmith-goldenrod">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
