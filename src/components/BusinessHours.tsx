'use client'

import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { useMemo } from 'react'

interface BusinessHoursData {
  monday?: { open: string; close: string; closed?: boolean }
  tuesday?: { open: string; close: string; closed?: boolean }
  wednesday?: { open: string; close: string; closed?: boolean }
  thursday?: { open: string; close: string; closed?: boolean }
  friday?: { open: string; close: string; closed?: boolean }
  saturday?: { open: string; close: string; closed?: boolean }
  sunday?: { open: string; close: string; closed?: boolean }
}

interface BusinessHoursProps {
  hours: BusinessHoursData | null | undefined
  className?: string
  showCurrentStatus?: boolean
}

export default function BusinessHours({ 
  hours, 
  className = '',
  showCurrentStatus = true 
}: BusinessHoursProps) {
  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ] as const

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  // Get current day and time
  const now = new Date()
  const currentDay = days[now.getDay() === 0 ? 6 : now.getDay() - 1] // Adjust for Sunday = 0
  const currentTime = now.getHours() * 60 + now.getMinutes() // Minutes since midnight

  // Check if currently open
  const isCurrentlyOpen = useMemo(() => {
    if (!hours || !hours[currentDay]) return false
    
    const todayHours = hours[currentDay]
    if (todayHours.closed) return false
    
    const [openHour, openMin] = todayHours.open.split(':').map(Number)
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number)
    
    const openTime = openHour * 60 + openMin
    let closeTime = closeHour * 60 + closeMin
    
    // Handle cases where close time is after midnight
    if (closeTime < openTime) {
      closeTime += 24 * 60
    }
    
    return currentTime >= openTime && currentTime < closeTime
  }, [hours, currentDay, currentTime])

  // Format time for display
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`
  }

  if (!hours) {
    return (
      <div className={`text-gunsmith-text-secondary ${className}`}>
        <p className="text-sm">Business hours not available</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Current Status */}
      {showCurrentStatus && (
        <div className="mb-4 flex items-center gap-2">
          {isCurrentlyOpen ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-500 font-medium">Open Now</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-gunsmith-error" />
              <span className="text-gunsmith-error font-medium">Closed</span>
            </>
          )}
        </div>
      )}

      {/* Hours List */}
      <div className="space-y-2">
        {days.map((day) => {
          const dayHours = hours[day]
          const isToday = day === currentDay
          
          return (
            <div
              key={day}
              className={`flex justify-between items-center py-1.5 ${
                isToday ? 'bg-gunsmith-gold/10 -mx-2 px-2 rounded' : ''
              }`}
            >
              <span className={`font-oswald ${
                isToday ? 'font-medium text-gunsmith-gold' : 'text-gunsmith-text'
              }`}>
                {dayNames[day]}
              </span>
              
              {!dayHours || dayHours.closed ? (
                <span className="text-gunsmith-text-secondary text-sm">Closed</span>
              ) : (
                <span className={`text-sm ${
                  isToday ? 'text-gunsmith-gold' : 'text-gunsmith-text-secondary'
                }`}>
                  {formatTime(dayHours.open)} - {formatTime(dayHours.close)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Next Opening Time */}
      {!isCurrentlyOpen && showCurrentStatus && (
        <div className="mt-4 pt-4 border-t border-gunsmith-border">
          <p className="text-sm text-gunsmith-text-secondary">
            {getNextOpeningTime(hours, currentDay, days, dayNames)}
          </p>
        </div>
      )}
    </div>
  )
}

// Helper function to find next opening time
function getNextOpeningTime(
  hours: BusinessHoursData,
  currentDay: typeof days[number],
  days: readonly string[],
  dayNames: Record<string, string>
): string {
  const currentDayIndex = days.indexOf(currentDay)
  
  // Check remaining days of the week
  for (let i = 1; i <= 7; i++) {
    const checkDay = days[(currentDayIndex + i) % 7] as typeof days[number]
    const dayHours = hours[checkDay]
    
    if (dayHours && !dayHours.closed) {
      const [hour, minute] = dayHours.open.split(':').map(Number)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const time = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`
      
      if (i === 1) {
        return `Opens tomorrow at ${time}`
      } else {
        return `Opens ${dayNames[checkDay]} at ${time}`
      }
    }
  }
  
  return 'Opening hours not available'
}
