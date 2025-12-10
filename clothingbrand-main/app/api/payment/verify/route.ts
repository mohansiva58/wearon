import { NextResponse } from "next/server"
import { verifyPaymentSignature, getPaymentDetails } from "@/lib/razorpay"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, paymentId, signature } = body

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      )
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await getPaymentDetails(paymentId)

    return NextResponse.json({
      success: true,
      verified: true,
      payment: {
        id: paymentDetails.id,
        amount: Number(paymentDetails.amount) / 100, // Convert paise to rupees
        currency: paymentDetails.currency,
        status: paymentDetails.status,
        method: paymentDetails.method,
        email: paymentDetails.email,
        contact: paymentDetails.contact,
        createdAt: paymentDetails.created_at,
      },
    })
  } catch (error: any) {
    console.error("Verify payment error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Payment verification failed" },
      { status: 500 }
    )
  }
}
