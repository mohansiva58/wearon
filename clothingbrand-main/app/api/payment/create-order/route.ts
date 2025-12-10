import { NextResponse } from "next/server"
import { createRazorpayOrder } from "@/lib/razorpay"
import { applyRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit"
import { validateData, createPaymentOrderSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    // Apply strict rate limiting for payment endpoints
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = await applyRateLimit(identifier, 'payment')
    if ('status' in rateLimitResult) return rateLimitResult

    const body = await request.json()
    
    // Validate input
    const validation = validateData(createPaymentOrderSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { amount, receipt } = validation.data

    // Create Razorpay order
    const order = await createRazorpayOrder(amount, receipt)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    )
  }
}
