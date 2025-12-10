import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, uploadMultipleImages, deleteImage } from '@/lib/cloudinary'

// POST - Upload image(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { files, folder = 'products' } = body

    if (!files || (Array.isArray(files) && files.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      )
    }

    // Single or multiple upload
    const result = Array.isArray(files)
      ? await uploadMultipleImages(files, folder)
      : await uploadImage(files, folder)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('[Cloudinary Upload API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

// DELETE - Delete image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'publicId required' },
        { status: 400 }
      )
    }

    const result = await deleteImage(publicId)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('[Cloudinary Delete API] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    )
  }
}
