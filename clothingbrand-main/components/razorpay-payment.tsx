"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

interface RazorpayPaymentProps {
  amount: number
  orderId?: string
  customerDetails?: {
    name: string
    email: string
    phone: string
  }
  onSuccess: (response: any) => void
  onFailure?: (error: any) => void
  buttonText?: string
  buttonClassName?: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayPayment({
  amount,
  orderId,
  customerDetails,
  onSuccess,
  onFailure,
  buttonText = "Pay Now",
  buttonClassName = "w-full py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition",
}: RazorpayPaymentProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    try {
      setLoading(true)

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay SDK")
      }

      // Create order on server
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          receipt: orderId || `order_${Date.now()}`,
          customerDetails,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to create order")
      }

      // Razorpay payment options
      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "THE HOUSE OF RARE",
        description: "Premium Fashion & Apparel",
        image: "/logo.png",
        order_id: data.order.id,
        prefill: {
          name: customerDetails?.name || user?.displayName || "",
          email: customerDetails?.email || user?.email || "",
          contact: customerDetails?.phone || "",
        },
        theme: {
          color: "#000000",
        },
        handler: async function (response: any) {
          try {
            // Verify payment on server
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success && verifyData.verified) {
              onSuccess({
                ...response,
                paymentDetails: verifyData.payment,
              })
            } else {
              throw new Error("Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            if (onFailure) {
              onFailure(error)
            }
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            if (onFailure) {
              onFailure({ message: "Payment cancelled by user" })
            }
          },
        },
      }

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      console.error("Payment error:", error)
      if (onFailure) {
        onFailure(error)
      }
      alert(error.message || "Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={buttonClassName}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          Processing...
        </div>
      ) : (
        buttonText
      )}
    </button>
  )
}
