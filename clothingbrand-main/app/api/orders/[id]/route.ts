import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Order from "@/models/Order"

// Update order status
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await context.params
    const body = await request.json()
    const { orderStatus } = body

    if (!orderStatus) {
      return NextResponse.json(
        { success: false, error: "Order status is required" },
        { status: 400 }
      )
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    )

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    console.log("[Orders API] Order status updated:", id, orderStatus)
    return NextResponse.json({
      success: true,
      data: order,
      message: "Order status updated successfully",
    })
  } catch (error: any) {
    console.error("[Orders API] Update error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    )
  }
}

// Get single order by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await context.params

    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error: any) {
    console.error("[Orders API] Get order error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    )
  }
}
