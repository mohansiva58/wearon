import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

// Initialize Redis with fallback for development
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Create rate limiter with different limits for different endpoints
export const rateLimiters = {
  // General API - 60 requests per minute
  api: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/api",
  }) : null,

  // Payment endpoints - 10 requests per minute (more restrictive)
  payment: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/payment",
  }) : null,

  // Order creation - 20 requests per minute
  orders: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/orders",
  }) : null,

  // Authentication - 5 requests per minute
  auth: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/auth",
  }) : null,
}

// Helper to apply rate limiting to API routes
export async function applyRateLimit(
  identifier: string,
  limiterType: keyof typeof rateLimiters = 'api'
) {
  const limiter = rateLimiters[limiterType]
  
  // Skip rate limiting in development if Redis is not configured
  if (!limiter) {
    console.warn('[RateLimit] Rate limiting disabled - Redis not configured')
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { 
          error: "Too many requests. Please try again later.",
          limit,
          remaining,
          reset: new Date(reset).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      )
    }

    return { success: true, limit, remaining, reset }
  } catch (error) {
    console.error('[RateLimit] Error:', error)
    // Allow request on rate limit error (fail open)
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
}

// Get identifier from request (IP or user ID)
export function getRateLimitIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`
  
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = forwarded?.split(',')[0] || realIp || 'anonymous'
  
  return `ip:${ip}`
}
