import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload image to Cloudinary
 * @param file - Base64 string or file path
 * @param folder - Cloudinary folder name
 * @returns Upload result with URL
 */
export async function uploadImage(file: string, folder: string = 'products') {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `thehouseofrare/${folder}`,
      transformation: [
        { width: 1200, height: 1600, crop: 'limit' }, // Max dimensions
        { quality: 'auto' }, // Automatic quality optimization
        { fetch_format: 'auto' }, // Automatic format (WebP, AVIF)
      ],
    })
    return result
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(files: string[], folder: string = 'products') {
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder))
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error)
    throw error
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw error
  }
}

/**
 * Get optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
    format?: string
  } = {}
) {
  const { width = 800, height, quality = 'auto', format = 'auto' } = options

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: 'limit' },
      { quality },
      { fetch_format: format },
    ],
  })
}

/**
 * Generate responsive image srcset
 */
export function getResponsiveImageUrls(publicId: string) {
  const widths = [320, 640, 768, 1024, 1280, 1536]
  
  return widths.map(width => ({
    width,
    url: cloudinary.url(publicId, {
      transformation: [
        { width, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    }),
  }))
}

export default cloudinary
