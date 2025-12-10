import { NextRequest, NextResponse } from 'next/server'
import { recordView } from '@/lib/recommendations'

const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:4000'
const USE_MICROSERVICE = process.env.USE_RECOMMENDATION_MICROSERVICE === 'true'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, category } = body

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'userId and productId are required' },
        { status: 400 }
      )
    }

    console.log(`[Record View API] Recording view: user=${userId}, product=${productId}`)

    // Use microservice if enabled, otherwise use internal engine
    if (USE_MICROSERVICE) {
      console.log('[Record View API] Using NestJS microservice')
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const response = await fetch(
          `${RECOMMENDATION_SERVICE_URL}/recommendations/view`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, productId, category }),
            signal: controller.signal,
          }
        ).finally(() => clearTimeout(timeoutId))

        if (response.ok) {
          const data = await response.json()
          return NextResponse.json({
            success: true,
            message: 'View recorded successfully',
            source: 'nestjs-microservice',
            data,
          })
        } else {
          throw new Error(`Microservice returned ${response.status}`)
        }
      } catch (error) {
        console.error('[Record View API] Microservice error, falling back to internal:', error)
        await recordView(userId, productId, category)
        return NextResponse.json({
          success: true,
          message: 'View recorded successfully (fallback)',
          source: 'internal-engine',
        })
      }
    } else {
      console.log('[Record View API] Using internal recommendation engine')
      await recordView(userId, productId, category)
      return NextResponse.json({
        success: true,
        message: 'View recorded successfully',
        source: 'internal-engine',
      })
    }

  } catch (error) {
    console.error('[Record View API] Error:', error)
    
    // Don't fail the user's request - view tracking is not critical
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record view',
      message: 'View tracking failed but request processed'
    }, { status: 200 })
  }
}
