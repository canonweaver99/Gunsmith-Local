'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Mail, Calendar, User, ExternalLink } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
  replied: boolean
}

export default function AdminMessagesPage() {
  const { isAdmin } = useAuth()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdmin) {
      fetchMessages()
    }
  }, [isAdmin])

  const fetchMessages = async () => {
    try {
      // For now, we'll create a placeholder since contact_messages table might not exist
      // You can update this when you create the contact form functionality
      setMessages([])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <MessageSquare className="h-16 w-16 text-gunsmith-gold mx-auto mb-4" />
        <h2 className="font-bebas text-2xl text-gunsmith-gold mb-2">ACCESS DENIED</h2>
        <p className="text-gunsmith-text-secondary">You don't have permission to view messages.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-bebas text-3xl text-gunsmith-gold mb-2">CONTACT MESSAGES</h1>
        <p className="text-gunsmith-text-secondary">
          Manage customer inquiries and contact form submissions
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16">
          <Mail className="h-16 w-16 text-gunsmith-text-secondary mx-auto mb-4" />
          <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">NO MESSAGES</h2>
          <p className="text-gunsmith-text-secondary">
            No contact form submissions yet. Messages will appear here when customers reach out.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gunsmith-gold" />
                    <span className="font-medium text-gunsmith-text">{message.name}</span>
                    <span className="text-gunsmith-text-secondary">({message.email})</span>
                  </div>
                  
                  <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">
                    {message.subject}
                  </h3>
                  
                  <p className="text-gunsmith-text-secondary mb-4">
                    {message.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gunsmith-text-secondary">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(message.created_at).toLocaleDateString()}
                    </div>
                    {message.replied && (
                      <span className="text-green-500 font-medium">Replied</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <Mail className="h-4 w-4" />
                    Reply
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
