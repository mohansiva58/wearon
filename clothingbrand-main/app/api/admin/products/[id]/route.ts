import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { deleteCachePattern, deleteCache } from '@/lib/cache'
import { ObjectId } from 'mongodb'

// GET single product - search across all collections
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 })
    }

    const db = (await import('@/lib/mongodb')).default
    const conn = await db()
    
    if (!conn.connection.db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    // Get all product collections
    const collections = await conn.connection.db.listCollections().toArray()
    const productCollections = collections
      .filter(c => c.name.startsWith('products'))
      .map(c => c.name)

    // Search across all collections
    let product = null
    for (const collectionName of productCollections) {
      const collection = conn.connection.db.collection(collectionName)
      product = await collection.findOne({ _id: new ObjectId(id) })
      if (product) break
    }

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, product })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Update product - search across all collections
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 })
    }

    // Recalculate discount if prices changed
    if (data.mrp && data.price) {
      data.discount = Math.round(((data.mrp - data.price) / data.mrp) * 100)
    }

    const db = (await import('@/lib/mongodb')).default
    const conn = await db()
    
    if (!conn.connection.db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    // Get all product collections
    const collections = await conn.connection.db.listCollections().toArray()
    const productCollections = collections
      .filter(c => c.name.startsWith('products'))
      .map(c => c.name)

    // Find and update product across all collections
    let product = null
    for (const collectionName of productCollections) {
      const collection = conn.connection.db.collection(collectionName)
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: 'after' }
      )
      if (result) {
        product = result
        break
      }
    }

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // Invalidate product cache
    await deleteCachePattern('products:*')
    await deleteCache(`product:${id}`)
    console.log('Cache invalidated for product:', id)

    return NextResponse.json({ success: true, product })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE product - search across all collections
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product ID' }, { status: 400 })
    }

    const db = (await import('@/lib/mongodb')).default
    const conn = await db()
    
    if (!conn.connection.db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 })
    }

    // Get all product collections
    const collections = await conn.connection.db.listCollections().toArray()
    const productCollections = collections
      .filter(c => c.name.startsWith('products'))
      .map(c => c.name)

    // Find and delete product across all collections
    let deleted = false
    for (const collectionName of productCollections) {
      const collection = conn.connection.db.collection(collectionName)
      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      if (result.deletedCount > 0) {
        deleted = true
        break
      }
    }

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // Invalidate product cache
    await deleteCachePattern('products:*')
    await deleteCache(`product:${id}`)
    console.log('Cache invalidated for deleted product:', id)

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
