"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Truck, Clock } from "lucide-react"

interface OrderDetails {
  orderNumber: string
  total: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  createdAt: string
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("orderNumber")
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails()
    } else {
      setLoading(false)
    }
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders?orderNumber=${orderNumber}`)
      const result = await response.json()
      
      if (result.success && result.data?.length > 0) {
        setOrder(result.data[0])
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="bg-white min-h-screen flex items-center justify-center py-12 px-4">
      <div className="text-center max-w-2xl w-full">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been placed successfully.</p>

        {loading ? (
          <div className="bg-gray-50 p-8 rounded-lg mb-8">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto"></div>
              <div className="h-8 bg-gray-300 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        ) : order ? (
          <>
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <p className="text-sm text-gray-600 mb-2">Order Number</p>
              <p className="text-2xl font-bold mb-4">{order.orderNumber}</p>
              
              <div className="grid grid-cols-2 gap-4 text-left mt-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                  <p className="font-semibold text-lg">₹{order.total.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="font-semibold capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                  <p className={`font-semibold capitalize ${order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                    {order.paymentStatus}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order Status</p>
                  <p className="font-semibold capitalize">{order.orderStatus}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package size={18} />
                Order Items ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-sm text-gray-600 mb-2">Order Number</p>
            <p className="text-2xl font-bold">{orderNumber || "N/A"}</p>
          </div>
        )}

        <p className="text-gray-600 mb-6 flex items-center justify-center gap-2">
          <Truck size={18} />
          You will receive an email confirmation shortly. Track your order anytime.
        </p>

        <div className="space-y-3">
          <Link
            href="/my-orders"
            className="block w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-900 transition"
          >
            Track My Order
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-200 text-black py-3 rounded font-semibold hover:bg-gray-300 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <main className="bg-white min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
