import { NextResponse } from 'next/server'
import { getCacheStats, testRedisConnection, clearCache } from '@/lib/cache'

export async function GET() {
  try {
    // Test Redis connection
    const isConnected = await testRedisConnection()
    
    // Get cache statistics
    const stats = await getCacheStats()

    return NextResponse.json({
      success: true,
      redis: {
        connected: isConnected,
        url: process.env.REDIS_URL ? `${process.env.REDIS_URL.split(':')[0]}:****` : 'Not configured',
        status: isConnected ? 'Connected' : 'Disconnected',
      },
      cache: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await clearCache()
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
