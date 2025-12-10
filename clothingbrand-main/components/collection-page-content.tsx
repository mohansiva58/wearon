"use client"

import { useState, useMemo, useEffect } from "react"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { SlidersHorizontal } from "lucide-react"

interface Product {
  _id: string
  name: string
  price: number
  mrp: number
  images: string[]
  colors: string[]
  sizes: string[]
  category: string
  inStock: boolean
  stockQuantity: number
  discount: number
}

const priceRanges = [
  { label: "All Prices", min: 0, max: Number.POSITIVE_INFINITY },
  { label: "Under ₹2000", min: 0, max: 2000 },
  { label: "₹2000 - ₹2500", min: 2000, max: 2500 },
  { label: "₹2500 - ₹3000", min: 2500, max: 3000 },
  { label: "Over ₹3000", min: 3000, max: Number.POSITIVE_INFINITY },
]

export function CollectionPageContent({ category, title, description }: { category: string; title: string; description: string }) {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrice, setSelectedPrice] = useState({ min: 0, max: Number.POSITIVE_INFINITY })
  const [sortBy, setSortBy] = useState("newest")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/admin/products?category=${category}`)
        const data = await res.json()
        if (data.success && data.products) {
          setAllProducts(data.products || [])
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [category])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileFiltersOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const filteredProducts = useMemo(() => {
    let filtered = allProducts

    if (searchQuery && searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase()
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.category && p.category.toLowerCase().includes(lowerQuery))
      )
    }

    filtered = filtered.filter((p) => p.price >= selectedPrice.min && p.price <= selectedPrice.max)

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === "newest") {
      filtered.reverse()
    }

    return filtered
  }, [allProducts, selectedPrice, sortBy, searchQuery])

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 md:px-8 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600">{description}</p>
            <p className="text-sm text-gray-500 mt-2">{filteredProducts.length} products available</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex gap-8">
            <div className="hidden lg:w-64 lg:block flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">Filters</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <label key={range.label} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          checked={selectedPrice.min === range.min && selectedPrice.max === range.max}
                          onChange={() => setSelectedPrice({ min: range.min, max: range.max })}
                          className="w-4 h-4 text-black cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="lg:hidden w-full">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg mb-4 w-full justify-center"
              >
                <SlidersHorizontal size={18} />
                {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
              </button>

              {mobileFiltersOpen && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <select
                      value={`${selectedPrice.min}-${selectedPrice.max}`}
                      onChange={(e) => {
                        const [min, max] = e.target.value.split("-").map(Number)
                        setSelectedPrice({ min: min || 0, max: max || Infinity })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      {priceRanges.map((range) => (
                        <option key={range.label} value={`${range.min}-${range.max}`}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading {category.toLowerCase()}...</p>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={{
                        id: product._id,
                        name: product.name,
                        price: product.price,
                        mrp: product.mrp,
                        discount: product.discount,
                        image: product.images[0] || "/placeholder.jpg",
                        colors: product.colors,
                        stockQuantity: product.stockQuantity,
                        inStock: product.inStock,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-gray-600 text-lg">No products found</p>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
