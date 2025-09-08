import { supabase } from './supabase'

export interface UploadResult {
  url: string | null
  error: string | null
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket (e.g., 'listings/logos')
 * @returns The public URL of the uploaded file or an error
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      return { url: null, error: 'No file provided' }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return { url: null, error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (err: any) {
    console.error('Upload error:', err)
    return { url: null, error: err.message || 'Failed to upload file' }
  }
}

/**
 * Upload multiple files to Supabase Storage
 * @param files - Array of files to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket
 * @returns Array of public URLs for successfully uploaded files
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: string,
  path: string
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFile(file, bucket, path))
  const results = await Promise.all(uploadPromises)
  
  // Filter out failed uploads and return only successful URLs
  return results
    .filter(result => result.url !== null)
    .map(result => result.url as string)
}

/**
 * Delete a file from Supabase Storage
 * @param url - The public URL of the file to delete
 * @param bucket - The storage bucket name
 * @returns Success status
 */
export async function deleteFile(
  url: string,
  bucket: string
): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = url.split(`/storage/v1/object/public/${bucket}/`)
    if (urlParts.length !== 2) {
      console.error('Invalid file URL')
      return false
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Storage delete error:', error)
      return false
    }

    return true
  } catch (err: any) {
    console.error('Delete error:', err)
    return false
  }
}

/**
 * Validate image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in megabytes
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.',
    }
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size too large. Maximum size is ${maxSizeMB}MB.`,
    }
  }

  return { valid: true }
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  LISTINGS: 'listings',
  PROFILES: 'profiles',
  DOCUMENTS: 'documents',
} as const

// Storage paths
export const STORAGE_PATHS = {
  LOGOS: 'logos',
  COVERS: 'covers',
  GALLERY: 'gallery',
  AVATARS: 'avatars',
  VERIFICATION_DOCS: 'verification',
} as const
