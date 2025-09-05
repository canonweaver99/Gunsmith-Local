'use client'

import { useState, useEffect } from 'react'
import { supabase, Review } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { notificationService } from '@/lib/notifications'
import { Star, Loader2, AlertCircle, User } from 'lucide-react'

interface ReviewsProps {
  listingId: string
  listingName: string
}

export default function Reviews({ listingId, listingName }: ReviewsProps) {
  const { user } = useAuth()
  const analytics = useAnalytics()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [userHasReviewed, setUserHasReviewed] = useState(false)
  
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
  })

  useEffect(() => {
    fetchReviews()
  }, [listingId])

  async function fetchReviews() {
    try {
      // Fetch reviews with user profiles
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name,
            website
          )
        `)
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })

      if (reviewsError) throw reviewsError

      // Transform the data to match our Review interface
      const transformedReviews = reviewsData?.map(review => ({
        ...review,
        user: review.profiles
      })) || []

      setReviews(transformedReviews)

      // Check if current user has already reviewed
      if (user) {
        const userReview = transformedReviews.find(r => r.user_id === user.id)
        setUserHasReviewed(!!userReview)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setError('')

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          listing_id: listingId,
          user_id: user.id,
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        }])

      if (error) throw error

      // Send email notification
      try {
        await notificationService.sendReviewNotification({
          listingId,
          reviewerName: user?.user_metadata?.full_name || 'Anonymous',
          rating: formData.rating,
          reviewTitle: formData.title,
          reviewComment: formData.comment,
        })
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
        // Don't fail the review submission if email fails
      }

                    // Track review submission
              analytics.trackListingReview(listingId, listingName, formData.rating)
              
              // Reset form and refresh reviews
              setFormData({ rating: 5, title: '', comment: '' })
              setShowForm(false)
              fetchReviews()
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return (
    <div className="space-y-6">
      {/* Reviews Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bebas text-2xl text-gunsmith-gold">REVIEWS</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(averageRating)
                        ? 'text-gunsmith-gold fill-gunsmith-gold'
                        : 'text-gunsmith-gold/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gunsmith-text-secondary">
                {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        {user && !userHasReviewed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-secondary text-sm"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && user && (
        <div className="card">
          <h3 className="font-bebas text-xl text-gunsmith-gold mb-4">WRITE YOUR REVIEW</h3>
          
          {error && (
            <div className="mb-4 bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-4 rounded flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="label">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= formData.rating
                          ? 'text-gunsmith-gold fill-gunsmith-gold'
                          : 'text-gunsmith-gold/30 hover:text-gunsmith-gold/50'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input w-full"
                placeholder="Summary of your experience"
                maxLength={100}
              />
            </div>

            <div>
              <label className="label">Review</label>
              <textarea
                required
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="input w-full min-h-[100px]"
                placeholder={`Share your experience with ${listingName}...`}
                maxLength={1000}
              />
              <p className="text-xs text-gunsmith-text-secondary mt-1">
                {formData.comment.length}/1000 characters
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setError('')
                  setFormData({ rating: 5, title: '', comment: '' })
                }}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 text-gunsmith-gold animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gunsmith-text-secondary">
            No reviews yet. {user ? 'Be the first to review!' : 'Sign in to leave a review.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gunsmith-accent flex items-center justify-center">
                      <User className="h-5 w-5 text-gunsmith-gold" />
                    </div>
                    <div>
                      <p className="font-oswald font-medium text-gunsmith-text">
                        {review.user?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gunsmith-text-secondary">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'text-gunsmith-gold fill-gunsmith-gold'
                          : 'text-gunsmith-gold/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <h4 className="font-oswald font-medium text-gunsmith-gold mb-2">
                {review.title}
              </h4>
              <p className="text-gunsmith-text-secondary">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Sign in prompt */}
      {!user && (
        <div className="card bg-gunsmith-gold/10 border-gunsmith-gold/30 text-center">
          <p className="text-gunsmith-text-secondary mb-4">
            Sign in to share your experience with {listingName}
          </p>
          <a href="/auth/login" className="btn-primary inline-block">
            Sign In to Review
          </a>
        </div>
      )}
    </div>
  )
}
