'use client'

import { useState, useEffect } from 'react'
import { Clock, Copy, AlertCircle } from 'lucide-react'

interface BusinessHoursData {
  monday?: { open: string; close: string; closed?: boolean }
  tuesday?: { open: string; close: string; closed?: boolean }
  wednesday?: { open: string; close: string; closed?: boolean }
  thursday?: { open: string; close: string; closed?: boolean }
  friday?: { open: string; close: string; closed?: boolean }
  saturday?: { open: string; close: string; closed?: boolean }
  sunday?: { open: string; close: string; closed?: boolean }
}

interface BusinessHoursEditorProps {
  value: BusinessHoursData | null
  onChange: (hours: BusinessHoursData) => void
  className?: string
}

export default function BusinessHoursEditor({
  value,
  onChange,
  className = ''
}: BusinessHoursEditorProps) {
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

  // Initialize hours with default values
  const [hours, setHours] = useState<BusinessHoursData>(() => {
    if (value) return value
    
    // Default hours: 9 AM - 5 PM, closed Sunday
    const defaultHours: BusinessHoursData = {}
    days.forEach(day => {
      defaultHours[day] = {
        open: '09:00',
        close: '17:00',
        closed: day === 'sunday'
      }
    })
    return defaultHours
  })

  useEffect(() => {
    onChange(hours)
  }, [hours])

  const handleTimeChange = (
    day: typeof days[number],
    field: 'open' | 'close',
    value: string
  ) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleClosedToggle = (day: typeof days[number]) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day]!,
        closed: !prev[day]?.closed
      }
    }))
  }

  const copyHoursToAllDays = (sourceDay: typeof days[number]) => {
    const sourceHours = hours[sourceDay]
    if (!sourceHours) return

    const newHours = { ...hours }
    days.forEach(day => {
      if (day !== sourceDay) {
        newHours[day] = { ...sourceHours }
      }
    })
    setHours(newHours)
  }

  const copyWeekdayHours = () => {
    const mondayHours = hours.monday
    if (!mondayHours) return

    const newHours = { ...hours }
    const weekdays = ['tuesday', 'wednesday', 'thursday', 'friday'] as const
    weekdays.forEach(day => {
      newHours[day] = { ...mondayHours }
    })
    setHours(newHours)
  }

  const setAllClosed = () => {
    const newHours: BusinessHoursData = {}
    days.forEach(day => {
      newHours[day] = {
        open: '09:00',
        close: '17:00',
        closed: true
      }
    })
    setHours(newHours)
  }

  const setAllOpen = () => {
    const newHours: BusinessHoursData = {}
    days.forEach(day => {
      newHours[day] = {
        open: '09:00',
        close: '17:00',
        closed: false
      }
    })
    setHours(newHours)
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bebas text-xl text-gunsmith-gold">BUSINESS HOURS</h3>
        <Clock className="h-5 w-5 text-gunsmith-gold" />
      </div>

      {/* Quick Actions */}
      <div className="mb-6 p-3 bg-gunsmith-accent/20 rounded space-y-2">
        <p className="text-sm text-gunsmith-text-secondary mb-2">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyWeekdayHours}
            className="text-xs bg-gunsmith-accent text-gunsmith-text px-3 py-1 rounded hover:bg-gunsmith-gold hover:text-gunsmith-black transition-colors"
          >
            Copy Monday to Weekdays
          </button>
          <button
            type="button"
            onClick={setAllOpen}
            className="text-xs bg-gunsmith-accent text-gunsmith-text px-3 py-1 rounded hover:bg-gunsmith-gold hover:text-gunsmith-black transition-colors"
          >
            Set All Open
          </button>
          <button
            type="button"
            onClick={setAllClosed}
            className="text-xs bg-gunsmith-accent text-gunsmith-text px-3 py-1 rounded hover:bg-gunsmith-gold hover:text-gunsmith-black transition-colors"
          >
            Set All Closed
          </button>
        </div>
      </div>

      {/* Hours Grid */}
      <div className="space-y-4">
        {days.map((day) => {
          const dayHours = hours[day] || { open: '09:00', close: '17:00', closed: false }
          
          return (
            <div key={day} className="grid grid-cols-12 gap-2 items-center">
              {/* Day Name */}
              <div className="col-span-3">
                <label className="font-oswald text-gunsmith-text">
                  {dayNames[day]}
                </label>
              </div>

              {/* Closed Toggle */}
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dayHours.closed || false}
                    onChange={() => handleClosedToggle(day)}
                    className="w-4 h-4 rounded border-gunsmith-border bg-gunsmith-accent text-gunsmith-gold focus:ring-gunsmith-gold"
                  />
                  <span className="text-sm text-gunsmith-text-secondary">Closed</span>
                </label>
              </div>

              {/* Open Time */}
              <div className="col-span-3">
                <input
                  type="time"
                  value={dayHours.open}
                  onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                  disabled={dayHours.closed}
                  className="input w-full text-sm disabled:opacity-50"
                />
              </div>

              {/* To */}
              <div className="col-span-1 text-center">
                <span className="text-gunsmith-text-secondary">to</span>
              </div>

              {/* Close Time */}
              <div className="col-span-2">
                <input
                  type="time"
                  value={dayHours.close}
                  onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                  disabled={dayHours.closed}
                  className="input w-full text-sm disabled:opacity-50"
                />
              </div>

              {/* Copy Button */}
              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => copyHoursToAllDays(day)}
                  title="Copy to all days"
                  className="p-2 text-gunsmith-text-secondary hover:text-gunsmith-gold transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-gunsmith-accent/10 rounded flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-gunsmith-gold mt-0.5" />
        <p className="text-xs text-gunsmith-text-secondary">
          Set your regular business hours. These will be displayed on your listing and help customers know when you're open.
        </p>
      </div>
    </div>
  )
}
