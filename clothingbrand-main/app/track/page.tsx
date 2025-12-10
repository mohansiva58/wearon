"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Package, CheckCircle, Truck, Mail, Phone, Search, Box, XCircle, MapPin, CreditCard, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Order {
  _id: string
  orderNumber: string
  userEmail: string
  userPhone?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    image: string
  }>
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
  billingAddress?: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
}

export default function TrackPage() {
  const [searchType, setSearchType] = useState<"email" | "phone">("email")
  const [searchValue, setSearchValue] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const { user } = useAuth()

  // Auto-populate and fetch orders if user is logged in
  useEffect(() => {
    if (user?.email) {
      setSearchValue(user.email)
      setSearchType("email")
      // Automatically fetch orders for logged-in user
      fetchOrdersForUser(user.email)
    }
  }, [user])

  const fetchOrdersForUser = async (email: string) => {
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch(`/api/orders?userEmail=${encodeURIComponent(email)}`)
      const result = await response.json()

      if (result.success && result.data && result.data.length > 0) {
        setOrders(result.data)
        setShowResults(true)
      } else {
        setError("No orders found for your account.")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to fetch orders. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    setError("")
    setOrders([])
    setShowResults(false)

    if (!searchValue.trim()) {
      setError(`Please enter your ${searchType}`)
      return
    }

    if (searchType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(searchValue)) {
        setError("Please enter a valid email address")
        return
      }
    } else {
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneRegex.test(searchValue)) {
        setError("Please enter a valid 10-digit phone number")
        return
      }
    }

    setIsLoading(true)

    try {
      const query = searchType === "email" 
        ? `userEmail=${encodeURIComponent(searchValue)}`
        : `userPhone=${encodeURIComponent(searchValue)}`
      
      const response = await fetch(`/api/orders?${query}`)
      const result = await response.json()

      if (result.success && result.data && result.data.length > 0) {
        setOrders(result.data)
        setShowResults(true)
      } else {
        setError("No orders found for this " + searchType + ". Please check your details.")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to fetch orders. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200"
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusSteps = (status: string, createdAt: string) => {
    const steps = [
      { 
        label: "Confirmed", 
        icon: <CheckCircle size={24} />, 
        completed: true,
        date: new Date(createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })
      },
      { 
        label: "On its way", 
        icon: <Truck size={24} />, 
        completed: status === "shipped" || status === "delivered",
        date: status === "shipped" || status === "delivered" ? new Date(createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : ""
      },
      { 
        label: "Out for delivery", 
        icon: <Box size={24} />, 
        completed: status === "delivered",
        date: status === "delivered" ? new Date(createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : ""
      },
      { 
        label: "Delivered", 
        icon: <Package size={24} />, 
        completed: status === "delivered",
        date: status === "delivered" ? new Date(createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : ""
      },
    ]

    if (status === "cancelled") {
      return [{
        label: "Order Cancelled",
        icon: <XCircle size={24} />,
        completed: true,
        date: new Date(createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })
      }]
    }

    return steps
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Track Your Orders</h1>
            <p className="text-gray-600">Enter your email or phone number to view all your orders</p>
          </div> */}

          {/* Search Card */}
          {/* <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Search for Orders</h2>
              {user && (
                <span className="text-sm text-gray-600">Logged in as: {user.email}</span>
              )}
            </div>
            
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setSearchType("email")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  searchType === "email"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Mail className="inline mr-2" size={18} />
                Email
              </button>
              <button
                onClick={() => setSearchType("phone")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  searchType === "phone"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Phone className="inline mr-2" size={18} />
                Phone
              </button>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type={searchType === "email" ? "email" : "tel"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={searchType === "email" ? "Enter your email address" : "Enter your 10-digit phone number"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Track Orders
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div> */}

          {/* Orders List */}
          {/* {isLoading && !showResults && (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto mb-4 text-gray-400" size={40} />
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          )} */}

          {showResults && orders.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Orders ({orders.length})</h2>
                {user && (
                  <button
                    onClick={() => fetchOrdersForUser(user.email!)}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                )}
              </div>
              
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="text-green-600" size={20} />
                          <h3 className="text-xl font-bold">Order {order.orderNumber}</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          Thank you {order.shippingAddress.name}!
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-lg border font-semibold text-sm capitalize ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="p-6 border-b">
                    {order.orderStatus !== "cancelled" ? (
                      <div className="flex justify-between items-center relative">
                        {/* Progress Line */}
                        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
                        <div 
                          className="absolute top-6 left-0 h-1 bg-blue-600 -z-10 transition-all duration-500"
                          style={{ 
                            width: `${(getStatusSteps(order.orderStatus, order.createdAt).filter(s => s.completed).length / getStatusSteps(order.orderStatus, order.createdAt).length) * 100}%` 
                          }}
                        ></div>

                        {getStatusSteps(order.orderStatus, order.createdAt).map((step, index) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div className={`p-3 rounded-full mb-2 ${step.completed ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                              {step.icon}
                            </div>
                            <p className={`text-xs font-semibold text-center ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                              {step.label}
                            </p>
                            {step.date && (
                              <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <XCircle className="mx-auto text-red-600 mb-2" size={48} />
                        <p className="text-lg font-semibold text-red-600">Order Cancelled</p>
                        <p className="text-sm text-gray-600 mt-1">This order has been cancelled</p>
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="p-6 space-y-4">
                    {/* Delivery Message */}
                    {order.orderStatus === "delivered" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="font-semibold text-green-800">Your shipment has been delivered</p>
                        <p className="text-sm text-green-700 mt-1">
                          Your shipment has been delivered to the address you provided. If you haven't received it, or if you have any other problems, please contact us.
                        </p>
                        <button className="text-blue-600 text-sm font-semibold mt-2 flex items-center gap-1 hover:underline">
                          <RefreshCw size={14} />
                          Re-order the same items
                        </button>
                      </div>
                    )}

                    {/* Tracking Number */}
                    {order.orderStatus === "shipped" || order.orderStatus === "delivered" ? (
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">DHL tracking number:</p>
                        <p className="text-blue-600 font-mono">123456</p>
                      </div>
                    ) : null}

                    {/* Customer Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      {/* Contact Information */}
                      <div>
                        <h4 className="font-semibold mb-3">Contact information</h4>
                        <p className="text-gray-700">{order.shippingAddress.name}</p>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h4 className="font-semibold mb-3">Payment method</h4>
                        <p className="text-gray-700">
                          {order.paymentMethod === "cod" 
                            ? `Cash on delivery (COD) - ₹${order.total.toLocaleString("en-IN")}`
                            : `Paid Online - ₹${order.total.toLocaleString("en-IN")}`
                          }
                        </p>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-semibold mb-3">Shipping address</h4>
                        <p className="text-gray-700">{order.shippingAddress.name}</p>
                        <p className="text-gray-600 text-sm">
                          {order.shippingAddress.address}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                          {order.shippingAddress.pincode}
                        </p>
                      </div>

                      {/* Billing Address */}
                      <div>
                        <h4 className="font-semibold mb-3">Billing address</h4>
                        <p className="text-gray-700">{order.billingAddress?.name || order.shippingAddress.name}</p>
                        <p className="text-gray-600 text-sm">
                          {order.billingAddress?.address || order.shippingAddress.address}<br />
                          {order.billingAddress?.city || order.shippingAddress.city}, {order.billingAddress?.state || order.shippingAddress.state}<br />
                          {order.billingAddress?.pincode || order.shippingAddress.pincode}
                        </p>
                      </div>
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
