/**
 * Redis Cache Layer
 * 
 * Provides Redis-based caching for frequently accessed data.
 * Falls back to in-memory Map if Redis is not available.
 */

import Redis from 'ioredis'

// Redis client configuration
let redis: Redis | null = null
const memoryCache = new Map<string, { data: any; expiry: number }>()

// Initialize Redis connection
function getRedisClient(): Redis | null {
  if (redis) return redis

  try {
    // Parse Redis URL and password from environment
    const redisUrl = process.env.REDIS_URL
    const redisPassword = process.env.REDIS_PASSWORD

    if (!redisUrl || !redisPassword) {
      console.warn('[Redis] No credentials found, using in-memory cache')
      return null
    }

    // Extract host and port from URL
    const [host, portStr] = redisUrl.split(':')
    const port = parseInt(portStr, 10)

    redis = new Redis({
      host,
      port,
      password: redisPassword,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    })

    redis.on('connect', () => {
      console.log('✅ [Redis] Connected successfully')
    })

    redis.on('error', (err) => {
      console.error('❌ [Redis] Connection error:', err.message)
      redis = null
    })

    redis.on('ready', () => {
      console.log('🚀 [Redis] Ready to accept commands')
    })

    // Connect to Redis
    redis.connect().catch((err) => {
      console.error('❌ [Redis] Failed to connect:', err.message)
      redis = null
    })

    return redis
  } catch (error) {
    console.error('[Redis] Initialization error:', error)
    return null
  }
}

// Cache configuration
const CACHE_TTL = {
  PRODUCTS: 5 * 60, // 5 minutes
  PRODUCT_DETAIL: 10 * 60, // 10 minutes
  CATEGORIES: 15 * 60, // 15 minutes
  SEARCH_RESULTS: 3 * 60, // 3 minutes
} as const

/**
 * Get data from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient()

    if (client && client.status === 'ready') {
      // Try Redis first with timeout
      const cached = await Promise.race([
        client.get(key),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000)) // 1 second timeout
      ])
      
      if (cached && typeof cached === 'string') {
        console.log(`✅ [Redis Cache] HIT: ${key}`)
        return JSON.parse(cached) as T
      }
      
      console.log(`❌ [Redis Cache] MISS: ${key}`)
      return null
    } else {
      // Fallback to in-memory cache
      const cached = memoryCache.get(key)
      
      if (cached) {
        // Check if expired
        if (Date.now() < cached.expiry) {
          console.log(`✅ [Memory Cache] HIT: ${key}`)
          return cached.data as T
        } else {
          // Remove expired entry
          memoryCache.delete(key)
          console.log(`⏰ [Memory Cache] EXPIRED: ${key}`)
        }
      }
      
      console.log(`❌ [Memory Cache] MISS: ${key}`)
      return null
    }
  } catch (error) {
    console.error('[Cache] Get error:', error)
    return null
  }
}

/**
 * Set data in cache
 */
export async function setCache(
  key: string,
  data: any,
  ttlSeconds: number = CACHE_TTL.PRODUCTS
): Promise<void> {
  try {
    const client = getRedisClient()

    if (client && client.status === 'ready') {
      // Store in Redis with TTL and timeout
      await Promise.race([
        client.setex(key, ttlSeconds, JSON.stringify(data)),
        new Promise((resolve) => setTimeout(resolve, 1000)) // 1 second timeout
      ])
      console.log(`💾 [Redis Cache] SET: ${key} (TTL: ${ttlSeconds}s)`)
    } else {
      // Fallback to in-memory cache
      const expiry = Date.now() + ttlSeconds * 1000
      memoryCache.set(key, { data, expiry })
      console.log(`💾 [Memory Cache] SET: ${key} (TTL: ${ttlSeconds}s)`)
    }
  } catch (error) {
    console.error('[Cache] Set error:', error)
    // Still try to cache in memory as fallback
    try {
      const expiry = Date.now() + ttlSeconds * 1000
      memoryCache.set(key, { data, expiry })
    } catch {}
  }
}

/**
 * Delete data from cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    const client = getRedisClient()

    if (client && client.status === 'ready') {
      await client.del(key)
      console.log(`🗑️ [Redis Cache] DELETE: ${key}`)
    } else {
      memoryCache.delete(key)
      console.log(`🗑️ [Memory Cache] DELETE: ${key}`)
    }
  } catch (error) {
    console.error('[Cache] Delete error:', error)
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient()

    if (client && client.status === 'ready') {
      // Use Redis SCAN to find matching keys
      const keys: string[] = []
      let cursor = '0'

      do {
        const [newCursor, foundKeys] = await client.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100
        )
        cursor = newCursor
        keys.push(...foundKeys)
      } while (cursor !== '0')

      if (keys.length > 0) {
        await client.del(...keys)
        console.log(`🗑️ [Redis Cache] DELETE PATTERN: ${pattern} (${keys.length} keys)`)
      }
    } else {
      // Fallback to in-memory cache
      const regex = new RegExp(pattern.replace('*', '.*'))
      const keysToDelete: string[] = []
      
      memoryCache.forEach((_, key) => {
        if (regex.test(key)) {
          keysToDelete.push(key)
        }
      })
      
      keysToDelete.forEach(key => memoryCache.delete(key))
      console.log(`🗑️ [Memory Cache] DELETE PATTERN: ${pattern} (${keysToDelete.length} keys)`)
    }
  } catch (error) {
    console.error('[Cache] Delete pattern error:', error)
  }
}

/**
 * Clear all cache
 */
export async function clearCache(): Promise<void> {
  try {
    const client = getRedisClient()

    if (client && client.status === 'ready') {
      await client.flushdb()
      console.log('🧹 [Redis Cache] CLEARED ALL')
    } else {
      memoryCache.clear()
      console.log('🧹 [Memory Cache] CLEARED ALL')
    }
  } catch (error) {
    console.error('[Cache] Clear error:', error)
  }
}

/**
 * Get cache stats
 */
export async function getCacheStats() {
  try {
    const client = getRedisClient()

    if (client && client.status === 'ready') {
      const info = await client.info('stats')
      const dbSize = await client.dbsize()
      const memory = await client.info('memory')
      
      return {
        type: 'redis',
        size: dbSize,
        info: info,
        memory: memory,
        connected: client.status === 'ready',
      }
    } else {
      return {
        type: 'memory',
        size: memoryCache.size,
        keys: Array.from(memoryCache.keys()),
        connected: false,
      }
    }
  } catch (error) {
    console.error('[Cache] Stats error:', error)
    return {
      type: 'memory',
      size: memoryCache.size,
      keys: Array.from(memoryCache.keys()),
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = getRedisClient()
    
    if (!client) {
      console.log('❌ [Redis] Client not initialized')
      return false
    }

    await client.ping()
    console.log('✅ [Redis] Connection test successful')
    return true
  } catch (error) {
    console.error('❌ [Redis] Connection test failed:', error)
    return false
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
    console.log('👋 [Redis] Connection closed')
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  products: (params: Record<string, any>) => {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `products:${query || 'all'}`
  },
  product: (id: string) => `product:${id}`,
  categories: () => 'categories:all',
  searchResults: (query: string, filters: string) => 
    `search:${query}:${filters}`,
}

export { CACHE_TTL }
