'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Wrench, Package, ChevronRight, ChevronLeft, Loader2, CheckCircle, Truck, Users, Target } from 'lucide-react'
import { GUNSMITH_SPECIALTIES } from '@/lib/gunsmith-specialties'

interface WizardData {
  location: string
  gunTypes: string[]
  customGunType: string
  services: string[]
  deliveryMethod: 'in-person' | 'shipping' | 'both'
}

const SERVICE_OPTIONS = GUNSMITH_SPECIALTIES.flatMap(g => g.items)

export default function GunsmithWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [wizardData, setWizardData] = useState<WizardData>({
    location: '',
    gunTypes: [],
    customGunType: '',
    services: [],
    deliveryMethod: 'both'
  })

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWizardData({ ...wizardData, location: e.target.value })
  }

  const toggleService = (service: string) => {
    const updated = wizardData.services.includes(service)
      ? wizardData.services.filter(s => s !== service)
      : [...wizardData.services, service]
    setWizardData({ ...wizardData, services: updated })
  }

  const toggleGunType = (gunType: string) => {
    const updated = wizardData.gunTypes.includes(gunType)
      ? wizardData.gunTypes.filter(type => type !== gunType)
      : [...wizardData.gunTypes, gunType]
    setWizardData({ ...wizardData, gunTypes: updated })
  }

  const handleDeliveryMethod = (method: 'in-person' | 'shipping' | 'both') => {
    setWizardData({ ...wizardData, deliveryMethod: method })
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return wizardData.location.trim() !== ''
      case 2:
        return wizardData.gunTypes.length > 0 && 
               (!wizardData.gunTypes.includes('other') || wizardData.customGunType.trim() !== '')
      case 3:
        return wizardData.services.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      searchGunsmiths()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const searchGunsmiths = async () => {
    setLoading(true)
    
    // Build URL params for the listings page
    const params = new URLSearchParams()
    
    if (wizardData.location) {
      params.append('location', wizardData.location)
    }
    
    if (wizardData.gunTypes.length > 0) {
      const nonOtherTypes = wizardData.gunTypes.filter(type => type !== 'other')
      if (nonOtherTypes.length > 0) {
        params.append('gunTypes', nonOtherTypes.join(','))
      }
    }
    
    if (wizardData.services.length > 0) {
      params.append('services', wizardData.services.join(','))
    }
    
    if (wizardData.deliveryMethod !== 'both') {
      params.append('delivery', wizardData.deliveryMethod)
    }
    
    // Add wizard flag to show special message
    params.append('fromWizard', 'true')
    
    // Navigate to listings page with filters
    router.push(`/listings?${params.toString()}`)
  }

  // Handle Enter key press for navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canProceed() && !loading) {
        handleNext()
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [step, wizardData, loading])


  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gunsmith-text-secondary">Step {step} of 4</span>
          <span className="text-sm text-gunsmith-text-secondary">
            {step === 1 && 'Location'}
            {step === 2 && 'Gun Type'}
            {step === 3 && 'Services Needed'}
            {step === 4 && 'Delivery Preference'}
          </span>
        </div>
        <div className="h-2 bg-gunsmith-accent rounded-full overflow-hidden">
          <div 
            className="h-full bg-gunsmith-gold transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="card">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
              <h3 className="font-bebas text-3xl text-gunsmith-gold mb-2">
                WHERE ARE YOU LOCATED?
              </h3>
              <p className="text-gunsmith-text-secondary">
                Enter your city or state to find gunsmiths near you
              </p>
            </div>
            
            <div>
              <input
                type="text"
                value={wizardData.location}
                onChange={handleLocationChange}
                placeholder="e.g., Denver, CO or Colorado"
                className="input w-full text-lg py-3"
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
              <h3 className="font-bebas text-3xl text-gunsmith-gold mb-2">
                WHAT TYPE OF FIREARM?
              </h3>
              <p className="text-gunsmith-text-secondary">
                Select all types that need work (you can choose multiple)
              </p>
            </div>
            
            <div className="space-y-4">
              {/* First 4 buttons in a 2x2 grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'rifle', label: 'Rifle' },
                  { id: 'pistol', label: 'Pistol' },
                  { id: 'shotgun', label: 'Shotgun' },
                  { id: 'sniper', label: 'Sniper' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleGunType(type.id)}
                    className={`wizard-button ${
                      wizardData.gunTypes.includes(type.id) ? 'selected' : ''
                    }`}
                  >
                    <span className="text-lg font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Other button centered */}
              <div className="flex justify-center">
                <button
                  onClick={() => toggleGunType('other')}
                  className={`wizard-button w-1/2 ${
                    wizardData.gunTypes.includes('other') ? 'selected' : ''
                  }`}
                >
                  <span className="text-lg font-medium">Other</span>
                </button>
              </div>
              
              {/* Text input for custom gun type */}
              {wizardData.gunTypes.includes('other') && (
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Please specify the type of firearm..."
                    value={wizardData.customGunType}
                    onChange={(e) => setWizardData({ ...wizardData, customGunType: e.target.value })}
                    className="input w-full text-lg py-3"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <Wrench className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
              <h3 className="font-bebas text-3xl text-gunsmith-gold mb-2">
                WHAT SERVICES DO YOU NEED?
              </h3>
              <p className="text-gunsmith-text-secondary">
                Select all that apply
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {SERVICE_OPTIONS.map((label) => (
                <button
                  key={label}
                  onClick={() => toggleService(label)}
                  className={`wizard-button ${
                    wizardData.services.includes(label) ? 'selected' : ''
                  } text-center`}
                >
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
              {/* Other option */}
              <button
                onClick={() => toggleService('Other')}
                className={`wizard-button col-span-2 ${
                  wizardData.services.includes('Other') ? 'selected' : ''
                } text-center`}
              >
                <span className="text-sm font-medium">Other</span>
              </button>
              {wizardData.services.includes('Other') && (
                <input
                  type="text"
                  placeholder="Describe what you need..."
                  className="input w-full col-span-2"
                  onChange={(e) => {
                    const text = e.target.value
                    // Store as a separate customGunType for now
                    setWizardData({ ...wizardData, customGunType: text })
                  }}
                />
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
              <h3 className="font-bebas text-3xl text-gunsmith-gold mb-2">
                HOW DO YOU PREFER TO WORK?
              </h3>
              <p className="text-gunsmith-text-secondary">
                Choose your preferred method
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleDeliveryMethod('in-person')}
                className={`wizard-button w-full ${
                  wizardData.deliveryMethod === 'in-person' ? 'selected' : ''
                }`}
              >
                <Users className="h-8 w-8 text-gunsmith-gold mx-auto mb-2" />
                <h4 className="font-oswald text-lg mb-1">In-Person Only</h4>
                <p className="text-sm text-gunsmith-text-secondary">
                  Visit the gunsmith's shop directly
                </p>
              </button>

              <button
                onClick={() => handleDeliveryMethod('shipping')}
                className={`wizard-button w-full ${
                  wizardData.deliveryMethod === 'shipping' ? 'selected' : ''
                }`}
              >
                <Truck className="h-8 w-8 text-gunsmith-gold mx-auto mb-2" />
                <h4 className="font-oswald text-lg mb-1">Shipping Only</h4>
                <p className="text-sm text-gunsmith-text-secondary">
                  Ship your firearm to the gunsmith
                </p>
              </button>

              <button
                onClick={() => handleDeliveryMethod('both')}
                className={`wizard-button w-full ${
                  wizardData.deliveryMethod === 'both' ? 'selected' : ''
                }`}
              >
                <CheckCircle className="h-8 w-8 text-gunsmith-gold mx-auto mb-2" />
                <h4 className="font-oswald text-lg mb-1">Either Works</h4>
                <p className="text-sm text-gunsmith-text-secondary">
                  Open to both options
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className={`btn-ghost flex items-center gap-2 ${
              step === 1 ? 'invisible' : ''
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : step === 4 ? (
              <>
                Find Gunsmiths
                <CheckCircle className="h-5 w-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
