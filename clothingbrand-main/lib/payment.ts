// Payment processing utilities for COD and Online payments

export interface PaymentDetails {
  method: "cod" | "online"
  orderId: string
  amount: number
  currency: string
  userEmail: string
}

export interface PaymentResponse {
  success: boolean
  transactionId: string
  message: string
}

// Simulate COD payment processing
export async function processCODPayment(details: PaymentDetails): Promise<PaymentResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `COD-${details.orderId}-${Date.now()}`,
        message: "Order placed successfully. Payment will be collected at delivery.",
      })
    }, 1000)
  })
}

// Simulate Online payment processing
export async function processOnlinePayment(details: PaymentDetails): Promise<PaymentResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In production, this would integrate with Stripe, Razorpay, or similar
      resolve({
        success: true,
        transactionId: `TXN-${details.orderId}-${Date.now()}`,
        message: "Payment processed successfully.",
      })
    }, 2000)
  })
}

export async function validatePayment(
  method: "cod" | "online",
  amount: number,
): Promise<{ valid: boolean; message: string }> {
  if (amount <= 0) {
    return { valid: false, message: "Invalid amount" }
  }

  if (method === "online" && amount < 500) {
    return {
      valid: false,
      message: "Minimum order amount for online payment is ₹500",
    }
  }

  return { valid: true, message: "Payment validated successfully" }
}
