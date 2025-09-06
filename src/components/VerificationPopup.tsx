'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, X } from 'lucide-react'

interface VerificationPopupProps {
  isOpen: boolean
  onClose: () => void
  businessName: string
}

export default function VerificationPopup({ isOpen, onClose, businessName }: VerificationPopupProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShow(true)
    }
  }, [isOpen])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      onClose()
    }, 300) // Wait for animation to complete
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          show ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-gunsmith-card border border-gunsmith-gold rounded-xl p-8 m-4 max-w-md w-full transform transition-all duration-300 ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="bg-gunsmith-gold/20 rounded-full p-4 inline-block">
              <Clock className="h-8 w-8 text-gunsmith-gold" />
            </div>
            <div className="absolute inset-0 bg-gunsmith-gold/10 rounded-full animate-ping" />
          </div>

          {/* Title */}
          <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">
            FFL VERIFICATION IN PROGRESS
          </h3>

          {/* Message */}
          <div className="space-y-3 mb-6">
            <p className="text-gunsmith-text">
              Thank you for submitting <span className="text-gunsmith-gold font-medium">{businessName}</span>!
            </p>
            <p className="text-gunsmith-text-secondary text-sm">
              Your business listing is now under review. Our team will verify your FFL license and you'll receive a verified badge once approved.
            </p>
          </div>

          {/* Features */}
          <div className="bg-gunsmith-black/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gunsmith-text">What happens next?</p>
                <ul className="text-xs text-gunsmith-text-secondary mt-1 space-y-1">
                  <li>• We'll verify your FFL license with ATF records</li>
                  <li>• Confirm your business location and credentials</li>
                  <li>• Add a verified FFL badge to your listing</li>
                  <li>• Boost your visibility and customer trust</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleClose}
            className="btn-primary w-full"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}
