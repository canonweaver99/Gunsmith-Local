'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Loader2, Mail, Phone, MessageSquare, Clock, CheckCircle, X } from 'lucide-react'

interface ContactMessage {
  id: string
  listing_id: string
  sender_name: string
  sender_email: string
  sender_phone?: string
  subject: string
  message: string
  contact_method: 'email' | 'phone' | 'either'
  status: 'unread' | 'read' | 'replied'
  created_at: string
  listing: {
    business_name: string
  }
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    } else if (user) {
      fetchMessages()
    }
  }, [user, authLoading, router])

  async function fetchMessages() {
    try {
      setLoading(true)
      
      // First get user's listings
      const { data: session } = await supabase.auth.getSession()
      console.log('Session before query (messages):', session)

      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('owner_id', user!.id)

      if (listingsError) {
        console.error('Listings query error (messages):', listingsError)
        throw listingsError
      }

      if (!listings || listings.length === 0) {
        setMessages([])
        return
      }

      // Get messages for user's listings
      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select(`
          *,
          listing:listing_id (
            business_name
          )
        `)
        .in('listing_id', listings.map(l => l.id))
        .order('created_at', { ascending: false })

      if (messagesError) throw messagesError

      setMessages(messagesData || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(messageId: string) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId)

      if (error) throw error

      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ))
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'read' })
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  async function markAsReplied(messageId: string) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'replied' })
        .eq('id', messageId)

      if (error) throw error

      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'replied' } : msg
      ))
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: 'replied' })
      }
    } catch (error) {
      console.error('Error marking message as replied:', error)
    }
  }

  const unreadCount = messages.filter(msg => msg.status === 'unread').length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Page Header */}
        <section className="bg-gunsmith-accent/20 py-12 px-4">
          <div className="container mx-auto">
            <h1 className="font-bebas text-5xl text-gunsmith-gold mb-2">
              MESSAGES
            </h1>
            <p className="text-gunsmith-text-secondary">
              {unreadCount > 0 && `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`}
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {messages.length === 0 ? (
              <div className="card text-center py-20">
                <MessageSquare className="h-16 w-16 text-gunsmith-gold/30 mx-auto mb-4" />
                <h3 className="font-bebas text-2xl text-gunsmith-gold mb-2">
                  NO MESSAGES YET
                </h3>
                <p className="text-gunsmith-text-secondary">
                  Contact messages from your listings will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Messages List */}
                <div className="lg:col-span-1">
                  <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">
                    ALL MESSAGES ({messages.length})
                  </h2>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => {
                          setSelectedMessage(message)
                          if (message.status === 'unread') {
                            markAsRead(message.id)
                          }
                        }}
                        className={`card cursor-pointer transition-all duration-200 ${
                          selectedMessage?.id === message.id
                            ? 'border-gunsmith-gold bg-gunsmith-gold/10'
                            : 'hover:border-gunsmith-gold/50'
                        } ${
                          message.status === 'unread'
                            ? 'border-l-4 border-l-gunsmith-gold'
                            : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-oswald font-medium text-gunsmith-text truncate">
                            {message.sender_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {message.status === 'unread' && (
                              <div className="w-2 h-2 bg-gunsmith-gold rounded-full"></div>
                            )}
                            <span className="text-xs text-gunsmith-text-secondary">
                              {new Date(message.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gunsmith-gold font-medium mb-1">
                          {message.subject}
                        </p>
                        <p className="text-sm text-gunsmith-text-secondary line-clamp-2">
                          {message.message}
                        </p>
                        <p className="text-xs text-gunsmith-text-secondary mt-2">
                          {message.listing.business_name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-2">
                  {selectedMessage ? (
                    <div className="card">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="font-bebas text-2xl text-gunsmith-gold">
                            {selectedMessage.subject}
                          </h2>
                          <p className="text-gunsmith-text-secondary">
                            From {selectedMessage.sender_name} • {selectedMessage.listing.business_name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {selectedMessage.status === 'read' && (
                            <button
                              onClick={() => markAsReplied(selectedMessage.id)}
                              className="btn-secondary text-sm"
                            >
                              Mark as Replied
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedMessage(null)}
                            className="btn-ghost text-sm"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-oswald font-medium text-gunsmith-gold mb-2">Contact Information</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gunsmith-gold" />
                              <a 
                                href={`mailto:${selectedMessage.sender_email}`}
                                className="text-gunsmith-text-secondary hover:text-gunsmith-gold"
                              >
                                {selectedMessage.sender_email}
                              </a>
                            </div>
                            {selectedMessage.sender_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gunsmith-gold" />
                                <a 
                                  href={`tel:${selectedMessage.sender_phone}`}
                                  className="text-gunsmith-text-secondary hover:text-gunsmith-gold"
                                >
                                  {selectedMessage.sender_phone}
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-gunsmith-gold" />
                              <span className="text-gunsmith-text-secondary">
                                Prefers: {selectedMessage.contact_method}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-oswald font-medium text-gunsmith-gold mb-2">Message</h3>
                          <div className="bg-gunsmith-accent/20 p-4 rounded">
                            <p className="text-gunsmith-text-secondary whitespace-pre-wrap">
                              {selectedMessage.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={`mailto:${selectedMessage.sender_email}?subject=Re: ${selectedMessage.subject}`}
                            className="btn-primary flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            Reply via Email
                          </a>
                          {selectedMessage.sender_phone && (
                            <a
                              href={`tel:${selectedMessage.sender_phone}`}
                              className="btn-secondary flex items-center gap-2"
                            >
                              <Phone className="h-4 w-4" />
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card text-center py-20">
                      <MessageSquare className="h-16 w-16 text-gunsmith-gold/30 mx-auto mb-4" />
                      <h3 className="font-bebas text-xl text-gunsmith-gold mb-2">
                        SELECT A MESSAGE
                      </h3>
                      <p className="text-gunsmith-text-secondary">
                        Choose a message from the list to view details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
