'use client'

import { Suspense } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface ClientWrapperProps {
  children: React.ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      {children}
    </Suspense>
  )
}
