import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Order from '@/models/Order'

// GET all orders with filters
export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    let query: any = {}

    if (status && status !== 'all') {
      query.orderStatus = status
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ])

    // Calculate statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' },
        },
      },
    ])

    return NextResponse.json({
      success: true,
      orders,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Create new order
export async function POST(request: Request) {
  try {
    await connectDB()

    const data = await request.json()

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    data.orderNumber = orderNumber

    const order = await Order.create(data)

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (error: any) {
    console.error('Order POST error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
