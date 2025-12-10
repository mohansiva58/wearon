"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import ProductCard from "@/components/product-card"
import { useAuth } from "@/hooks/use-auth"

interface Product {
  _id: string
  name: string
  subtitle?: string
  price: number
  mrp?: number
  discount?: number
  images: string[]
  colors?: string[]
  category: string
  slug?: string
  stockQuantity?: number
  inStock?: boolean
}

interface RecommendationData {
  userId: string
  recommendations: string[]
  count: number
  strategies: {
    collaborative: number
    contextual: number
    popular: number
  }
}

export default function RecommendationsSection() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false) // Start with false for faster initial render
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Show popular products immediately (from cache or fetch)
    loadPopularProductsFirst()
    
    // Then load personalized recommendations in background (only for logged-in users)
    if (user?.uid) {
      loadPersonalizedRecommendations()
    }
  }, [user])

  async function loadPopularProductsFirst() {
    // Check session cache first (only on client side)
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem('popular-products')
      if (cached) {
        try {
          const { products: cachedProducts, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 10 * 60 * 1000) { // 10 minutes
            setProducts(cachedProducts)
            return
          }
        } catch (e) {
          // Invalid cache
        }
      }
    }

    // Fetch popular products (fast query)
    try {
      const response = await fetch('/api/products?sort=popular&limit=8', {
        cache: 'force-cache',
        next: { revalidate: 600 } // Cache for 10 minutes
      })
      const data = await response.json()
      
      if (data.success && (data.data || data.products)) {
        const popularProducts = data.data || data.products
        setProducts(popularProducts)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('popular-products', JSON.stringify({
            products: popularProducts,
            timestamp: Date.now()
          }))
        }
      }
    } catch (err) {
      console.error('Error fetching popular products:', err)
    }
  }

  async function loadPersonalizedRecommendations() {
    // Check cache first (only on client side)
    if (typeof window !== 'undefined') {
      const cached = sessionStorage.getItem(`recommendations-${user?.uid}`)
      if (cached) {
        try {
          const { products: cachedProducts, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minutes
            setProducts(cachedProducts)
            return
          }
        } catch (e) {
          // Invalid cache
        }
      }
    }

    try {
      setLoading(true)

      const userId = user?.uid || 'guest'
      
      // Add timeout to prevent slow loads
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`/api/recommendations?userId=${userId}`, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()

      if (data.success && data.products && data.products.length > 0) {
        setProducts(data.products)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`recommendations-${userId}`, JSON.stringify({
            products: data.products,
            timestamp: Date.now()
          }))
        }
      }
    } catch (err) {
      // Silently fail - popular products are already showing
      console.log('Could not load personalized recommendations, showing popular products')
    } finally {
      setLoading(false)
    }
  }

  if (products.length === 0) {
    return null // Don't show section if no products
  }

  return (
    <section className="py-16 px-6 md:px-12 lg:px-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-light text-black mb-3">
            Recommendations For You
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {user 
              ? "Curated picks based on your browsing and purchase history" 
              : "Trending items you might love"
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard
                product={{
                  id: product._id,
                  name: product.name,
                  price: product.price,
                  mrp: product.mrp,
                  discount: product.discount,
                  image: product.images[0] || '/placeholder-product.jpg',
                  colors: product.colors || [],
                  stockQuantity: product.stockQuantity,
                  inStock: product.inStock,
                }}
              />
            </motion.div>
          ))}
        </div>

        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-sm text-neutral-500">
              💡 Keep browsing to get better recommendations
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
