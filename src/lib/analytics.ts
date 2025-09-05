'use client'

// Google Analytics 4 Configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'

// Custom Event Types
export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

// Page View Tracking
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
      page_title: title,
    })
  }
}

// Custom Event Tracking
export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    })
  }
}

// Business-specific tracking events
export const trackBusinessEvents = {
  // Listing interactions
  listingView: (listingId: string, businessName: string, category: string) => {
    trackEvent({
      action: 'view_listing',
      category: 'engagement',
      label: businessName,
      custom_parameters: {
        listing_id: listingId,
        business_category: category,
      },
    })
  },

  listingContact: (listingId: string, businessName: string, contactMethod: string) => {
    trackEvent({
      action: 'contact_business',
      category: 'conversion',
      label: businessName,
      custom_parameters: {
        listing_id: listingId,
        contact_method: contactMethod,
      },
    })
  },

  listingFavorite: (listingId: string, businessName: string, action: 'add' | 'remove') => {
    trackEvent({
      action: action === 'add' ? 'favorite_listing' : 'unfavorite_listing',
      category: 'engagement',
      label: businessName,
      custom_parameters: {
        listing_id: listingId,
      },
    })
  },

  listingReview: (listingId: string, businessName: string, rating: number) => {
    trackEvent({
      action: 'submit_review',
      category: 'conversion',
      label: businessName,
      value: rating,
      custom_parameters: {
        listing_id: listingId,
        review_rating: rating,
      },
    })
  },

  // Search and filtering
  searchPerformed: (searchTerm: string, resultsCount: number, filters: string[]) => {
    trackEvent({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
      value: resultsCount,
      custom_parameters: {
        search_term: searchTerm,
        results_count: resultsCount,
        filters_applied: filters,
      },
    })
  },

  filterApplied: (filterType: string, filterValue: string) => {
    trackEvent({
      action: 'apply_filter',
      category: 'engagement',
      label: filterValue,
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue,
      },
    })
  },

  // Business registration
  businessClaimed: (listingId: string, businessName: string) => {
    trackEvent({
      action: 'claim_business',
      category: 'conversion',
      label: businessName,
      custom_parameters: {
        listing_id: listingId,
      },
    })
  },

  businessAdded: (businessName: string, category: string, location: string) => {
    trackEvent({
      action: 'add_business',
      category: 'conversion',
      label: businessName,
      custom_parameters: {
        business_category: category,
        business_location: location,
      },
    })
  },

  // User engagement
  userRegistration: (method: 'email' | 'google' | 'facebook') => {
    trackEvent({
      action: 'sign_up',
      category: 'conversion',
      label: method,
      custom_parameters: {
        signup_method: method,
      },
    })
  },

  userLogin: (method: 'email' | 'google' | 'facebook') => {
    trackEvent({
      action: 'login',
      category: 'engagement',
      label: method,
      custom_parameters: {
        login_method: method,
      },
    })
  },

  // Map interactions
  mapView: (viewType: 'list' | 'map') => {
    trackEvent({
      action: 'view_map',
      category: 'engagement',
      label: viewType,
    })
  },

  mapMarkerClick: (listingId: string, businessName: string) => {
    trackEvent({
      action: 'click_map_marker',
      category: 'engagement',
      label: businessName,
      custom_parameters: {
        listing_id: listingId,
      },
    })
  },

  // Navigation
  navigationClick: (destination: string, source: string) => {
    trackEvent({
      action: 'navigate',
      category: 'engagement',
      label: destination,
      custom_parameters: {
        source_page: source,
        destination_page: destination,
      },
    })
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage: string, page: string) => {
    trackEvent({
      action: 'error',
      category: 'technical',
      label: errorType,
      custom_parameters: {
        error_message: errorMessage,
        page: page,
      },
    })
  },
}

// E-commerce tracking for business listings
export const trackEcommerce = {
  // Track business listing as a "product"
  viewItem: (listing: {
    id: string
    business_name: string
    category: string
    city: string
    state: string
    is_featured: boolean
    is_verified: boolean
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'USD',
        value: listing.is_featured ? 100 : 50, // Assign value based on features
        items: [{
          item_id: listing.id,
          item_name: listing.business_name,
          item_category: listing.category,
          item_brand: 'GunsmithLocal',
          item_variant: `${listing.city}, ${listing.state}`,
          custom_parameters: {
            is_featured: listing.is_featured,
            is_verified: listing.is_verified,
          },
        }],
      })
    }
  },

  // Track contact form submission as a "purchase" event
  contactFormSubmit: (listing: {
    id: string
    business_name: string
    category: string
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: `contact_${listing.id}_${Date.now()}`,
        value: 1, // Lead value
        currency: 'USD',
        items: [{
          item_id: `lead_${listing.id}`,
          item_name: `Lead for ${listing.business_name}`,
          item_category: listing.category,
          item_brand: 'GunsmithLocal',
          quantity: 1,
          price: 1,
        }],
      })
    }
  },
}

// Performance tracking
export const trackPerformance = {
  pageLoad: (page: string, loadTime: number) => {
    trackEvent({
      action: 'page_load_time',
      category: 'performance',
      label: page,
      value: Math.round(loadTime),
      custom_parameters: {
        page_name: page,
        load_time_ms: loadTime,
      },
    })
  },

  apiCall: (endpoint: string, duration: number, status: 'success' | 'error') => {
    trackEvent({
      action: 'api_call',
      category: 'performance',
      label: endpoint,
      value: Math.round(duration),
      custom_parameters: {
        endpoint: endpoint,
        duration_ms: duration,
        status: status,
      },
    })
  },
}

// User journey tracking
export const trackUserJourney = {
  startSearch: (searchTerm?: string) => {
    trackEvent({
      action: 'start_search_journey',
      category: 'user_journey',
      label: searchTerm || 'browse',
    })
  },

  completeSearch: (searchTerm: string, resultsFound: number, actionTaken: string) => {
    trackEvent({
      action: 'complete_search_journey',
      category: 'user_journey',
      label: searchTerm,
      value: resultsFound,
      custom_parameters: {
        results_found: resultsFound,
        final_action: actionTaken,
      },
    })
  },

  abandonSearch: (searchTerm: string, step: string) => {
    trackEvent({
      action: 'abandon_search_journey',
      category: 'user_journey',
      label: searchTerm,
      custom_parameters: {
        abandonment_step: step,
      },
    })
  },
}

// Initialize analytics
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined' && !window.gtag) {
    // Load Google Analytics script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', GA_TRACKING_ID, {
      page_path: window.location.pathname,
      anonymize_ip: true,
      allow_google_signals: true,
      allow_ad_personalization_signals: false,
    })
  }
}

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}
