import React from 'react'

interface LoadingSkeletonProps {
  className?: string
  lines?: number
  type?: 'text' | 'card' | 'header' | 'avatar' | 'button'
}

export default function LoadingSkeleton({ 
  className = '', 
  lines = 1, 
  type = 'text' 
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gunsmith-accent/50 rounded'
  
  const typeClasses = {
    text: 'h-4 w-full',
    card: 'h-64 w-full',
    header: 'h-10 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-32',
  }
  
  if (type === 'card') {
    return (
      <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
        <div className="p-4 space-y-3">
          <div className="h-40 bg-gunsmith-accent/30 rounded" />
          <div className="h-4 bg-gunsmith-accent/30 rounded w-3/4" />
          <div className="h-4 bg-gunsmith-accent/30 rounded w-1/2" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-gunsmith-accent/30 rounded w-20" />
            <div className="h-8 bg-gunsmith-accent/30 rounded w-24" />
          </div>
        </div>
      </div>
    )
  }
  
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${typeClasses[type]} ${className}`}
            style={{ width: `${Math.random() * 20 + 80}%` }}
          />
        ))}
      </div>
    )
  }
  
  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`} />
  )
}

export function ListingCardSkeleton() {
  return (
    <div className="card">
      <div className="animate-pulse">
        <div className="h-48 bg-gunsmith-accent/50 rounded-lg mb-4" />
        <div className="space-y-3">
          <div className="h-6 bg-gunsmith-accent/50 rounded w-3/4" />
          <div className="h-4 bg-gunsmith-accent/50 rounded w-1/2" />
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gunsmith-accent/50 rounded w-16" />
            <div className="h-4 bg-gunsmith-accent/50 rounded w-20" />
          </div>
          <div className="h-4 bg-gunsmith-accent/50 rounded w-full" />
          <div className="h-4 bg-gunsmith-accent/50 rounded w-5/6" />
        </div>
      </div>
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <header className="bg-gunsmith-header border-b border-gunsmith-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <LoadingSkeleton type="header" className="w-40" />
            <div className="hidden md:flex items-center gap-6">
              <LoadingSkeleton type="button" className="w-20" />
              <LoadingSkeleton type="button" className="w-20" />
              <LoadingSkeleton type="button" className="w-20" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LoadingSkeleton type="button" />
            <LoadingSkeleton type="avatar" />
          </div>
        </div>
      </div>
    </header>
  )
}
