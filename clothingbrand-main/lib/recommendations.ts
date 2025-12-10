/**
 * Recommendation Engine
 * Provides product recommendations based on user behavior
 */

import { ObjectId } from 'mongodb'
import { safeRedis as redis } from './redis'

interface ViewData {
  userId: string
  productId: string
  timestamp: number
  category?: string
}

/**
 * Record a product view
 */
export async function recordView(userId: string, productId: string, category?: string): Promise<void> {
  try {
    const timestamp = Date.now()
    
    // Store in Redis sorted set: user's recent views
    await redis.zadd(`user:${userId}:views`, timestamp, productId)
    
    // Keep only last 50 views
    await redis.zremrangebyrank(`user:${userId}:views`, 0, -51)
    
    // Increment product view count
    await redis.zincrby('product:views', 1, productId)
    
    // Track category views for user
    if (category) {
      await redis.zincrby(`user:${userId}:categories`, 1, category)
    }
    
    // Store view with metadata (7 day expiry)
    const viewKey = `view:${userId}:${productId}:${timestamp}`
    await redis.setex(viewKey, 604800, JSON.stringify({ userId, productId, category, timestamp }))
    
  } catch (error) {
    console.error('[Recommendations] Error recording view:', error)
    // Don't throw - view tracking is not critical
  }
}

/**
 * Get recommended products for a user
 */
export async function getRecommendations(userId: string, limit: number = 12): Promise<string[]> {
  try {
    // Get user's recent views
    const recentViews = await redis.zrevrange(`user:${userId}:views`, 0, 9) as string[]
    
    if (recentViews.length === 0) {
      // New user - return popular products
      return getPopularProducts(limit)
    }
    
    // Get user's favorite categories
    const favoriteCategories = await redis.zrevrange(`user:${userId}:categories`, 0, 2) as string[]
    
    // Find similar products (products viewed by users who viewed same products)
    const similarProducts = new Set<string>()
    
    // Use collaborative filtering: find other users who viewed similar products
    for (const viewedProductId of recentViews.slice(0, 5)) {
      // Get all users who viewed this product
      const userIds = await redis.smembers(`product:${viewedProductId}:viewers`) as string[]
      
      // Get what those users also viewed
      for (const otherUserId of userIds.slice(0, 10)) {
        if (otherUserId === userId) continue
        
        const otherViews = await redis.zrevrange(`user:${otherUserId}:views`, 0, 4) as string[]
        otherViews.forEach(pid => {
          if (!recentViews.includes(pid)) {
            similarProducts.add(pid)
          }
        })
      }
      
      // Track which users viewed this product
      await redis.sadd(`product:${viewedProductId}:viewers`, userId)
    }
    
    // Convert to array and limit
    let recommendations = Array.from(similarProducts)
    
    // If not enough, supplement with popular products from favorite categories
    if (recommendations.length < limit && favoriteCategories.length > 0) {
      const categoryProducts = await redis.zrevrange(
        `category:${favoriteCategories[0]}:popular`, 
        0, 
        limit - recommendations.length
      ) as string[]
      
      recommendations = [...recommendations, ...categoryProducts.filter(p => !recentViews.includes(p))]
    }
    
    // If still not enough, add popular products
    if (recommendations.length < limit) {
      const popular = await getPopularProducts(limit - recommendations.length)
      recommendations = [...recommendations, ...popular.filter(p => !recentViews.includes(p))]
    }
    
    return recommendations.slice(0, limit)
    
  } catch (error) {
    console.error('[Recommendations] Error getting recommendations:', error)
    // Fallback to popular products
    return getPopularProducts(limit)
  }
}

/**
 * Get popular products globally
 */
async function getPopularProducts(limit: number = 12): Promise<string[]> {
  try {
    const popular = await redis.zrevrange('product:views', 0, limit - 1) as string[]
    return popular
  } catch (error) {
    console.error('[Recommendations] Error getting popular products:', error)
    return []
  }
}

/**
 * Update product popularity score (call this when product is purchased)
 */
export async function recordPurchase(userId: string, productId: string, category?: string): Promise<void> {
  try {
    // Purchases are weighted more heavily than views
    await redis.zincrby('product:views', 5, productId)
    
    if (category) {
      await redis.zincrby(`category:${category}:popular`, 5, productId)
      await redis.zincrby(`user:${userId}:categories`, 3, category)
    }
  } catch (error) {
    console.error('[Recommendations] Error recording purchase:', error)
  }
}
