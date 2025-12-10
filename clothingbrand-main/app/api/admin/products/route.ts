import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product, { getProductModel } from '@/models/ProductDynamic'
import { deleteCachePattern } from '@/lib/cache'

// GET all products or search
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query: any = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit

    // If category specified, query category-specific collection
    if (category && category !== 'all') {
      const CategoryModel = getProductModel(category)
      const [products, total] = await Promise.all([
        CategoryModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        CategoryModel.countDocuments(query),
      ])

      return NextResponse.json({
        success: true,
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    }

    // If no category, query all category collections and combine results
    const db = (await import('@/lib/mongodb')).default
    const conn = await db()
    if (!conn.connection.db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }
    const collections = await conn.connection.db.listCollections().toArray()
    const productCollections = collections
      .filter(c => c.name.startsWith('products_'))
      .map(c => c.name)

    let allProducts: any[] = []
    let totalCount = 0

    for (const collectionName of productCollections) {
      if (!conn.connection.db) continue
      const collection = conn.connection.db.collection(collectionName)
      const [products, count] = await Promise.all([
        collection.find(query).sort({ createdAt: -1 }).toArray(),
        collection.countDocuments(query),
      ])
      allProducts = allProducts.concat(products)
      totalCount += count
    }

    // Sort combined results
    allProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply pagination to combined results
    const paginatedProducts = allProducts.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error: any) {
    console.error('Products GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request: Request) {
  try {
    await connectDB()

    const data = await request.json()

    // Generate slug from product name
    if (data.name && !data.slug) {
      data.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100) // Limit length
    }

    // Calculate discount percentage
    if (data.mrp && data.price) {
      data.discount = Math.round(((data.mrp - data.price) / data.mrp) * 100)
    }

    // Ensure SKU is either a valid string or null (not empty string)
    if (data.sku === '' || data.sku === undefined) {
      delete data.sku
    }

    // Get category-specific model
    const category = data.category || 'Hoodies'
    const CategoryModel = getProductModel(category)

    // Create product in category-specific collection
    const product = await CategoryModel.create(data)

    // Invalidate product cache
    await deleteCachePattern('products:*')
    console.log('Cache invalidated for products')

    console.log(`Product created successfully in collection: products_${category.toLowerCase()}`)
    console.log('Product ID:', product._id)
    console.log('Product Slug:', product.slug)

    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error: any) {
    console.error('Product POST error:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    })
    
    // Provide more helpful error messages
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0]
      return NextResponse.json({ 
        success: false, 
        error: `A product with this ${field} already exists` 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create product' 
    }, { status: 500 })
  }
}
