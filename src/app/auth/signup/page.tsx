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
      await signUp(formData.email, formData.password, formData.fullName)
      
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
