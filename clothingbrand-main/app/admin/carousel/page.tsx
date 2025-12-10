"use client"

import { useState, useEffect } from "react"
import { Upload, Trash2, Plus } from "lucide-react"

interface CarouselImage {
  _id: string
  url: string
  alt: string
  order: number
}

export default function CarouselAdminPage() {
  const [images, setImages] = useState<CarouselImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchCarouselImages()
  }, [])

  const fetchCarouselImages = async () => {
    try {
      const res = await fetch("/api/carousel")
      const data = await res.json()
      if (data.success) {
        setImages(data.images || [])
      }
    } catch (error) {
      console.error("Failed to fetch carousel images:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    
    Array.from(files).forEach((file) => {
      formData.append("images", file)
    })

    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        fetchCarouselImages()
      }
    } catch (error) {
      console.error("Failed to upload images:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const res = await fetch(`/api/carousel/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        fetchCarouselImages()
      }
    } catch (error) {
      console.error("Failed to delete image:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Carousel Management</h1>
            <label className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
              <Plus className="w-5 h-5" />
              Add Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {uploading && (
            <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
              Uploading images...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image._id} className="relative group">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => handleDelete(image._id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <p className="mt-2 text-sm text-gray-600">{image.alt}</p>
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-12">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No carousel images yet</p>
              <p className="text-sm text-gray-500 mt-2">Upload some images to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
