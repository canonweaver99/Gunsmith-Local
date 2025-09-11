'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ImageUpload from '@/components/ImageUpload'
import BusinessHoursEditor from '@/components/BusinessHoursEditor'
import { supabase, Listing } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { 
  uploadFile, 
  uploadMultipleFiles, 
  deleteFile,
  STORAGE_BUCKETS, 
  STORAGE_PATHS 
} from '@/lib/storage'
import { Loader2, Check, ArrowLeft, Trash2, AlertCircle } from 'lucide-react'
import { GUNSMITH_SPECIALTIES } from '@/lib/gunsmith-specialties'

interface PageProps {
  params: { id: string }
}

export default function EditListingPage({ params }: PageProps) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    phone: '',
    website: '',
    street_address: '',
    street_address_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'USA',
    category: '',
    description: '',
    short_description: '',
    year_established: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
  })

  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Image state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [logoPreview, setLogoPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  // Track existing images for deletion
  const [existingLogo, setExistingLogo] = useState<string | null>(null)
  const [existingCover, setExistingCover] = useState<string | null>(null)
  const [existingGallery, setExistingGallery] = useState<string[]>([])

  // Business hours state
  const [businessHours, setBusinessHours] = useState<any>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    } else if (!authLoading && user) {
      fetchListing()
    }
  }, [params.id, user, authLoading, router])

  async function fetchListing() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (!data) {
        notFound()
      }

      // Check if user is the owner
      if (data.owner_id !== user?.id) {
        router.push('/dashboard')
        return
      }

      setListing(data)
      
      // Populate form with existing data
      setFormData({
        business_name: data.business_name || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        street_address: data.street_address || '',
        street_address_2: data.street_address_2 || '',
        city: data.city || '',
        state_province: data.state_province || '',
        postal_code: data.postal_code || '',
        country: data.country || 'USA',
        category: data.category || '',
        description: data.description || '',
        short_description: data.short_description || '',
        year_established: data.year_established?.toString() || '',
        facebook_url: data.facebook_url || '',
        twitter_url: data.twitter_url || '',
        instagram_url: data.instagram_url || '',
        linkedin_url: data.linkedin_url || '',
        youtube_url: data.youtube_url || '',
      })

      setSelectedServices(Array.isArray(data.tags) ? data.tags : [])

      // Set existing images
      if (data.logo_url) {
        setLogoPreview(data.logo_url)
        setExistingLogo(data.logo_url)
      }
      if (data.cover_image_url) {
        setCoverPreview(data.cover_image_url)
        setExistingCover(data.cover_image_url)
      }
      if (data.image_gallery && data.image_gallery.length > 0) {
        setGalleryPreviews(data.image_gallery)
        setExistingGallery(data.image_gallery)
      }

      // Set business hours
      if (data.business_hours) {
        setBusinessHours(data.business_hours)
      }

    } catch (err: any) {
      console.error('Error fetching listing:', err)
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Handle image uploads and deletions
      let logoUrl = existingLogo
      let coverUrl = existingCover
      let galleryUrls = [...existingGallery]

      // Handle logo
      if (logoFile) {
        // Upload new logo
        const { url, error } = await uploadFile(logoFile, STORAGE_BUCKETS.LISTINGS, STORAGE_PATHS.LOGOS)
        if (error) throw new Error(`Logo upload failed: ${error}`)
        
        // Delete old logo if exists
        if (existingLogo) {
          await deleteFile(existingLogo, STORAGE_BUCKETS.LISTINGS)
        }
        
        logoUrl = url
      } else if (!logoPreview && existingLogo) {
        // Logo was removed
        await deleteFile(existingLogo, STORAGE_BUCKETS.LISTINGS)
        logoUrl = null
      }

      // Handle cover image
      if (coverFile) {
        // Upload new cover
        const { url, error } = await uploadFile(coverFile, STORAGE_BUCKETS.LISTINGS, STORAGE_PATHS.COVERS)
        if (error) throw new Error(`Cover image upload failed: ${error}`)
        
        // Delete old cover if exists
        if (existingCover) {
          await deleteFile(existingCover, STORAGE_BUCKETS.LISTINGS)
        }
        
        coverUrl = url
      } else if (!coverPreview && existingCover) {
        // Cover was removed
        await deleteFile(existingCover, STORAGE_BUCKETS.LISTINGS)
        coverUrl = null
      }

      // Handle gallery images
      if (galleryFiles.length > 0) {
        // Upload new gallery images
        const newUrls = await uploadMultipleFiles(galleryFiles, STORAGE_BUCKETS.LISTINGS, STORAGE_PATHS.GALLERY)
        
        // Combine with existing gallery images that weren't removed
        galleryUrls = galleryPreviews.filter(url => 
          existingGallery.includes(url) || newUrls.includes(url)
        )
      } else {
        // Keep only the images that are still in preview
        galleryUrls = galleryPreviews.filter(url => existingGallery.includes(url))
        
        // Delete removed images
        const removedImages = existingGallery.filter(url => !galleryPreviews.includes(url))
        for (const url of removedImages) {
          await deleteFile(url, STORAGE_BUCKETS.LISTINGS)
        }
      }

      // Prepare data for update
      const dataToUpdate = {
        ...formData,
        tags: selectedServices,
        year_established: formData.year_established ? parseInt(formData.year_established) : null,
        logo_url: logoUrl,
        cover_image_url: coverUrl,
        image_gallery: galleryUrls.length > 0 ? galleryUrls : null,
        business_hours: businessHours,
        updated_at: new Date().toISOString(),
      }

      // Remove empty strings
      Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key as keyof typeof dataToUpdate] === '') {
          dataToUpdate[key as keyof typeof dataToUpdate] = null
        }
      })

      const { error } = await supabase
        .from('listings')
        .update(dataToUpdate)
        .eq('id', params.id)

      if (error) throw error

      setSuccess(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err: any) {
      console.error('Error updating listing:', err)
      setError(err.message || 'Failed to update listing. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return
    }

    setDeleteLoading(true)
    setError('')

    try {
      // Delete all associated images
      if (existingLogo) await deleteFile(existingLogo, STORAGE_BUCKETS.LISTINGS)
      if (existingCover) await deleteFile(existingCover, STORAGE_BUCKETS.LISTINGS)
      for (const url of existingGallery) {
        await deleteFile(url, STORAGE_BUCKETS.LISTINGS)
      }

      // Delete the listing
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error deleting listing:', err)
      setError(err.message || 'Failed to delete listing')
      setDeleteLoading(false)
    }
  }

  const categories = [
    'Gunsmithing',
    'Firearms Sales',
    'Gun Range',
    'Training & Education',
    'Ammunition',
    'Gun Accessories',
    'Custom Work',
    'Restoration',
    'FFL Services'
  ]

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gunsmith-black">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 text-gunsmith-gold animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gunsmith-black">
      <Header />
      
      <main>
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Back Button */}
            <button
              onClick={() => router.push('/dashboard')}
              className="mb-6 text-gunsmith-text hover:text-gunsmith-gold transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <h1 className="font-bebas text-4xl text-gunsmith-gold mb-8">EDIT LISTING</h1>

            {/* Success Message */}
            {success && (
              <div className="card bg-green-500/20 border border-green-500 text-green-400 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  <p>Listing updated successfully! Redirecting...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="card bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">BASIC INFORMATION</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label">Business Name *</label>
                    <input
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="input w-full"
                      placeholder="https://www.example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">LOCATION</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="label">Street Address</label>
                    <input
                      type="text"
                      name="street_address"
                      value={formData.street_address}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Street Address 2</label>
                    <input
                      type="text"
                      name="street_address_2"
                      value={formData.street_address_2}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">State/Province</label>
                    <input
                      type="text"
                      name="state_province"
                      value={formData.state_province}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Postal Code</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">BUSINESS DETAILS</h2>
                <div className="space-y-6">
                  <div>
                    <label className="label">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input w-full"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Short Description</label>
                    <input
                      type="text"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleInputChange}
                      className="input w-full"
                      maxLength={160}
                      placeholder="Brief description for listing cards (160 chars max)"
                    />
                  </div>
                  <div>
                    <label className="label">Full Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="input w-full min-h-[150px]"
                      placeholder="Detailed description of your services, specialties, and expertise..."
                    />
                  </div>
                  <div>
                    <label className="label">Year Established</label>
                    <input
                      type="number"
                      name="year_established"
                      value={formData.year_established}
                      onChange={handleInputChange}
                      className="input w-full"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>

              {/* Services Provided */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-4">SERVICES PROVIDED</h2>
                <p className="text-sm text-gunsmith-text-secondary mb-4">Select all that apply. These appear on your profile and are filterable by customers.</p>
                <div className="space-y-6">
                  {GUNSMITH_SPECIALTIES.map(group => (
                    <div key={group.key}>
                      <h3 className="font-oswald text-gunsmith-text mb-2">{group.label}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {group.items.map(item => {
                          const checked = selectedServices.includes(item)
                          return (
                            <label key={item} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  setSelectedServices(prev => (
                                    prev.includes(item)
                                      ? prev.filter(s => s !== item)
                                      : [...prev, item]
                                  ))
                                }}
                                className="w-4 h-4 rounded border-gunsmith-border bg-gunsmith-accent text-gunsmith-gold focus:ring-gunsmith-gold"
                              />
                              <span className="text-sm text-gunsmith-text">{item}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">SOCIAL MEDIA</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label">Facebook URL</label>
                    <input
                      type="url"
                      name="facebook_url"
                      value={formData.facebook_url}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Instagram URL</label>
                    <input
                      type="url"
                      name="instagram_url"
                      value={formData.instagram_url}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">Twitter URL</label>
                    <input
                      type="url"
                      name="twitter_url"
                      value={formData.twitter_url}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="label">YouTube URL</label>
                    <input
                      type="url"
                      name="youtube_url"
                      value={formData.youtube_url}
                      onChange={handleInputChange}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="card">
                <BusinessHoursEditor
                  value={businessHours}
                  onChange={setBusinessHours}
                />
              </div>

              {/* Images */}
              <div className="card">
                <h2 className="font-bebas text-2xl text-gunsmith-gold mb-6">IMAGES</h2>
                <div className="space-y-8">
                  {/* Logo Upload */}
                  <ImageUpload
                    label="Business Logo"
                    value={logoPreview}
                    onChange={setLogoPreview}
                    onFilesSelected={(files) => setLogoFile(files[0])}
                    multiple={false}
                    maxSizeMB={2}
                  />

                  {/* Cover Image Upload */}
                  <ImageUpload
                    label="Cover Image"
                    value={coverPreview}
                    onChange={setCoverPreview}
                    onFilesSelected={(files) => setCoverFile(files[0])}
                    multiple={false}
                    maxSizeMB={5}
                  />

                  {/* Gallery Images Upload */}
                  <ImageUpload
                    label="Gallery Images"
                    value={galleryPreviews}
                    onChange={setGalleryPreviews}
                    onFilesSelected={setGalleryFiles}
                    multiple={true}
                    maxFiles={10}
                    maxSizeMB={5}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="btn-secondary text-gunsmith-error border-gunsmith-error hover:bg-gunsmith-error hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-5 w-5" />
                      Delete Listing
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-12 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
