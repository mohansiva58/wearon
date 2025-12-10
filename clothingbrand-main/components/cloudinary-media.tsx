'use client'

import { CldImage, CldUploadWidget } from 'next-cloudinary'
import { useState } from 'react'

interface CloudinaryImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

/**
 * Optimized Cloudinary Image Component
 * Automatically handles responsive images, lazy loading, and format optimization
 */
export function CloudinaryImage({
  src,
  alt,
  width = 800,
  height = 1067,
  className = '',
  priority = false,
}: CloudinaryImageProps) {
  // Extract public ID from full URL or use as-is
  const publicId = src.includes('cloudinary.com') 
    ? src.split('/upload/')[1]?.split('.')[0] 
    : src

  return (
    <CldImage
      src={publicId || src}
      width={width}
      height={height}
      alt={alt}
      className={className}
      crop="limit"
      quality="auto"
      format="auto"
      loading={priority ? 'eager' : 'lazy'}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  )
}

interface CloudinaryUploadProps {
  folder?: string
  onUploadSuccess: (info: any) => void
  children?: React.ReactNode
}

/**
 * Cloudinary Upload Widget Component
 */
export function CloudinaryUpload({
  folder = 'products',
  onUploadSuccess,
  children,
}: CloudinaryUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'default'}
      options={{
        folder: `thehouseofrare/${folder}`,
        maxFiles: 10,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        maxFileSize: 10000000, // 10MB
      }}
      onUpload={(result: any) => {
        setIsUploading(true)
      }}
      onSuccess={(result: any) => {
        setIsUploading(false)
        onUploadSuccess(result.info)
      }}
      onError={(error: any) => {
        setIsUploading(false)
        console.error('Upload error:', error)
      }}
    >
      {({ open }) => (
        <div onClick={() => open()}>
          {children || (
            <button
              type="button"
              disabled={isUploading}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </button>
          )}
        </div>
      )}
    </CldUploadWidget>
  )
}

interface CloudinaryVideoProps {
  src: string
  width?: number
  height?: number
  className?: string
  controls?: boolean
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
}

/**
 * Optimized Cloudinary Video Component
 */
export function CloudinaryVideo({
  src,
  width = 800,
  height = 600,
  className = '',
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
}: CloudinaryVideoProps) {
  const publicId = src.includes('cloudinary.com') 
    ? src.split('/upload/')[1]?.split('.')[0] 
    : src

  return (
    <video
      className={className}
      width={width}
      height={height}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
    >
      <source
        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto,f_auto/${publicId}`}
        type="video/mp4"
      />
      Your browser does not support the video tag.
    </video>
  )
}
