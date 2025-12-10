"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { logger } from "@/lib/logger"
// Navbar and FloatingNav are rendered globally in layout
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { ChevronDown, Filter, X, SlidersHorizontal } from "lucide-react"
import { useProducts } from "@/hooks/use-products"

interface Product {
  _id: string
  id: string
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

function ShopPageContent() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedPrice, setSelectedPrice] = useState({ min: 0, max: Number.POSITIVE_INFINITY })
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState("") // Input field value
  const [searchQuery, setSearchQuery] = useState("") // Actual search query sent to API
  const [page, setPage] = useState(1)
  const limit = 16 // Load 16 products at a time for faster performance

  // Set initial category and search from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    const searchParam = searchParams.get("search")

    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }

    if (searchParam) {
      setSearchInput(searchParam)
      setSearchQuery(searchParam)
    }
  }, [searchParams])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, selectedPrice, sortBy, searchQuery])

  const { products, total, totalPages, loading, error } = useProducts({
    category: selectedCategory === "All" ? undefined : selectedCategory,
    search: searchQuery || undefined,
    page,
    limit,
    sort: sortBy,
  })

  // Handle search submission
  const handleSearch = () => {
    setSearchQuery(searchInput)
    setPage(1)
  }

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Close mobile filters when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileFiltersOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Get unique categories from products (for filter sidebar)
  const categories = useMemo(() => {
    const cats = new Set<string>()
    products.forEach((p) => {
      // Normalize category names - remove plural 's' and trim
      let category = p.category || "Others"
      // Remove trailing 's' but keep it if it's part of the word (like "Jeans")
      if (category.endsWith("s") && !["Jeans"].includes(category)) {
        category = category.slice(0, -1)
      }
      cats.add(category)
    })
    return ["All", ...Array.from(cats).sort()]
  }, [products])

  // Only apply price filter client-side (everything else is server-side)
  const filteredProducts = useMemo(() => {
    // If no price filter is applied (default state), return all products
    if (selectedPrice.min === 0 && selectedPrice.max === Number.POSITIVE_INFINITY) {
      return products
    }
    // Otherwise apply price filter
    return products.filter((p) => p.price >= selectedPrice.min && p.price <= selectedPrice.max)
  }, [products, selectedPrice])

  // Debug logging
  useEffect(() => {
    logger.log('[Shop Page] Products:', products.length, 'Filtered:', filteredProducts.length)
  }, [products, filteredProducts])

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
              {/* Sidebar skeleton */}
              <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="bg-gray-100 rounded-2xl h-96 animate-pulse"></div>
              </div>
              
              {/* Products grid skeleton */}
              <div className="flex-1">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-10">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg aspect-[3/4] mb-3"></div>
                      <div className="bg-gray-200 rounded h-4 mb-2 w-3/4"></div>
                      <div className="bg-gray-200 rounded h-4 w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-red-600 mb-4">Error loading products: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  logger.debug('[Shop Debug] Products from API:', products.length, 'Filtered:', filteredProducts.length, 'Loading:', loading)

  return (
    <>
      <main className="bg-white min-h-screen pb-20 md:pb-0">
        {/* Embedded styles for animations and subtle utilities */}
        <style jsx global>{`
          /* Minimal Premium Animations */
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-in-left {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-fade-in-up { animation: fade-in-up 360ms ease-out both; }
          .animate-slide-in-left { animation: slide-in-left 320ms cubic-bezier(.22,.9,.32,1) both; }

          /* subtle card focus ring for accessibility */
          .card-focus:focus { outline: 3px solid rgba(0,0,0,0.06); outline-offset: 2px; border-radius: 12px; }
        `}</style>

        {/* Search Results Header */}
        {searchQuery && (
          <div className="border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">
                Search Results
              </h1>
              <p className="text-gray-600 text-sm">
                {filteredProducts.length > 0 ? (
                  <>
                    <span className="font-medium text-gray-900">{filteredProducts.length}</span> result{filteredProducts.length !== 1 ? "s" : ""} for <span className="font-semibold">"{searchQuery}"</span>
                  </>
                ) : (
                  <>
                    No results found for <span className="font-semibold">"{searchQuery}"</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto pl-5 pr-4 sm:pr-6 lg:pr-8 pt-8 lg:pt-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Overlay */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="absolute inset-0 bg-black bg-opacity-40"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <div className="absolute inset-y-0 left-0 w-80 max-w-full bg-white shadow-lg rounded-r-2xl overflow-y-auto animate-slide-in-left">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                      <button
                        onClick={() => setMobileFiltersOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close filters"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Categories */}
                    <div className="border-b border-gray-100 pb-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Category</h3>
                      <div className="space-y-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat)
                              setMobileFiltersOpen(false)
                            }}
                            className={`block w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all ${
                              selectedCategory === cat
                                ? "bg-black text-white font-semibold shadow-sm scale-[1.01]"
                                : "hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-100"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="border-b border-gray-100 pb-6 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h3>
                      <div className="space-y-2">
                        {priceRanges.map((range) => (
                          <button
                            key={range.label}
                            onClick={() => {
                              setSelectedPrice({ min: range.min, max: range.max })
                              setMobileFiltersOpen(false)
                            }}
                            className={`block w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all ${
                              selectedPrice.min === range.min && selectedPrice.max === range.max
                                ? "bg-black text-white font-semibold shadow-sm"
                                : "hover:bg-gray-50 text-gray-700 border border-transparent hover:border-gray-100"
                            }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Filters Sidebar - New Premium Design */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Categories - Premium Card Style */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 p-6 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-900 text-xl">Categories</h3>
                    <div className="h-1 w-12 bg-gradient-to-r from-black to-gray-600 rounded-full"></div>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat)
                          setPage(1)
                        }}
                        className={`group block w-full text-left px-5 py-3.5 text-base rounded-2xl transition-all duration-300 ${
                          selectedCategory === cat
                            ? "bg-gradient-to-r from-black to-gray-800 text-white font-bold shadow-xl transform scale-[1.02]"
                            : "hover:bg-white text-gray-700 font-medium hover:shadow-md hover:border-gray-200 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{cat}</span>
                          {selectedCategory === cat && (
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range - Premium Card Style */}
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 p-6 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-900 text-xl">Price Range</h3>
                    <div className="h-1 w-12 bg-gradient-to-r from-black to-gray-600 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          setSelectedPrice({ min: range.min, max: range.max })
                          setPage(1)
                        }}
                        className={`group block w-full text-left px-5 py-3.5 text-base rounded-2xl transition-all duration-300 ${
                          selectedPrice.min === range.min && selectedPrice.max === range.max
                            ? "bg-gradient-to-r from-black to-gray-800 text-white font-bold shadow-xl transform scale-[1.02]"
                            : "hover:bg-white text-gray-700 font-medium hover:shadow-md hover:border-gray-200 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{range.label}</span>
                          {selectedPrice.min === range.min && selectedPrice.max === range.max && (
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters - Premium Button */}
                <button
                  onClick={() => {
                    setSelectedCategory("All")
                    setSelectedPrice({ min: 0, max: Number.POSITIVE_INFINITY })
                    setPage(1)
                  }}
                  className="w-full py-4 bg-white border-2 border-black rounded-2xl text-base font-bold text-black hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  Reset All Filters
                </button>
              </div>
            </div>

            {/* Products Section */}
            <div className="flex-1 min-w-0">
              {/* Top Bar - Filters and Sort on Single Line */}
              <div className="flex items-center justify-between mb-6 gap-3 bg-white/60 p-3 rounded-xl border border-gray-100 shadow-sm">
                {/* Left side - Filters Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-medium text-xs sm:text-sm"
                    aria-label="Open filters"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>

                  {/* Desktop Product Count */}
                  <div className="hidden lg:block">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
                      {selectedCategory !== "All" && (
                        <span className="ml-1.5 text-gray-500">
                          in <span className="font-semibold text-gray-900">{selectedCategory}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right side - Sort Dropdown + Search */}
                <div className="flex items-center gap-3">
                  {/* Search (small inline) */}
                  <div className="hidden md:flex items-center bg-white border border-gray-100 rounded-md px-3 py-1.5 shadow-sm">
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      placeholder="Search clothing, e.g., 'denim jacket'"
                      className="w-48 text-sm placeholder-gray-400 outline-none bg-transparent"
                    />
                    <button
                      onClick={handleSearch}
                      className="ml-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      aria-label="Search"
                    >
                      Search
                    </button>
                  </div>

                  <div className="relative min-w-[140px] sm:min-w-[180px]">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white pr-8 cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="discount">Best Discount</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Results Count */}
              <div className="sm:hidden mb-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
                  {selectedCategory !== "All" && (
                    <span className="ml-1">
                      in <span className="font-semibold text-gray-900">{selectedCategory}</span>
                    </span>
                  )}
                </p>
              </div>

              {/* Products Display - Grid View */}
              {filteredProducts.length > 0 ? (
                <div>
                  {/* Desktop: 3-column premium grid with larger cards */}
                  <div className="hidden lg:grid lg:grid-cols-3 gap-10 animate-fade-in-up">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3"
                        tabIndex={0}
                        aria-label={product.name}
                      >
                        <div className="relative overflow-hidden">
                          <ProductCard
                            product={{
                              id: product._id,
                              name: product.name,
                              price: product.price,
                              mrp: product.mrp,
                              discount: product.discount,
                              image: (product.images && product.images.length > 0 && product.images[0]) ? product.images[0] : "/placeholder.jpg",
                              colors: product.colors || [],
                              stockQuantity: product.stockQuantity,
                              inStock: product.inStock,
                            }}
                          />
                          {/* Premium hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Mobile/Tablet: 2-column grid */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:hidden">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="group card-focus rounded-2xl transition-transform duration-300 hover:translate-y-[-3px] hover:shadow-lg"
                        tabIndex={0}
                        aria-label={product.name}
                      >
                        <div className="overflow-hidden rounded-2xl bg-white">
                          <div className="p-2">
                            <ProductCard
                              product={{
                                id: product._id,
                                name: product.name,
                                price: product.price,
                                mrp: product.mrp,
                                discount: product.discount,
                                image: (product.images && product.images.length > 0 && product.images[0]) ? product.images[0] : "/placeholder.jpg",
                                colors: product.colors || [],
                                stockQuantity: product.stockQuantity,
                                inStock: product.inStock,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 lg:py-24 animate-fade-in-up">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Filter className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filters or browse different categories.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCategory("All")
                        setSelectedPrice({ min: 0, max: Number.POSITIVE_INFINITY })
                        setPage(1)
                      }}
                      className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Premium Pagination */}
              {filteredProducts.length > 0 && (
                <div className="flex flex-col items-center gap-4 mt-12">
                  <div className="flex items-center gap-4">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="group px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 transition-all duration-300 hover:border-black hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:shadow-none"
                    >
                      <span className="font-semibold text-gray-700 group-hover:text-black">Previous</span>
                    </button>
                    <div className="px-6 py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-2xl font-bold shadow-lg">
                      Page {page} {totalPages > 0 && `of ${totalPages}`}
                    </div>
                    <button
                      disabled={totalPages > 0 && page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="group px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 transition-all duration-300 hover:border-black hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:shadow-none"
                    >
                      <span className="font-semibold text-gray-700 group-hover:text-black">Next</span>
                    </button>
                  </div>
                  {total > 0 && (
                    <p className="text-sm text-gray-500">
                      Showing {Math.min((page - 1) * limit + 1, total)} - {Math.min(page * limit, total)} of {total} products
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <main className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  )
}
