import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'

// POST - Create multiple products at once
export async function POST(request: Request) {
  try {
    await connectDB()

    const { products } = await request.json()

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Products array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Process each product to calculate discount
    const processedProducts = products.map((product) => {
      if (product.mrp && product.price) {
        product.discount = Math.round(((product.mrp - product.price) / product.mrp) * 100)
      }
      return product
    })

    // Use insertMany for bulk insert
    const insertedProducts = await Product.insertMany(processedProducts, { ordered: false })

    return NextResponse.json(
      {
        success: true,
        message: `Successfully created ${insertedProducts.length} products`,
        products: insertedProducts,
        count: insertedProducts.length,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Bulk product creation error:', error)
    
    // Handle partial success in case of validation errors
    if (error.writeErrors) {
      const successCount = error.insertedDocs?.length || 0
      return NextResponse.json(
        {
          success: false,
          error: `Partially completed: ${successCount} products created, ${error.writeErrors.length} failed`,
          insertedCount: successCount,
          errors: error.writeErrors,
        },
        { status: 207 } // Multi-status
      )
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
