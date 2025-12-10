"use client"

import { useState, useEffect } from "react"
import LoadingLogo from "@/components/loading-logo"
// Navbar and Footer are rendered globally in `app/layout.tsx`
import { Heart, Share2, Truck, Shield, X, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import ProductCard from "@/components/product-card"
import { useRouter } from "next/navigation"

interface Product {
  _id: string
  name: string
  subtitle?: string
  description: string
  longDescription?: string
  price: number
  mrp: number
  discount: number
  images: string[]
  colors: string[]
  sizes: string[]
  category: string
  features?: string[]
  fabricCare?: string[]
  stockQuantity: number
  inStock: boolean
  sku?: string
  rating?: number
  reviews?: number
  sizeChart?: {
    headers: string[]
    rows: string[][]
  }
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [pincode, setPincode] = useState("")
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const { addItem } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { user, setShowLoginModal } = useAuth()
  const router = useRouter()

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (!resolvedParams?.id) return

    async function fetchProduct() {
      try {
        const res = await fetch(`/api/admin/products/${resolvedParams!.id}`)
        const data = await res.json()
        console.log("Product detail API response:", data)
        if (data.success && data.product) {
          setProduct(data.product)
          setSelectedColor(data.product.colors?.[0] || "")
          // Set default size - use product sizes or default to 'M'
          const defaultSize = data.product.sizes && data.product.sizes.length > 0 
            ? data.product.sizes[0] 
            : 'M'
          setSelectedSize(defaultSize)

          // Track product view for recommendations
          if (user?.uid) {
            fetch('/api/recommendations/view', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.uid,
                productId: resolvedParams!.id,
              }),
            }).catch(err => console.error('Failed to track view:', err))
          }
        } else {
          router.push("/shop")
        }
      } catch (error) {
        console.error("Failed to fetch product:", error)
        router.push("/shop")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [resolvedParams, router, user])

  // Fetch related products by same category with advanced similarity matching
  useEffect(() => {
    if (!product) return

    async function fetchRelated() {
      try {
        // Fetch with similarity-based ranking for better recommendations
        const res = await fetch(`/api/products?relatedTo=${encodeURIComponent(product._id)}&sort=similarity&limit=12`)
        let json = await res.json()
        if (json && (json.data || json.products)) {
          const prods = json.data || json.products
          const filtered = prods.filter((p: any) => String(p._id) !== String(product._id)).slice(0, 8)
          console.log("Similarity-ranked recommendations fetched:", filtered.length, "items")
          if (filtered.length > 0) {
            setRelatedProducts(filtered)
            return
          }
        }

        // Fallback: try category-based fetch if similarity returned empty
        try {
          const resCat = await fetch(`/api/products?category=${encodeURIComponent(product.category)}&limit=8`)
          const jcat = await resCat.json()
          if (jcat && (jcat.data || jcat.products)) {
            const filteredCat = (jcat.data || jcat.products).filter((p: any) => String(p._id) !== String(product._id)).slice(0,8)
            if (filteredCat.length > 0) { console.log("Category fallback fetched:", filteredCat.length); setRelatedProducts(filteredCat); return }
          }
        } catch (err) {
          console.error("Failed to fetch category fallback:", err)
        }

        // Fallback: fetch newest products if none found in category
        try {
          const res2 = await fetch(`/api/products?limit=8&sort=newest`)
          const j2 = await res2.json()
          if (j2 && (j2.data || j2.products)) {
            const fallback = (j2.data || j2.products).filter((p: any) => String(p._id) !== String(product._id)).slice(0,8)
            console.log("Fallback newest products fetched:", fallback.length)
            setRelatedProducts(fallback)
            return
          }
        } catch (err) {
          console.error("Failed to fetch fallback related products:", err)
          setRelatedProducts([])
        }
        
      } catch (err) {
        console.error("Failed to fetch related products:", err)
        setRelatedProducts([])
      }
    }

    fetchRelated()
  }, [product])

  const productId = product ? (typeof product._id === 'string' ? parseInt(product._id, 10) || 0 : 0) : 0
  const isWishlisted = isInWishlist(productId)

  if (loading || !product) {
    return <LoadingLogo alt="Loading product" />
  }

  const isOutOfStock = product.stockQuantity === 0 || product.inStock === false

  const handleAddToCart = () => {
    if (isOutOfStock) {
      alert("This product is currently out of stock")
      return
    }
    if (!selectedSize) {
      alert("Please select a size")
      return
    }
    addItem({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
    })
  }

  const handleBuyNow = () => {
    if (isOutOfStock) {
      alert("This product is currently out of stock")
      return
    }
    if (!selectedSize) {
      alert("Please select a size")
      return
    }
    
    // Check if user is logged in before proceeding to checkout
    if (!user) {
      setShowLoginModal(true)
      return
    }
    
    handleAddToCart()
    router.push("/checkout")
  }

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryStatus("✓ Delivery available in 3-5 business days")
    } else {
      setDeliveryStatus("Please enter a valid 6-digit pincode")
    }
  }

  const gstSavings = Math.round((product.mrp - product.price) * 0.18)

  const openImageModal = (index: number) => {
    setModalImageIndex(index)
    setShowImageModal(true)
  }

  const nextModalImage = () => {
    setModalImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevModalImage = () => {
    setModalImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  return (
    <>
      
      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          >
            <X size={32} />
          </button>
          <button
            onClick={prevModalImage}
            className="absolute left-4 text-white hover:text-gray-300 z-50"
          >
            <ChevronLeft size={48} />
          </button>
          <button
            onClick={nextModalImage}
            className="absolute right-4 text-white hover:text-gray-300 z-50"
          >
            <ChevronRight size={48} />
          </button>
          <img
            src={product.images[modalImageIndex] || "/placeholder.svg"}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold">Size Guide</h2>
              <button onClick={() => setShowSizeChart(false)} className="text-gray-600 hover:text-black">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      {product.sizeChart?.headers ? (
                        product.sizeChart.headers.map((header, i) => (
                          <th key={i} className="border border-gray-300 px-4 py-3 text-left font-bold text-sm">
                            {header}
                          </th>
                        ))
                      ) : (
                        <>
                          <th className="border border-gray-300 px-4 py-3 text-left font-bold text-sm">Size</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-bold text-sm">Chest (inches)</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-bold text-sm">Length (inches)</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-bold text-sm">Shoulder (inches)</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizeChart?.rows && product.sizeChart.rows.length > 0 ? (
                      product.sizeChart.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {row.map((cell, j) => (
                            <td key={j} className="border border-gray-300 px-4 py-3 text-sm">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm">S</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">36-38</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">27</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">17</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm">M</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">38-40</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">28</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">18</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm">L</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">40-42</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">29</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">19</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm">XL</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">42-44</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">30</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">20</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm">XXL</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">44-46</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">31</td>
                          <td className="border border-gray-300 px-4 py-3 text-sm">21</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-sm mb-2">How to Measure</h3>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• <strong>Chest:</strong> Measure around the fullest part of your chest</li>
                  <li>• <strong>Length:</strong> Measure from the highest point of shoulder to the hem</li>
                  <li>• <strong>Shoulder:</strong> Measure from shoulder seam to shoulder seam</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="bg-white pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 md:py-4">
          {/* Breadcrumb */}
          <div className="text-xs md:text-sm text-gray-600 mb-4 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:underline hover:text-black">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:underline hover:text-black">
              Refero
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{product.subtitle}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            {/* Image Gallery */}
            <div className="space-y-2">
              {/* Main Image */}
              <div 
                className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square md:aspect-[4/5] cursor-zoom-in"
                style={{ maxHeight: '450px' }}
                onClick={() => openImageModal(mainImage)}
              >
                <img
                  src={product.images[mainImage] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Wishlist & Share Icons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleWishlist({
                        id: productId,
                        name: product.name,
                        price: product.price,
                        image: product.images[0],
                      })
                    }}
                    className={`p-2 rounded-full backdrop-blur-sm transition ${
                      isWishlisted ? "bg-red-500 text-white" : "bg-white/80 text-black hover:bg-white"
                    }`}
                  >
                    <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
                  </button>
                  <button className="p-2 bg-white/80 hover:bg-white rounded-full backdrop-blur-sm transition">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      index === mainImage ? "border-black" : "border-gray-200 hover:border-gray-400"
                    }`}
                    style={{ maxHeight: '95px' }}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              {/* OUT OF STOCK Banner */}
              {isOutOfStock && (
                <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-center font-bold">
                  OUT OF STOCK
                </div>
              )}
              
              {/* Product Title */}
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight mb-1">{product.name}</h1>
                <p className="text-sm md:text-base text-gray-600 font-medium">{product.subtitle}</p>
              </div>

              {/* Price Section */}
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-xs md:text-sm text-gray-600">MRP</p>
                  <p className="text-base md:text-lg text-gray-400 line-through">₹{product.mrp.toLocaleString("en-IN")}</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-black">₹{product.price.toLocaleString("en-IN")}</p>
                  <span className="text-sm md:text-base text-red-600 font-bold">{product.discount}%</span>
                </div>
                <p className="text-xs text-gray-600">(Incl. of all taxes)</p>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm md:text-base font-bold uppercase">Select Size</label>
                  <button 
                    onClick={() => setShowSizeChart(true)}
                    className="text-xs md:text-sm underline hover:no-underline text-black font-medium"
                  >
                    SIZE GUIDE
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {(product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 md:py-3 px-2 border-2 rounded text-xs md:text-sm font-medium transition ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector - show only when in stock */}
              {!isOutOfStock ? (
                <div>
                  <label className="text-sm md:text-base font-bold mb-2 block">QUANTITY</label>
                  <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-lg w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-lg font-bold hover:text-gray-600 transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="px-4 text-lg font-semibold min-w-[40px] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-lg font-bold hover:text-gray-600 transition"
                      aria-label="Increase quantity"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              ) : null}

                  

              {/* Pincode Check */}
              <div className="pb-4 border-b border-gray-200">
                <p className="text-xs md:text-sm font-bold mb-2 uppercase">Check Estimated Delivery</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ENTER YOUR PINCODE"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black uppercase placeholder:text-xs"
                  />
                  <button
                    onClick={checkDelivery}
                    className="px-4 md:px-6 py-2.5 md:py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition text-xs md:text-sm whitespace-nowrap"
                  >
                    CHECK
                  </button>
                </div>
                {deliveryStatus && (
                  <p
                    className={`text-xs mt-2 font-medium ${deliveryStatus.includes("✓") ? "text-green-600" : "text-red-600"}`}
                  >
                    {deliveryStatus}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`py-2.5 md:py-3 px-3 border-2 font-bold rounded transition text-sm md:text-base ${
                    isOutOfStock
                      ? "border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "border-black text-black hover:bg-gray-100"
                  }`}
                >
                  {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`py-2.5 md:py-3 px-3 font-bold rounded transition text-sm md:text-base ${
                    isOutOfStock
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {isOutOfStock ? "UNAVAILABLE" : "BUY IT NOW"}
                </button>
              </div>

              {/* Features */}
              <div className="space-y-2 pt-3">
                <div className="flex gap-3 items-start">
                  <Truck size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold">Free Shipping</p>
                    <p className="text-gray-600 text-xs">On orders above ₹500</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Shield size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold">Easy Returns & Exchanges</p>
                    <p className="text-gray-600 text-xs">Within 30 days of purchase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description Section */}
          <div className="mt-8 md:mt-10 space-y-6">
            {/* Description */}
            <div className="border-t border-gray-200 pt-6 md:pt-8">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 uppercase">Description</h2>
              <div className="prose prose-sm md:prose-base max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>
                <p className="text-gray-700 leading-relaxed">{product.longDescription}</p>
              </div>
            </div>

            {/* Product Features */}
            {product.features && product.features.length > 0 && (
              <div className="border-t border-gray-200 pt-6 md:pt-8">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 uppercase">Product Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-green-600 font-bold text-lg">✓</span>
                      <span className="text-sm md:text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fabric Care */}
            {product.fabricCare && product.fabricCare.length > 0 && (
              <div className="border-t border-gray-200 pt-6 md:pt-8">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 uppercase">Fabric Care</h2>
                <ul className="space-y-2">
                  {product.fabricCare.map((care, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-gray-400 text-lg">•</span>
                      <span className="text-sm md:text-base text-gray-700">{care}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews Section */}
            {product.rating && product.reviews && (
              <div className="border-t border-gray-200 pt-6 md:pt-8">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 uppercase">Ratings & Reviews</h2>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i} className={`text-xl md:text-2xl ${i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}>
                          ★
                        </span>
                      ))}
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-bold">{product.rating} out of 5</p>
                    <p className="text-xs md:text-sm text-gray-600">Based on {product.reviews} reviews</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Related Products Section */}
      {relatedProducts.length > 0 ? (
        <section className="py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-bold">You may also like</h2>
            <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="text-sm text-gray-600 hover:text-black">
              View all in {product.category}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {relatedProducts.map((rp) => (
              <div key={rp._id} className="group card-focus rounded-2xl transition-transform duration-300 hover:translate-y-[-3px] hover:shadow-lg">
                <div className="overflow-hidden rounded-2xl bg-white">
                  <div className="p-2">
                    <ProductCard
                      product={{
                        id: rp._id,
                        name: rp.name,
                        price: rp.price,
                        mrp: rp.mrp,
                        discount: rp.discount,
                        image: rp.images?.[0] || "/placeholder.jpg",
                        colors: rp.colors || [],
                        stockQuantity: rp.stockQuantity,
                        inStock: rp.inStock,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="py-8 md:py-12 px-4 md:px-8 max-w-7xl mx-auto text-center">
          <p className="text-gray-600">No recommendations found. Try browsing <Link href="/shop" className="text-black underline">shop</Link> or check our latest arrivals.</p>
        </section>
      )}
    </>
  )
}
