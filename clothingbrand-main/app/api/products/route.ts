import { MongoClient, ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"
import { getCache, setCache, cacheKeys, CACHE_TTL } from "@/lib/cache"
import { logger } from "@/lib/logger"

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const uri = process.env.MONGODB_URI
let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
  })

  await client.connect()
  cachedClient = client
  return client
}

// Helper function to get collection name from category
function getCollectionName(category: string): string {
  return `products_${category.toLowerCase().replace(/[^a-z0-9]/g, '')}`
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const gender = searchParams.get("gender")
    const inStock = searchParams.get("inStock")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const relatedTo = searchParams.get("relatedTo")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "24")
    const sort = searchParams.get("sort") || "newest"
    
    // Generate cache key
    const cacheKey = cacheKeys.products({
      category,
      search,
      gender,
      inStock,
      minPrice,
      maxPrice,
      relatedTo,
      page,
      limit,
      sort
    })
    
    // Try to get from cache (non-blocking)
    try {
      const cachedData = await getCache<any>(cacheKey)
      if (cachedData) {
        logger.log(`[Products API] Serving from cache: ${cacheKey}`)
        return NextResponse.json(cachedData, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        })
      }
    } catch (cacheError) {
      logger.error('[Products API] Cache read error:', cacheError)
      // Continue to database query
    }
    
    logger.log("[Products API] Cache miss, querying database")
    logger.log("[Products API] Query params:", { 
      category, search, gender, inStock, minPrice, maxPrice, 
      relatedTo, page, limit, sort 
    })

    const client = await connectToDatabase()
    const db = client.db("thehouseofrare")
    
    // Get list of all existing collections
    const allCollections = await db.listCollections().toArray()
    const existingCollectionNames = allCollections.map(c => c.name)
    
    // Determine which collections to query based on category
    let collections: string[] = []
    
    if (category && category !== 'all') {
      // Add category-specific collection(s) - check both singular and plural
      const categoryCollection = getCollectionName(category)
      const categoryCollectionPlural = getCollectionName(category + 's')
      const categoryCollectionSingular = getCollectionName(category.replace(/s$/i, ''))
      
      // Add all matching collections (handles both singular/plural variations)
      const collectionsToCheck = [categoryCollection, categoryCollectionPlural, categoryCollectionSingular]
      collectionsToCheck.forEach(coll => {
        if (existingCollectionNames.includes(coll) && !collections.includes(coll)) {
          collections.push(coll)
        }
      })
      
      // Always include main products collection as fallback
      if (existingCollectionNames.includes('products')) {
        collections.push('products')
      }
      logger.log(`[Products API] Querying collections for ${category}: ${collections.join(', ')}`)
    } else {
      // Query all product collections
      collections = existingCollectionNames.filter(name => 
        name === 'products' || name.startsWith('products_')
      )
      logger.log(`[Products API] Querying all ${collections.length} product collections`)
    }
    
    // Build optimized query filter using indexed fields
    const query: any = {}

    // Related products logic (optimized)
    if (relatedTo) {
      try {
        // Get the base product from products collection
        const baseProduct = await db.collection("products").findOne(
          { _id: new ObjectId(relatedTo) },
          { projection: { category: 1, price: 1, colors: 1, name: 1 } }
        )
        
        if (baseProduct) {
          query._id = { $ne: baseProduct._id }
          query.category = baseProduct.category // Match same category
          
          // Price range (±20%)
          const priceMin = baseProduct.price * 0.8
          const priceMax = baseProduct.price * 1.2
          query.price = { $gte: priceMin, $lte: priceMax }
          
          // Color matching (optional)
          if (baseProduct.colors && baseProduct.colors.length > 0) {
            query.colors = { $in: baseProduct.colors }
          }
        }
      } catch (e) {
        logger.error('[Products API] relatedTo error:', e)
      }
    }
    
    // Category filter - handle both singular and plural, case-insensitive
    if (category && category !== 'all' && !relatedTo) {
      // Remove trailing 's' to get base form (case-insensitive)
      const baseCategory = category.replace(/s$/i, '')
      // Match base form with or without 's' at the end (case-insensitive)
      query.category = { 
        $regex: `^${baseCategory}s?$`,
        $options: 'i'
      }
    }
    
    // Gender filter (indexed field)
    if (gender && gender !== 'all') {
      query.gender = gender
    }
    
    // Stock filter (indexed field)
    if (inStock === 'true') {
      query.inStock = true
    }
    
    // Price range filter (indexed field)
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseFloat(minPrice)
      if (maxPrice) query.price.$lte = parseFloat(maxPrice)
    }
    
    // Text search (uses text index)
    if (search) {
      query.$text = { $search: search }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Build sort options (use indexed fields)
    let sortOptions: any = { _id: -1 } // Default: newest (uses _id index)
    
    if (sort === "price-low") {
      sortOptions = { price: 1 } // Uses price index
    } else if (sort === "price-high") {
      sortOptions = { price: -1 } // Uses price index
    } else if (sort === "discount") {
      sortOptions = { discount: -1, inStock: 1 } // Uses compound index
    } else if (sort === "newest") {
      sortOptions = { createdAt: -1 } // Uses createdAt index
    } else if (sort === "popular") {
      sortOptions = { soldCount: -1, viewCount: -1 } // Uses compound index
    }
    
    // Optimized projection - only fetch needed fields
    const projection = {
      name: 1,
      slug: 1,
      subtitle: 1,
      price: 1,
      mrp: 1,
      discount: 1,
      images: 1,
      colors: 1,
      sizes: 1,
      category: 1,
      gender: 1,
      inStock: 1,
      stockQuantity: 1,
      rating: 1,
      reviews: 1
    }
    
    let products: any[] = []
    let total = 0
    
    // Query all relevant collections and combine results
    logger.log("[Products API] Query filter:", JSON.stringify(query))
    
    for (const collName of collections) {
      try {
        const collProducts = await db.collection(collName)
          .find(query)
          .project(projection)
          .toArray()
        
        products.push(...collProducts)
        logger.log(`[Products API] Found ${collProducts.length} products in ${collName}`)
      } catch (err) {
        logger.error(`[Products API] Error querying ${collName}:`, err)
      }
    }
    
    // Remove duplicates based on _id
    const uniqueProducts = Array.from(
      new Map(products.map(p => [p._id.toString(), p])).values()
    )
    
    logger.log(`[Products API] Total unique products: ${uniqueProducts.length}`)
    
    // Apply sorting with safe error handling
    uniqueProducts.sort((a, b) => {
      try {
        if (sort === "price-low") return (a.price || 0) - (b.price || 0)
        if (sort === "price-high") return (b.price || 0) - (a.price || 0)
        if (sort === "discount") return (b.discount || 0) - (a.discount || 0)
        if (sort === "popular") return ((b.soldCount || 0) + (b.viewCount || 0)) - ((a.soldCount || 0) + (a.viewCount || 0))
        // Default: newest (by createdAt or _id timestamp)
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 
          (a._id && typeof a._id === 'object' && a._id.toString ? 
            parseInt(a._id.toString().substring(0, 8), 16) * 1000 : 0)
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 
          (b._id && typeof b._id === 'object' && b._id.toString ? 
            parseInt(b._id.toString().substring(0, 8), 16) * 1000 : 0)
        return bTime - aTime
      } catch (sortError) {
        logger.error('[Products API] Sort error:', sortError)
        return 0
      }
    })
    
    // Apply pagination
    total = uniqueProducts.length
    const paginatedProducts = uniqueProducts.slice(skip, skip + limit)
    
    logger.log(`[Products API] Returning ${paginatedProducts.length} products (total: ${total})`)
    
    // Transform _id to id for frontend
    const transformedProducts = paginatedProducts.map(p => {
      try {
        return {
          ...p,
          id: p._id && p._id.toString ? p._id.toString() : String(p._id || ''),
          _id: p._id && p._id.toString ? p._id.toString() : String(p._id || '')
        }
      } catch (e) {
        logger.error('[Products API] Transform error:', e)
        return { ...p, id: String(p._id || ''), _id: String(p._id || '') }
      }
    })

    const responseData = { 
      success: true, 
      data: transformedProducts,
      products: transformedProducts,
      total: total,
      page: page,
      totalPages: Math.ceil(total / limit)
    }
    
    // Cache the response (non-blocking)
    setCache(cacheKey, responseData, CACHE_TTL.PRODUCTS).catch((err) => {
      logger.error('[Products API] Cache write error:', err)
    })
    
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    logger.error("[Products API] Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const client = await connectToDatabase()
    const db = client.db("thehouseofrare")

    const result = await db.collection("products").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return Response.json({ success: true, data: result })
  } catch (error) {
    logger.error("[v0] MongoDB error:", error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
