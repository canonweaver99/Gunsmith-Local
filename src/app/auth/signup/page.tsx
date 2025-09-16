'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { signUp } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { notificationService } from '@/lib/notifications'
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const analytics = useAnalytics()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [checkingVerification, setCheckingVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })

  useEffect(() => {
    setMounted(true)
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // Check email verification status
  useEffect(() => {
    if (!success || !verificationEmail) return

    const checkVerification = async () => {
      setCheckingVerification(true)
      try {
        // Try to sign in with the credentials to check if email is verified
        const { data, error } = await supabase.auth.signInWithPassword({
          email: verificationEmail,
          password: formData.password
        })

        if (data?.user?.email_confirmed_at) {
          // Email is verified, redirect to login
          await supabase.auth.signOut() // Sign out since they should login properly
          router.push('/auth/login')
        }
      } catch (error) {
        // Ignore errors, just keep checking
      } finally {
        setCheckingVerification(false)
      }
    }

    // Check immediately
    checkVerification()

    // Then check every 3 seconds
    const interval = setInterval(checkVerification, 3000)

    return () => clearInterval(interval)
  }, [success, verificationEmail, formData.password, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const data = await signUp(formData.email, formData.password, formData.fullName)
      try {
        const newUserId = (data as any)?.user?.id
        if (newUserId) {
          await supabase.from('profiles').upsert({
            id: newUserId,
            email: formData.email,
            full_name: formData.fullName || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } catch (profileErr) {
        console.warn('Profiles upsert after signup failed:', profileErr)
      }
      
      // Send welcome email
      try {
        await notificationService.sendWelcomeNotification({
          userEmail: formData.email,
          userName: formData.fullName,
        })
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail signup if email fails
      }

      // Notify admin of new signup
      try {
        await fetch('/api/email/admin-signup-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: formData.email,
            userName: formData.fullName,
            signupMethod: 'email'
          })
        })
      } catch (adminEmailError) {
        console.error('Failed to send admin notification:', adminEmailError)
        // Don't fail signup if admin email fails
      }
      
      setSuccess(true)
      setVerificationEmail(formData.email)
      
      // Track successful registration
      analytics.trackUserRegistration('email')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
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
        setError('Failed to sign up with Google')
      } else {
        // Track Google signup attempt
        analytics.trackUserRegistration('google')
      }
    } catch (err) {
      console.error('Error signing up with Google:', err)
      setError('Failed to sign up with Google')
    }
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gunsmith-gold rounded-full mb-4">
              <Mail className="h-8 w-8 text-gunsmith-black" />
            </div>
            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-2">
              VERIFY YOUR EMAIL
            </h1>
            <p className="text-gunsmith-text-secondary mb-6">
              We've sent a verification email to <span className="text-gunsmith-gold font-medium">{verificationEmail}</span>
            </p>
            
            <div className="bg-gunsmith-card rounded-lg p-6 mb-6">
              <p className="text-gunsmith-text mb-4">
                Please check your inbox and click the verification link to activate your account.
              </p>
              
              {checkingVerification ? (
                <div className="flex items-center justify-center gap-2 text-gunsmith-gold">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Checking verification status...</span>
                </div>
              ) : (
                <p className="text-sm text-gunsmith-text-secondary">
                  This page will automatically redirect once your email is verified.
                </p>
              )}
            </div>
            
            <div className="text-sm text-gunsmith-text-secondary">
              <p>Didn't receive the email?</p>
              <p>Check your spam folder or contact support.</p>
            </div>
          </div>
        </main>
        <Footer />
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
              CREATE ACCOUNT
            </h1>
            <p className="text-gunsmith-text-secondary text-center mb-8">
              Join to manage your gunsmith business
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input w-full pl-10"
                    placeholder="John Smith"
                  />
                </div>
              </div>

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
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gunsmith-text-secondary mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gunsmith-gold/50" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="input w-full pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
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
              Already have an account?{' '}
              <Link href="/auth/login" className="text-gunsmith-gold hover:text-gunsmith-goldenrod">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
