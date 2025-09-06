export { supabase, checkSupabaseConnection, withRetry } from './supabase-client'

// Type definitions for your database
export interface Listing {
  id: string
  business_name: string
  slug: string
  description?: string
  short_description?: string
  email?: string
  phone?: string
  website?: string
  ffl_license_number?: string
  street_address?: string
  street_address_2?: string
  city?: string
  state_province?: string
  postal_code?: string
  country?: string
  latitude?: number
  longitude?: number
  category?: string
  subcategory?: string
  tags?: string[]
  business_hours?: Record<string, any>
  year_established?: number
  facebook_url?: string
  twitter_url?: string
  instagram_url?: string
  linkedin_url?: string
  youtube_url?: string
  logo_url?: string
  cover_image_url?: string
  image_gallery?: string[]
  status?: string
  is_verified?: boolean
  verification_status?: 'pending' | 'verified' | 'rejected'
  verified_at?: string
  verified_by?: string
  is_featured?: boolean
  is_featured_in_state?: string
  featured_until?: string
  additional_locations?: any[]
  owner_id?: string
  view_count?: number
  created_at: string
  updated_at: string
  published_at?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
}

export interface Review {
  id: string
  listing_id: string
  user_id: string
  rating: number
  title: string
  comment: string
  created_at: string
  updated_at: string
  // Joined data
  user?: {
    email: string
    full_name: string
    avatar_url?: string
  }
}

export interface ContactMessage {
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
  updated_at: string
}

export interface Favorite {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  // Joined data
  listing?: Listing
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  website?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface NotificationSettings {
  id: string
  user_id: string
  email_contact_messages: boolean
  email_reviews: boolean
  email_weekly_digest: boolean
  email_marketing: boolean
  created_at: string
  updated_at: string
}

export interface FeaturedListing {
  id: string
  listing_id: string
  state_code: string
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'cancelled'
  payment_amount: number
  stripe_subscription_id?: string
  created_at: string
  updated_at: string
  listing?: Listing
}

export interface FeaturedPayment {
  id: string
  featured_listing_id: string
  amount: number
  payment_date: string
  stripe_payment_intent_id?: string
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
  created_at: string
}

export interface FeaturedWaitlist {
  id: string
  listing_id: string
  state_code: string
  requested_at: string
  notified_at?: string
  status: 'waiting' | 'notified' | 'converted' | 'cancelled'
}

export interface Database {
  public: {
    Tables: {
      listings: {
        Row: Listing
        Insert: Omit<Listing, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Listing, 'id' | 'created_at' | 'updated_at'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'user'>
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at' | 'user'>>
      }
      contact_messages: {
        Row: ContactMessage
        Insert: Omit<ContactMessage, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ContactMessage, 'id' | 'created_at' | 'updated_at'>>
      }
      favorites: {
        Row: Favorite
        Insert: Omit<Favorite, 'id' | 'created_at' | 'listing'>
        Update: Partial<Omit<Favorite, 'id' | 'created_at' | 'listing'>>
      }
      notification_settings: {
        Row: NotificationSettings
        Insert: Omit<NotificationSettings, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<NotificationSettings, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
