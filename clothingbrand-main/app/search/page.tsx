"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { useProducts } from "@/hooks/use-products"

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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("search") || ""
  const [searchTerm, setSearchTerm] = useState(query)
  const [sortBy, setSortBy] = useState("relevance")
  const [page, setPage] = useState(1)
  const limit = 24

  useEffect(() => {
    setSearchTerm(query)
  }, [query])

  const { products, loading } = useProducts({
    search: searchTerm || undefined,
    page,
    limit,
    sort: sortBy === "relevance" ? undefined : sortBy,
  })

  const searchResults = useMemo(() => {
    let results = products
    let exactMatches: Product[] = []
    let relatedMatches: Product[] = []

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase()
      const searchWords = lowerTerm.split(' ').filter(word => word.length > 0)
      
      // First, find exact matches
      exactMatches = results.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerTerm) ||
          product.category.toLowerCase().includes(lowerTerm) ||
          product.colors.some((color) => color.toLowerCase().includes(lowerTerm)),
      )

      // If no exact matches, find related products
      if (exactMatches.length === 0) {
        relatedMatches = results.filter((p) => {
          const nameWords = p.name.toLowerCase().split(' ')
          const categoryWords = p.category.toLowerCase().split(' ')
          
          return searchWords.some(searchWord => 
            nameWords.some(nameWord => nameWord.includes(searchWord) || searchWord.includes(nameWord)) ||
            categoryWords.some(catWord => catWord.includes(searchWord) || searchWord.includes(catWord)) ||
            p.colors.some(color => color.toLowerCase().includes(searchWord))
          )
        })
      }

      results = exactMatches.length > 0 ? exactMatches : relatedMatches
    }

    // Sort results
    if (sortBy === "price-low") {
      results.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      results.sort((a, b) => b.price - a.price)
    } else if (sortBy === "discount") {
      results.sort((a, b) => (b.discount || 0) - (a.discount || 0))
    }

    return results
  }, [products, searchTerm, sortBy])

  const isShowingRelated = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return false
    
    const lowerTerm = searchTerm.toLowerCase()
    const hasExactMatch = products.some((p) => 
      p.name.toLowerCase().includes(lowerTerm) ||
      p.category.toLowerCase().includes(lowerTerm) ||
      p.colors.some((color) => color.toLowerCase().includes(lowerTerm))
    )
    
    return !hasExactMatch && searchResults.length > 0
  }, [searchTerm, products, searchResults])

  if (loading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <main className="bg-white min-h-screen pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Search header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {isShowingRelated ? "Related Products" : "Search Results"}
            </h1>
            {searchTerm && (
              <>
                <p className="text-gray-600 mb-3">
                  {searchResults.length > 0 ? (
                    <>
                      {searchResults.length} {isShowingRelated ? "related product" : "result"}
                      {searchResults.length !== 1 ? "s" : ""} for{" "}
                      <span className="font-bold">"{searchTerm}"</span>
                    </>
                  ) : (
                    <>
                      No results found for <span className="font-bold">"{searchTerm}"</span>
                    </>
                  )}
                </p>
                {isShowingRelated && (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
                    No exact matches found. Showing related products instead.
                  </p>
                )}
              </>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-2">No products found</h2>
              <p className="text-gray-600 mb-6">Try searching with different keywords</p>
            </div>
          ) : (
            <>
              {/* Sort controls */}
              <div className="mb-8 pb-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{searchResults.length}</span> products
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="discount">Highest Discount</option>
                  </select>
                </div>
              </div>

              {/* Results grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {searchResults.map((product) => (
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

              {/* Pagination */}
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
