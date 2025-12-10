import { NextRequest, NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'
import { getRecommendations } from '@/lib/recommendations'

const MONGODB_URI = process.env.MONGODB_URI!
const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:4000'
const USE_MICROSERVICE = process.env.USE_RECOMMENDATION_MICROSERVICE === 'true'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || 'guest'
    const limit = parseInt(searchParams.get('limit') || '12')

    console.log(`[Recommendations API] Fetching for user: ${userId}`)

    let productIds: string[] = []

    // Use microservice if enabled, otherwise use internal engine
    if (USE_MICROSERVICE) {
      console.log('[Recommendations API] Using NestJS microservice')
      
      try {
        const recommendationResponse = await fetch(
          `${RECOMMENDATION_SERVICE_URL}/recommendations/${userId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000),
          }
        )

        if (recommendationResponse.ok) {
          const recommendationData = await recommendationResponse.json()
          productIds = recommendationData.data?.recommendations || []
          console.log(`[Recommendations API] Got ${productIds.length} IDs from microservice`)
        } else {
          throw new Error('Microservice unavailable')
        }
      } catch (error) {
        console.error('[Recommendations API] Microservice error, falling back to internal:', error)
        productIds = await getRecommendations(userId, limit)
      }
    } else {
      console.log('[Recommendations API] Using internal recommendation engine')
      productIds = await getRecommendations(userId, limit)
    }

    console.log(`[Recommendations API] Got ${productIds.length} product IDs`)

    if (productIds.length === 0) {
      // Return popular products as fallback
      return await getPopularProducts(limit)
    }

    // Fetch product details from MongoDB
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db('thehouseofrare')

    // Convert string IDs to ObjectIds
    const objectIds = productIds
      .map((id: string) => {
        try {
          return new ObjectId(id)
        } catch (e) {
          console.error(`Invalid ObjectId: ${id}`)
          return null
        }
      })
      .filter((id: ObjectId | null): id is ObjectId => id !== null)

    // Query all product collections
    const collections = await db.listCollections().toArray()
    const productCollections = collections
      .filter(c => c.name.startsWith('products'))
      .map(c => c.name)

    let allProducts: any[] = []

    for (const collectionName of productCollections) {
      const products = await db.collection(collectionName)
        .find({ 
          _id: { $in: objectIds },
          inStock: true 
        })
        .project({
          name: 1,
          subtitle: 1,
          price: 1,
          mrp: 1,
          discount: 1,
          images: 1,
          colors: 1,
          category: 1,
          slug: 1,
          stockQuantity: 1,
          inStock: 1,
        })
        .toArray()

      allProducts = allProducts.concat(products)
    }

    await client.close()

    console.log(`[Recommendations API] Found ${allProducts.length} products in stock`)

    // If we don't have enough products, supplement with popular ones
    if (allProducts.length < limit) {
      console.log('[Recommendations API] Supplementing with popular products')
      const popularResponse = await getPopularProducts(limit - allProducts.length)
      const popularData = await popularResponse.json()
      
      if (popularData.success && popularData.products) {
        // Filter out duplicates
        const existingIds = new Set(allProducts.map(p => p._id.toString()))
        const newProducts = popularData.products.filter(
          (p: any) => !existingIds.has(p._id.toString())
        )
        allProducts = [...allProducts, ...newProducts]
      }
    }

    return NextResponse.json({
      success: true,
      products: allProducts.slice(0, limit),
      count: allProducts.length,
      source: USE_MICROSERVICE ? 'nestjs-microservice' : 'internal-recommendation-engine',
    })

  } catch (error) {
    console.error('[Recommendations API] Error:', error)

    // Fallback to popular products
    return await getPopularProducts()
  }
}

async function getPopularProducts(limit: number = 8) {
  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db('thehouseofrare')

    const collections = await db.listCollections().toArray()
    const productCollections = collections
      .filter(c => c.name.startsWith('products_'))
      .map(c => c.name)

    let allProducts: any[] = []

    for (const collectionName of productCollections) {
      const products = await db.collection(collectionName)
        .find({ inStock: true })
        .sort({ soldCount: -1, viewCount: -1 })
        .limit(limit)
        .project({
          name: 1,
          subtitle: 1,
          price: 1,
          mrp: 1,
          discount: 1,
          images: 1,
          colors: 1,
          category: 1,
          slug: 1,
          stockQuantity: 1,
          inStock: 1,
        })
        .toArray()

      allProducts = allProducts.concat(products)
    }

    await client.close()

    // Sort and limit
    allProducts.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))

    return NextResponse.json({
      success: true,
      products: allProducts.slice(0, limit),
      count: allProducts.length,
      source: 'popular-fallback',
    })

  } catch (error) {
    console.error('[Recommendations API] Error fetching popular products:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch recommendations',
      products: [],
    }, { status: 500 })
  }
}
