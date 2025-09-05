'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gunsmith-black p-4">
      <div className="max-w-md w-full bg-gunsmith-card rounded-lg p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-gunsmith-gold mx-auto mb-4" />
        <h1 className="font-bebas text-3xl text-gunsmith-gold mb-2">
          SOMETHING WENT WRONG
        </h1>
        <p className="text-gunsmith-text-secondary mb-4">
          We encountered an unexpected error. Please try again.
        </p>
        <details className="text-left bg-gunsmith-accent rounded p-4 mb-6">
          <summary className="cursor-pointer text-gunsmith-text hover:text-gunsmith-gold">
            Error Details
          </summary>
          <pre className="mt-2 text-xs overflow-auto text-gunsmith-text-secondary">
            {error.message}
          </pre>
        </details>
        <button
          onClick={reset}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
