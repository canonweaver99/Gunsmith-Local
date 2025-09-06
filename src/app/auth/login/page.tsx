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
