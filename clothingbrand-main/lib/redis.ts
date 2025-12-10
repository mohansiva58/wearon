import { Redis } from "@upstash/redis"

// Initialize Redis with fallback for development
export const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

// Helper to check if Redis is available
export const isRedisAvailable = () => redis !== null

// Safe Redis operations that won't crash if Redis is not configured
export const safeRedis = {
  async zadd(key: string, score: number, member: string) {
    if (!redis) return null
    return redis.zadd(key, { score, member })
  },
  
  async zremrangebyrank(key: string, start: number, stop: number) {
    if (!redis) return null
    return redis.zremrangebyrank(key, start, stop)
  },
  
  async zincrby(key: string, increment: number, member: string) {
    if (!redis) return null
    return redis.zincrby(key, increment, member)
  },
  
  async setex(key: string, seconds: number, value: string) {
    if (!redis) return null
    return redis.setex(key, seconds, value)
  },
  
  async zrevrange(key: string, start: number, stop: number) {
    if (!redis) return []
    return redis.zrange(key, start, stop, { rev: true })
  },
  
  async smembers(key: string) {
    if (!redis) return []
    return redis.smembers(key)
  },
  
  async sadd(key: string, ...members: string[]) {
    if (!redis) return null
    return redis.sadd(key, members[0], ...members.slice(1))
  },
}
