"use client"

import { useState, useEffect } from "react"
import ProductCard from "./product-card"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"
import Link from "next/link"

interface Product {
  _id: string
  name: string
  price: number
  mrp: number
  discount: number
  images: string[]
  colors: string[]
  category: string
  stockQuantity: number
  inStock: boolean
}

interface SuggestionStrategy {
  name: string
  products: Product[]
  reason: string
}

export default function PersonalizedSuggestions() {
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [strategy, setStrategy] = useState<string>("")
  const { user } = useAuth()
  const { items: cartItems } = useCart()
  const { items: wishlistItems } = useWishlist()

  useEffect(() => {
    async function fetchPersonalizedSuggestions() {
      setLoading(true)
      try {
        const strategies: SuggestionStrategy[] = []

        // Strategy 1: Wishlist-based recommendations
        if (wishlistItems.length > 0) {
          const categories = new Set<string>()
          // Get categories from wishlist items via product fetch
          for (const item of wishlistItems.slice(0, 3)) {
            try {
              // Validate that item.id exists and looks like a valid ObjectId (24 hex chars)
              if (!item.id || !/^[0-9a-fA-F]{24}$/.test(String(item.id))) {
                // Silently skip invalid IDs
                continue
              }
              
              const res = await fetch(`/api/admin/products/${item.id}`)
              if (!res.ok) {
                // Silently skip failed fetches
                continue
              }
              const data = await res.json()
              if (data.product?.category) {
                categories.add(data.product.category)
              }
            } catch (e) {
              console.warn('Error fetching wishlist product:', e)
              // Continue if individual fetch fails
            }
          }

          // Fetch similar products from wishlist categories
          if (categories.size > 0) {
            const categoryArray = Array.from(categories)
            const categoryQuery = categoryArray.map(c => `category=${encodeURIComponent(c)}`).join("&")
            const res = await fetch(`/api/products?${categoryQuery}&limit=8`)
            const data = await res.json()
            if (data && (data.data || data.products)) {
              const filteredProducts = (data.data || data.products)
                .filter((p: any) => !wishlistItems.some(w => String(w.id) === String(p._id)))
                .slice(0, 6)
              if (filteredProducts.length > 0) {
                strategies.push({
                  name: "Wishlist-Based",
                  products: filteredProducts,
                  reason: "Based on items you've wishlisted"
                })
              }
            }
          }
        }

        // Strategy 2: Cart-based complementary items
        if (cartItems.length > 0) {
          const cartCategories = new Set<string>()
          // Infer categories from cart items
          cartItems.slice(0, 2).forEach(item => {
            // Match keywords in cart item names to infer category
            const lowerName = item.name.toLowerCase()
            if (lowerName.includes("t-shirt") || lowerName.includes("shirt")) cartCategories.add("T-Shirts")
            if (lowerName.includes("hoodie")) cartCategories.add("Hoodies")
            if (lowerName.includes("jacket")) cartCategories.add("Jackets")
            if (lowerName.includes("jeans")) cartCategories.add("Jeans")
            if (lowerName.includes("sweater")) cartCategories.add("Sweater")
          })

          // Fetch complementary items
          if (cartCategories.size > 0) {
            const categoryArray = Array.from(cartCategories)
            const categoryQuery = categoryArray.map(c => `category=${encodeURIComponent(c)}`).join("&")
            const res = await fetch(`/api/products?${categoryQuery}&limit=8`)
            const data = await res.json()
            if (data && (data.data || data.products)) {
              const filteredProducts = (data.data || data.products)
                .filter((p: any) => !cartItems.some(c => String(c.id) === String(p._id)))
                .slice(0, 6)
              if (filteredProducts.length > 0) {
                strategies.push({
                  name: "Cart-Complement",
                  products: filteredProducts,
                  reason: "Complete your look with these items"
                })
              }
            }
          }
        }

        // Strategy 3: Trending & Popular items
        const trendingRes = await fetch("/api/products?sort=newest&limit=12", {
          cache: 'force-cache',
          next: { revalidate: 300 }
        })
        const trendingData = await trendingRes.json()
        if (trendingData && (trendingData.data || trendingData.products)) {
          const trendingProducts = (trendingData.data || trendingData.products).slice(0, 6)
          if (trendingProducts.length > 0) {
            strategies.push({
              name: "Trending",
              products: trendingProducts,
              reason: "Currently trending items"
            })
          }
        }

        // Select the best strategy based on priority
        let selectedStrategy = strategies[0] // Default to first available
        if (strategies.find(s => s.name === "Wishlist-Based")) {
          selectedStrategy = strategies.find(s => s.name === "Wishlist-Based")!
        } else if (strategies.find(s => s.name === "Cart-Complement")) {
          selectedStrategy = strategies.find(s => s.name === "Cart-Complement")!
        }

        if (selectedStrategy) {
          setSuggestions(selectedStrategy.products)
          setStrategy(selectedStrategy.reason)
        }
      } catch (error) {
        console.error("Failed to fetch personalized suggestions:", error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPersonalizedSuggestions()
  }, [user, cartItems, wishlistItems])

  // Don't show section if user not logged in and has no activity
  if (!user && cartItems.length === 0 && wishlistItems.length === 0) {
    return null
  }

  if (loading) {
    return (
      <section className="py-12 md:py-16 px-4 md:px-6 max-w-7xl mx-auto bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading personalized suggestions...</p>
        </div>
      </section>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <section className="py-12 md:py-16 px-4 md:px-6 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="text-center mb-8 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block text-sm font-semibold text-gray-600 uppercase tracking-widest mb-2">
            ✨ Just For You
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            {user ? `Personalized for ${user.displayName?.split(" ")[0] || "You"}` : "Recommended For You"}
          </h2>
          <p className="text-gray-600 text-base md:text-lg">{strategy}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {suggestions.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard
              product={{
                id: product._id,
                name: product.name,
                price: product.price,
                mrp: product.mrp,
                discount: product.discount,
                image: product.images[0] || "/placeholder.jpg",
                colors: product.colors || [],
                stockQuantity: product.stockQuantity,
                inStock: product.inStock,
              }}
            />
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8 md:mt-12">
        <Link
          href="/shop"
          className="inline-block px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Explore More
        </Link>
      </div>
    </section>
  )
}
