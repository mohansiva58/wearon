"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react"

interface ProductFormData {
  name: string
  subtitle: string
  description: string
  longDescription: string
  mrp: number
  price: number
  discount: number
  images: string[]
  colors: string[]
  sizes: string[]
  category: string
  gender: string
  features: string[]
  fabricCare: string[]
  stockQuantity: number
  inStock: boolean
  sku: string
}

// Helper function to get folder path from category
const getCategoryFolder = (category: string) => {
  return category.toLowerCase().replace(/[^a-z0-9]/g, '-')
}

export default function NewProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get("category")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    subtitle: "",
    description: "",
    longDescription: "",
    mrp: 0,
    price: 0,
    discount: 0,
    images: [],
    colors: [],
    sizes: [],
    category: categoryFromUrl || "Hoodies",
    gender: "Unisex",
    features: [],
    fabricCare: [],
    stockQuantity: 0,
    inStock: true,
    sku: "",
  })

  const [newImage, setNewImage] = useState("")
  const [newColor, setNewColor] = useState("")
  const [newSize, setNewSize] = useState("")
  const [newFeature, setNewFeature] = useState("")
  const [newFabricCare, setNewFabricCare] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Calculate discount
      const discount = Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, discount }),
      })

      if (res.ok) {
        alert("Product created successfully!")
        router.push("/admin/dashboard")
      } else {
        const error = await res.json()
        alert(`Failed to create product: ${error.error}`)
      }
    } catch (error) {
      alert("Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImage.trim()] })
      setNewImage("")
    }
  }

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImage(true)
    const newImages: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert(`File ${file.name} is not an image`)
          continue
        }

        // Validate file size (max 10MB for Cloudinary)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is larger than 10MB`)
          continue
        }

        // Convert to base64
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        // Upload to Cloudinary with category-based folder
        const categoryFolder = getCategoryFolder(formData.category)
        const response = await fetch('/api/cloudinary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: base64String,
            folder: `products/${categoryFolder}`
          })
        })

        if (response.ok) {
          const result = await response.json()
          newImages.push(result.data.secure_url)
        } else {
          alert(`Failed to upload ${file.name} to Cloudinary`)
        }
      }

      setFormData({ ...formData, images: [...formData.images, ...newImages] })
      setUploadingImage(false)
    } catch (error) {
      console.error('Upload error:', error)
      alert("Failed to upload images")
      setUploadingImage(false)
    }
  }

  const addColor = () => {
    if (newColor.trim()) {
      setFormData({ ...formData, colors: [...formData.colors, newColor.trim()] })
      setNewColor("")
    }
  }

  const removeColor = (index: number) => {
    setFormData({ ...formData, colors: formData.colors.filter((_, i) => i !== index) })
  }

  const addSize = () => {
    if (newSize.trim()) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize.trim()] })
      setNewSize("")
    }
  }

  const removeSize = (index: number) => {
    setFormData({ ...formData, sizes: formData.sizes.filter((_, i) => i !== index) })
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] })
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })
  }

  const addFabricCare = () => {
    if (newFabricCare.trim()) {
      setFormData({ ...formData, fabricCare: [...formData.fabricCare, newFabricCare.trim()] })
      setNewFabricCare("")
    }
  }

  const removeFabricCare = (index: number) => {
    setFormData({ ...formData, fabricCare: formData.fabricCare.filter((_, i) => i !== index) })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Regular Fit Graphic Print Sweatshirt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="LOBO - NAVY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Short Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                  placeholder="Brief product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Long Description</label>
                <textarea
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows={5}
                  placeholder="Detailed product description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="Hoodies">Hoodies</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Pants">Pants</option>
                    <option value="Jeans">Jeans</option>
                    <option value="Sweatshirts">Sweatshirts</option>
                    <option value="Jackets">Jackets</option>
                    <option value="Shorts">Shorts</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gender *</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="PROD-001"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Pricing</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="4999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="3999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={
                      formData.mrp && formData.price
                        ? Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)
                        : 0
                    }
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Product Images</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  📁 products/{getCategoryFolder(formData.category)}
                </span>
              </div>

              {/* Toggle between URL and Upload */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setImageInputMode("url")}
                  className={`px-4 py-2 rounded-lg transition ${
                    imageInputMode === "url"
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode("upload")}
                  className={`px-4 py-2 rounded-lg transition ${
                    imageInputMode === "upload"
                      ? "bg-black text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Upload Image
                </button>
              </div>

              {imageInputMode === "url" ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter image URL (https://...)"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-black transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploadingImage ? "Uploading to Cloudinary..." : "Click to upload images (Max 10MB each)"}
                    </span>
                    <span className="text-xs text-gray-400">Supports: JPG, PNG, WEBP, GIF • Uploaded to Cloudinary CDN</span>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Product ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Available Colors</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Navy Blue"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                  >
                    {color}
                    <button type="button" onClick={() => removeColor(index)} className="text-red-500 hover:text-red-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Available Sizes</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="M-40"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-2"
                  >
                    {size}
                    <button type="button" onClick={() => removeSize(index)} className="text-red-500 hover:text-red-700">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Product Features</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Premium Cotton Blend"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Add
                </button>
              </div>

              <ul className="space-y-2">
                {formData.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fabric Care */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Fabric Care Instructions</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFabricCare}
                  onChange={(e) => setNewFabricCare(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Machine wash cold"
                />
                <button
                  type="button"
                  onClick={addFabricCare}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                >
                  Add
                </button>
              </div>

              <ul className="space-y-2">
                {formData.fabricCare.map((care, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">{care}</span>
                    <button
                      type="button"
                      onClick={() => removeFabricCare(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stock */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Stock Management</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">In Stock</label>
                  <select
                    value={formData.inStock ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.value === "true" })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-medium"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
              <Link
                href="/admin/dashboard"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
