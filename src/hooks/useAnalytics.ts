'use client'

import { useCallback } from 'react'
import { trackEvent, trackBusinessEvents, trackEcommerce, trackPerformance, trackUserJourney } from '@/lib/analytics'

export function useAnalytics() {
  // Generic event tracking
  const track = useCallback((event: {
    action: string
    category: string
    label?: string
    value?: number
    custom_parameters?: Record<string, any>
  }) => {
    trackEvent(event)
  }, [])

  // Business-specific tracking
  const trackListingView = useCallback((listingId: string, businessName: string, category: string) => {
    trackBusinessEvents.listingView(listingId, businessName, category)
  }, [])

  const trackListingContact = useCallback((listingId: string, businessName: string, contactMethod: string) => {
    trackBusinessEvents.listingContact(listingId, businessName, contactMethod)
  }, [])

  const trackListingFavorite = useCallback((listingId: string, businessName: string, action: 'add' | 'remove') => {
    trackBusinessEvents.listingFavorite(listingId, businessName, action)
  }, [])

  const trackListingReview = useCallback((listingId: string, businessName: string, rating: number) => {
    trackBusinessEvents.listingReview(listingId, businessName, rating)
  }, [])

  const trackSearch = useCallback((searchTerm: string, resultsCount: number, filters: string[] = []) => {
    trackBusinessEvents.searchPerformed(searchTerm, resultsCount, filters)
  }, [])

  const trackFilter = useCallback((filterType: string, filterValue: string) => {
    trackBusinessEvents.filterApplied(filterType, filterValue)
  }, [])

  const trackBusinessClaim = useCallback((listingId: string, businessName: string) => {
    trackBusinessEvents.businessClaimed(listingId, businessName)
  }, [])

  const trackBusinessAdd = useCallback((businessName: string, category: string, location: string) => {
    trackBusinessEvents.businessAdded(businessName, category, location)
  }, [])

  const trackUserRegistration = useCallback((method: 'email' | 'google' | 'facebook') => {
    trackBusinessEvents.userRegistration(method)
  }, [])

  const trackUserLogin = useCallback((method: 'email' | 'google' | 'facebook') => {
    trackBusinessEvents.userLogin(method)
  }, [])

  const trackMapView = useCallback((viewType: 'list' | 'map') => {
    trackBusinessEvents.mapView(viewType)
  }, [])

  const trackMapMarkerClick = useCallback((listingId: string, businessName: string) => {
    trackBusinessEvents.mapMarkerClick(listingId, businessName)
  }, [])

  const trackNavigation = useCallback((destination: string, source: string) => {
    trackBusinessEvents.navigationClick(destination, source)
  }, [])

  const trackError = useCallback((errorType: string, errorMessage: string, page: string) => {
    trackBusinessEvents.errorOccurred(errorType, errorMessage, page)
  }, [])

  // E-commerce tracking
  const trackEcommerceView = useCallback((listing: {
    id: string
    business_name: string
    category: string
    city: string
    state: string
    is_featured: boolean
    is_verified: boolean
  }) => {
    trackEcommerce.viewItem(listing)
  }, [])

  const trackEcommerceContact = useCallback((listing: {
    id: string
    business_name: string
    category: string
  }) => {
    trackEcommerce.contactFormSubmit(listing)
  }, [])

  // Performance tracking
  const trackPageLoad = useCallback((page: string, loadTime: number) => {
    trackPerformance.pageLoad(page, loadTime)
  }, [])

  const trackApiCall = useCallback((endpoint: string, duration: number, status: 'success' | 'error') => {
    trackPerformance.apiCall(endpoint, duration, status)
  }, [])

  // User journey tracking
  const trackSearchStart = useCallback((searchTerm?: string) => {
    trackUserJourney.startSearch(searchTerm)
  }, [])

  const trackSearchComplete = useCallback((searchTerm: string, resultsFound: number, actionTaken: string) => {
    trackUserJourney.completeSearch(searchTerm, resultsFound, actionTaken)
  }, [])

  const trackSearchAbandon = useCallback((searchTerm: string, step: string) => {
    trackUserJourney.abandonSearch(searchTerm, step)
  }, [])

  return {
    // Generic tracking
    track,
    
    // Business-specific tracking
    trackListingView,
    trackListingContact,
    trackListingFavorite,
    trackListingReview,
    trackSearch,
    trackFilter,
    trackBusinessClaim,
    trackBusinessAdd,
    trackUserRegistration,
    trackUserLogin,
    trackMapView,
    trackMapMarkerClick,
    trackNavigation,
    trackError,
    
    // E-commerce tracking
    trackEcommerceView,
    trackEcommerceContact,
    
    // Performance tracking
    trackPageLoad,
    trackApiCall,
    
    // User journey tracking
    trackSearchStart,
    trackSearchComplete,
    trackSearchAbandon,
  }
}
