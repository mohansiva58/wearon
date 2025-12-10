"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import Footer from "@/components/footer"
import Link from "next/link"
import { Package, Truck, CheckCircle, Clock, XCircle, Box } from "lucide-react"

interface OrderItem {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  orderNumber: string
  items: OrderItem[]
  total: number
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  createdAt: string
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
}

export default function MyOrdersPage() {
  const { user, loading: authLoading, setShowLoginModal } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginModal(true)
    } else if (user) {
      fetchOrders()
    }
  }, [authLoading, user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders?userId=${user?.uid}`)
      const result = await response.json()
      if (result.success) {
        setOrders(result.data || [])
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="text-green-600" size={20} />
      case "shipped":
        return <Truck className="text-blue-600" size={20} />
      case "packaged":
        return <Box className="text-purple-600" size={20} />
     
      case "cancelled":
        return <XCircle className="text-red-600" size={20} />
      default:
        return <Clock className="text-yellow-600" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200"
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "packaged":
        return "bg-purple-100 text-purple-700 border-purple-200"
   
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
    }
  }

  const getTrackingSteps = (status: string) => {
    const steps = [
      { label: "Order Placed", status: "pending", active: true },
      { label: "Packaged", status: "packaged", active: false },
      { label: "Shipped", status: "shipped", active: false },
      { label: "Delivered", status: "delivered", active: false },
    ]

    const statusIndex = steps.findIndex((s) => s.status === status)
    return steps.map((step, index) => ({
      ...step,
      active: index <= statusIndex,
    }))
  }

  if (authLoading || loading) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!user) {
    return (
      <>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
          <div className="text-center max-w-md px-4">
            <Package className="mx-auto mb-4 text-gray-400" size={64} />
            <h1 className="text-2xl font-bold mb-2">Please Log In</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-3 bg-black text-white rounded font-semibold hover:bg-gray-800 transition"
            >
              Log In
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 py-8 md:py-12 pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <Package className="mx-auto mb-4 text-gray-400" size={64} />
              <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here.</p>
              <Link
                href="/shop"
                className="inline-block px-6 py-3 bg-black text-white rounded font-semibold hover:bg-gray-800 transition"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border-2 flex items-center gap-1.5 ${getStatusColor(order.orderStatus)}`}
                          >
                            {getStatusIcon(order.orderStatus)}
                            <span className="capitalize">{order.orderStatus}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                        <p className="text-2xl font-bold">₹{order.total.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Tracking */}
                  {order.orderStatus !== "cancelled" && (
                    <div className="p-4 md:p-6 border-b border-gray-200 bg-white">
                      <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Truck size={18} />
                        Order Tracking
                      </h4>
                      <div className="relative">
                        <div className="flex justify-between">
                          {getTrackingSteps(order.orderStatus).map((step, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                              <div
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 mb-2 transition ${
                                  step.active
                                    ? "bg-black border-black text-white"
                                    : "bg-white border-gray-300 text-gray-400"
                                }`}
                              >
                                {step.active ? (
                                  <CheckCircle size={16} className="md:w-5 md:h-5" />
                                ) : (
                                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                )}
                              </div>
                              <p
                                className={`text-xs md:text-sm text-center font-medium ${
                                  step.active ? "text-black" : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="absolute top-4 md:top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
                        <div
                          className="absolute top-4 md:top-5 left-0 h-0.5 bg-black -z-10 transition-all duration-500"
                          style={{
                            width: `${(getTrackingSteps(order.orderStatus).filter((s) => s.active).length - 1) * 25}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="p-4 md:p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Package size={18} />
                      Items ({order.items.length})
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4 pb-3 border-b last:border-b-0">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded border border-gray-200"
                          />
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm md:text-base mb-1">{item.name}</h5>
                            <p className="text-xs md:text-sm text-gray-600">
                              Quantity: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm md:text-base">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200">
                    <h4 className="font-semibold mb-3 text-sm">Shipping Address</h4>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.phone}</p>
                      <p className="mt-1">
                        {order.shippingAddress.address}, {order.shippingAddress.city}
                      </p>
                      <p>
                        {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
