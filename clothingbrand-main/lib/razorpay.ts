import Razorpay from "razorpay"

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  currency: "INR",
  name: "THE HOUSE OF RARE",
  description: "Premium Fashion & Apparel",
  image: "/logo.png", // Your logo
  prefill: {
    name: "",
    email: "",
    contact: "",
  },
  theme: {
    color: "#000000", // Your brand color
  },
}

// Create Razorpay order
export async function createRazorpayOrder(amount: number, receipt?: string) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise (multiply by 100)
      currency: RAZORPAY_CONFIG.currency,
      receipt: receipt || `order_${Date.now()}`,
      notes: {
        merchant: "THE HOUSE OF RARE",
      },
    })
    return order
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    throw error
  }
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const crypto = require("crypto")
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex")

    return generatedSignature === signature
  } catch (error) {
    console.error("Error verifying payment signature:", error)
    return false
  }
}

// Fetch payment details
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId)
    return payment
  } catch (error) {
    console.error("Error fetching payment details:", error)
    throw error
  }
}

// Refund payment
export async function refundPayment(paymentId: string, amount?: number) {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined, // Amount in paise
      speed: "normal",
    })
    return refund
  } catch (error) {
    console.error("Error processing refund:", error)
    throw error
  }
}
