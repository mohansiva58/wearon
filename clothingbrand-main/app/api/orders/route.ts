import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"
import { applyRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"

// Get orders
export async function GET(request: Request) {
  try {
    // Apply rate limiting
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = await applyRateLimit(identifier, 'api')
    if ('status' in rateLimitResult) return rateLimitResult // Return 429 response
    await connectDB()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const userEmail = searchParams.get("userEmail")
    const orderNumber = searchParams.get("orderNumber")

    let query: any = {}

    // If both orderNumber and userEmail are provided (for tracking)
    if (orderNumber && userEmail) {
      query.orderNumber = orderNumber
      query.userEmail = userEmail
    }
    // If only orderNumber is provided
    else if (orderNumber) {
      query.orderNumber = orderNumber
    }
    // If userId is provided (for user's orders)
    else if (userId) {
      query.userId = userId
    }
    // If only userEmail is provided
    else if (userEmail) {
      query.userEmail = userEmail
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(100)

    console.log("[Orders API] Orders fetched from MongoDB:", orders.length)
    return NextResponse.json({ success: true, data: orders, orders })
  } catch (error: any) {
    console.error("[Orders API] MongoDB error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        data: [],
      },
      { status: 500 }
    )
  }
}

// Create new order
export async function POST(request: Request) {
  try {
    // Apply rate limiting (stricter for order creation)
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = await applyRateLimit(identifier, 'orders')
    if ('status' in rateLimitResult) return rateLimitResult

    await connectDB()
    const body = await request.json()

    const {
      userId,
      userEmail,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      paymentDetails,
      subtotal,
      tax,
      total,
    } = body

    // Validate required fields with better error messages
    if (!userId || !userEmail) {
      return NextResponse.json(
        { success: false, error: "User authentication required" },
        { status: 401 }
      )
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item" },
        { status: 400 }
      )
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address || !shippingAddress.phone) {
      return NextResponse.json(
        { success: false, error: "Complete shipping address required" },
        { status: 400 }
      )
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: "Payment method required" },
        { status: 400 }
      )
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order total" },
        { status: 400 }
      )
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const order = await Order.create({
      userId,
      userEmail,
      orderNumber,
      items,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || "pending",
      paymentDetails: paymentDetails || {},
      orderStatus: paymentMethod === "online" && paymentStatus === "paid" ? "confirmed" : "pending",
      subtotal,
      tax,
      total,
    })

    console.log("[Orders API] Order created:", order.orderNumber)
    return NextResponse.json({
      success: true,
      data: order,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
    })
  } catch (error: any) {
    console.error("[Orders API] Create order error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    )
  }
}
