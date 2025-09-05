'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { validateImageFile } from '@/lib/storage'

interface ImageUploadProps {
  value?: string | string[]
  onChange: (value: string | string[]) => void
  onFilesSelected?: (files: File[]) => void
  multiple?: boolean
  maxFiles?: number
  maxSizeMB?: number
  label?: string
  preview?: boolean
  className?: string
}

export default function ImageUpload({
  value,
  onChange,
  onFilesSelected,
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 5,
  label = 'Upload Image',
  preview = true,
  className = '',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    setError('')
    const fileArray = Array.from(files)
    
    // Validate file count
    if (multiple && fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate each file
    const validFiles: File[] = []
    for (const file of fileArray) {
      const validation = validateImageFile(file, maxSizeMB)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        return
      }
      validFiles.push(file)
    }

    // Handle file selection
    if (onFilesSelected) {
      onFilesSelected(validFiles)
    }

    // Preview handling
    if (preview) {
      const readers = validFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      })

      Promise.all(readers).then(results => {
        if (multiple) {
          const currentValues = Array.isArray(value) ? value : []
          onChange([...currentValues, ...results])
        } else {
          onChange(results[0])
        }
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleRemove = (index?: number) => {
    if (multiple && Array.isArray(value)) {
      const newValues = [...value]
      if (index !== undefined) {
        newValues.splice(index, 1)
      }
      onChange(newValues)
    } else {
      onChange('')
    }
  }

  const renderPreview = () => {
    if (!preview || !value) return null

    if (multiple && Array.isArray(value)) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-gunsmith-error text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )
    }

    if (typeof value === 'string' && value) {
      return (
        <div className="relative mt-4">
          <img
            src={value}
            alt="Upload preview"
            className="w-full max-w-md h-48 object-cover rounded"
          />
          <button
            type="button"
            onClick={() => handleRemove()}
            className="absolute top-2 right-2 bg-gunsmith-error text-white p-2 rounded hover:bg-gunsmith-error/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )
    }

    return null
  }

  const showUploadArea = () => {
    if (!multiple && value && typeof value === 'string') {
      return false
    }
    if (multiple && Array.isArray(value) && value.length >= maxFiles) {
      return false
    }
    return true
  }

  return (
    <div className={className}>
      {label && (
        <label className="label">{label}</label>
      )}

      {error && (
        <div className="mb-4 bg-gunsmith-error/20 border border-gunsmith-error text-gunsmith-error p-3 rounded flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {showUploadArea() && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-gunsmith-gold bg-gunsmith-gold/10' 
              : 'border-gunsmith-border hover:border-gunsmith-gold/50'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <Upload className="h-12 w-12 text-gunsmith-gold mx-auto mb-4" />
          
          <p className="text-gunsmith-text mb-2">
            {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
          </p>
          
          <p className="text-sm text-gunsmith-text-secondary">
            {multiple ? `Up to ${maxFiles} images • ` : ''}
            JPG, PNG, WebP, GIF • Max {maxSizeMB}MB
          </p>
        </div>
      )}

      {renderPreview()}

      {multiple && Array.isArray(value) && value.length > 0 && value.length < maxFiles && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 btn-secondary flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Add More Images ({value.length}/{maxFiles})
        </button>
      )}
    </div>
  )
}
