'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { supabase } from '@/lib/supabase'
import { notificationService } from '@/lib/notifications'
import { Loader2, Mail, Phone, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'

interface ContactFormProps {
  listingId: string
  listingName: string
  businessEmail?: string
  businessPhone?: string
}

export default function ContactForm({ listingId, listingName, businessEmail, businessPhone }: ContactFormProps) {
  const { user } = useAuth()
  const analytics = useAnalytics()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    message: '',
    contactMethod: 'email' as 'email' | 'phone' | 'either',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      // Create contact message record
      const { error: messageError } = await supabase
        .from('contact_messages')
        .insert([{
          listing_id: listingId,
          sender_name: formData.name,
          sender_email: formData.email,
          sender_phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
          contact_method: formData.contactMethod,
          status: 'unread',
          created_at: new Date().toISOString(),
        }])

      if (messageError) throw messageError

      // Send email notification
      try {
        await notificationService.sendContactMessageNotification({
          listingId,
          senderName: formData.name,
          senderEmail: formData.email,
          senderPhone: formData.phone || undefined,
          subject: formData.subject,
          message: formData.message,
          contactMethod: formData.contactMethod,
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
        // Don't fail the form submission if email fails
      }

                    setSuccess(true)
              
              // Track contact form submission
              analytics.trackListingContact(listingId, listingName, formData.contactMethod)
              analytics.trackEcommerceContact({
                id: listingId,
                business_name: listingName,
                category: 'Unknown', // Could be passed as prop if needed
              })
              
              // Reset form
              setFormData({
                name: user?.user_metadata?.full_name || '',
                email: user?.email || '',
                phone: '',
                subject: '',
                message: '',
                contactMethod: 'email',
              })

              // Hide success message after 5 seconds
              setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="card bg-green-500/20 border-green-500/30">
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle className="h-6 w-6" />
          <div>
            <h3 className="font-bebas text-lg">MESSAGE SENT!</h3>
            <p className="text-sm">
              Your message has been sent to {listingName}. They'll get back to you soon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-bebas text-2xl text-gunsmith-gold mb-4">CONTACT {listingName.toUpperCase()}</h3>
      
      {error && (
        <div className="mb-4 bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Method Selection */}
        <div>
          <label className="label">How would you like to be contacted?</label>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contactMethod"
                value="email"
                checked={formData.contactMethod === 'email'}
                onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value as 'email' })}
                className="text-gunsmith-gold"
              />
              <Mail className="h-4 w-4" />
              <span className="text-sm">Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contactMethod"
                value="phone"
                checked={formData.contactMethod === 'phone'}
                onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value as 'phone' })}
                className="text-gunsmith-gold"
              />
              <Phone className="h-4 w-4" />
              <span className="text-sm">Phone</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contactMethod"
                value="either"
                checked={formData.contactMethod === 'either'}
                onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value as 'either' })}
                className="text-gunsmith-gold"
              />
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Either</span>
            </label>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="label">Your Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input w-full"
            placeholder="John Smith"
          />
        </div>

        {/* Email */}
        <div>
          <label className="label">Email Address *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input w-full"
            placeholder="your@email.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="label">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input w-full"
            placeholder="(555) 123-4567"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="label">Subject *</label>
          <select
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="input w-full"
          >
            <option value="">Select a subject</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Repair Service">Repair Service</option>
            <option value="Custom Work">Custom Work</option>
            <option value="Restoration">Restoration</option>
            <option value="Cerakoting">Cerakoting</option>
            <option value="NFA/Class 3">NFA/Class 3</option>
            <option value="Competition Work">Competition Work</option>
            <option value="Hunting & Sporting">Hunting & Sporting</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="label">Message *</label>
          <textarea
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="input w-full min-h-[120px]"
            placeholder={`Tell ${listingName} about your needs...`}
            maxLength={1000}
          />
          <p className="text-xs text-gunsmith-text-secondary mt-1">
            {formData.message.length}/1000 characters
          </p>
        </div>

        {/* Business Contact Info */}
        {(businessEmail || businessPhone) && (
          <div className="bg-gunsmith-accent/20 p-4 rounded">
            <h4 className="font-oswald font-medium text-gunsmith-gold mb-2">Direct Contact</h4>
            <div className="space-y-1 text-sm text-gunsmith-text-secondary">
              {businessEmail && (
                <p>
                  <Mail className="h-4 w-4 inline mr-2" />
                  <a href={`mailto:${businessEmail}`} className="text-gunsmith-gold hover:text-gunsmith-goldenrod">
                    {businessEmail}
                  </a>
                </p>
              )}
              {businessPhone && (
                <p>
                  <Phone className="h-4 w-4 inline mr-2" />
                  <a href={`tel:${businessPhone}`} className="text-gunsmith-gold hover:text-gunsmith-goldenrod">
                    {businessPhone}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Sending Message...
            </>
          ) : (
            <>
              <Mail className="h-5 w-5" />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  )
}
