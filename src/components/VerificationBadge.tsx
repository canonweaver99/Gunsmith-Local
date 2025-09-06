'use client'

import { Shield, ShieldCheck, Clock, AlertCircle } from 'lucide-react'

interface VerificationBadgeProps {
  isVerified: boolean
  verificationStatus: 'pending' | 'verified' | 'rejected'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function VerificationBadge({ 
  isVerified, 
  verificationStatus, 
  showLabel = true,
  size = 'md',
  className = '' 
}: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  if (verificationStatus === 'verified' && isVerified) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="relative">
          <ShieldCheck className={`${sizeClasses[size]} text-green-500`} />
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
        </div>
        {showLabel && (
          <span className={`${textSizeClasses[size]} font-medium text-green-500`}>
            FFL Verified
          </span>
        )}
      </div>
    )
  }

  if (verificationStatus === 'pending') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Clock className={`${sizeClasses[size]} text-yellow-500`} />
        {showLabel && (
          <span className={`${textSizeClasses[size]} font-medium text-yellow-500`}>
            FFL Verification Pending
          </span>
        )}
      </div>
    )
  }

  if (verificationStatus === 'rejected') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <AlertCircle className={`${sizeClasses[size]} text-red-500`} />
        {showLabel && (
          <span className={`${textSizeClasses[size]} font-medium text-red-500`}>
            FFL Verification Failed
          </span>
        )}
      </div>
    )
  }

  // Default unverified state (no badge shown)
  return null
}
