"use client"

import { useEffect, useMemo, useState } from "react"

export type Product = {
  _id: string
  name: string
  subtitle?: string
  description?: string
  longDescription?: string
  price: number
  mrp: number
  discount: number
  images: string[]
  colors: string[]
  sizes: string[]
  category: string
  gender?: string
  features?: string[]
  fabricCare?: string[]
  rating?: number
  reviews?: number
  inStock: boolean
  stockQuantity: number
  sku?: string
  sizeChart?: {
    headers: string[]
    rows: string[][]
  }
  createdAt?: Date
  updatedAt?: Date
}

// Simple in-memory cache with full response data
const cache = new Map<string, { data: Product[], total: number, totalPages: number, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useProducts({
  category,
  search,
  page = 1,
  limit = 20,
  sort,
}: {
  category?: string
  search?: string
  page?: number
  limit?: number
  sort?: string
}) {
  const [data, setData] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (search) params.set("search", search)
    params.set("page", String(page))
    params.set("limit", String(limit))
    if (sort) params.set("sort", sort)
    return params.toString()
  }, [category, search, page, limit, sort])

  useEffect(() => {
    const abortController = new AbortController()
    
    const cacheKey = query
    const cached = cache.get(cacheKey)
    
    // Check cache first
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setData(cached.data)
      setTotal(cached.total)
      setTotalPages(cached.totalPages)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    async function run() {
      try {
        const res = await fetch(`/api/products?${query}`, { 
          signal: abortController.signal,
          cache: "no-store" // Disable caching for faster, fresh data
        })
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        const json = await res.json()
        
        if (!abortController.signal.aborted && json?.data) {
          setData(json.data)
          setTotal(json.total || 0)
          setTotalPages(json.totalPages || 0)
          // Update cache with full response data
          cache.set(cacheKey, { 
            data: json.data, 
            total: json.total || 0, 
            totalPages: json.totalPages || 0, 
            timestamp: Date.now() 
          })
        }
      } catch (e: any) {
        // Ignore abort errors
        if (e.name === 'AbortError') return
        if (!abortController.signal.aborted) {
          setError(e?.message || "Failed to fetch products")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    run()
    
    return () => {
      abortController.abort()
    }
  }, [query])

  return { products: data, total, totalPages, loading, error }
}
