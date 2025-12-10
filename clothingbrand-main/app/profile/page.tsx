"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/hooks/use-auth"
import { 
  Mail, 
  Phone, 
  MapPin, 
  LogOut, 
  Edit2, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  User,
  MapPinned,
  Heart,
  Bell,
  CreditCard,
  HelpCircle,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

interface Order {
  _id: string
  orderId: string
  orderNumber: string
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
    size: string
    color: string
    image: string
  }>
  totalAmount: number
  total: number
  status: string
  orderStatus: string
  paymentStatus: string
  shippingAddress: {
    fullName: string
    name: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  createdAt: string
  trackingNumber?: string
  estimatedDelivery?: string
}

type TabType = "overview" | "orders" | "profile" | "address" | "wishlist"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [profileData, setProfileData] = useState({
    fullName: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })

  // Fetch user orders
  useEffect(() => {
    if (user?.email) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userEmail=${encodeURIComponent(user?.email || "")}`)
      const data = await res.json()
      if (data.success && data.data) {
        // Remove duplicates based on _id or orderNumber
        const uniqueOrders = data.data.filter((order: Order, index: number, self: Order[]) => 
          index === self.findIndex((o) => o._id === order._id || o.orderNumber === order.orderNumber)
        )
        setOrders(uniqueOrders)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoadingOrders(false)
    }
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="bg-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
            <Link
              href="/login"
              className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition"
            >
              Go to Login
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = () => {
    setIsEditing(false)
    // Here you would typically make an API call to save the profile data
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const sidebarItems = [
    { id: "overview" as TabType, label: "Account Overview", icon: User },
    { id: "orders" as TabType, label: "My Orders", icon: Package },
    { id: "profile" as TabType, label: "Profile Information", icon: User },
    { id: "address" as TabType, label: "Manage Addresses", icon: MapPinned },
    { id: "wishlist" as TabType, label: "My Wishlist", icon: Heart },
  ]

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold">My Account</h1>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded border border-gray-200 overflow-hidden">
                {/* User Info */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user.email ? user.email[0].toUpperCase() : "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">Hello,</p>
                      <p className="text-sm text-gray-600 truncate">{profileData.fullName || user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="py-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
                          activeTab === item.id
                            ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                            : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </button>
                    )
                  })}
                </nav>

                {/* Logout Button - Mobile */}
                <div className="p-4 border-t border-gray-200 lg:hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{orders.length}</p>
                          <p className="text-xs text-gray-600">Total Orders</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="text-green-600" size={20} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {orders.filter((o) => (o.orderStatus || o.status)?.toLowerCase() === "delivered").length}
                          </p>
                          <p className="text-xs text-gray-600">Delivered</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded border border-gray-200 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Truck className="text-yellow-600" size={20} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {orders.filter((o) => {
                              const status = (o.orderStatus || o.status)?.toLowerCase()
                              return status === "shipped" || status === "processing" || status === "confirmed"
                            }).length}
                          </p>
                          <p className="text-xs text-gray-600">In Transit</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white rounded border border-gray-200">
                    <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                      <h2 className="text-lg font-bold">Recent Orders</h2>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <div className="p-4 md:p-6">
                      {loadingOrders ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Loading orders...</p>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 mb-4">No orders yet</p>
                          <Link
                            href="/shop"
                            className="inline-block bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-900 transition"
                          >
                            Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.slice(0, 2).map((order) => (
                            <div
                              key={order._id}
                              className="border border-gray-200 rounded p-4 hover:shadow-sm transition"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                <div>
                                  <p className="text-xs text-gray-500">Order #{order.orderNumber || order.orderId}</p>
                                  <p className="text-sm font-medium">
                                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                                {getStatusBadge(order.orderStatus || order.status)}
                              </div>
                              <div className="flex gap-3 mb-3">
                                {order.items.slice(0, 4).map((item, idx) => (
                                  <img
                                    key={idx}
                                    src={item.image}
                                    alt={item.name}
                                    className="w-14 h-14 object-cover rounded border"
                                  />
                                ))}
                                {order.items.length > 4 && (
                                  <div className="w-14 h-14 bg-gray-100 rounded border flex items-center justify-center">
                                    <span className="text-xs font-medium">+{order.items.length - 4}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t">
                                <p className="text-sm font-medium">₹{(order.total || order.totalAmount || 0).toLocaleString("en-IN")}</p>
                                <Link
                                  href={`/track?orderId=${order.orderNumber || order.orderId}`}
                                  className="text-xs text-blue-600 hover:underline font-medium"
                                >
                                  Track Order →
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="bg-white rounded border border-gray-200 p-4 hover:shadow-sm transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium">Profile Information</p>
                          <p className="text-xs text-gray-600">Edit your personal details</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("address")}
                      className="bg-white rounded border border-gray-200 p-4 hover:shadow-sm transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <MapPinned className="text-orange-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium">Manage Addresses</p>
                          <p className="text-xs text-gray-600">Update delivery address</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="bg-white rounded border border-gray-200">
                  <div className="p-4 md:p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold">My Orders ({orders.length})</h2>
                  </div>
                  <div className="p-4 md:p-6">{loadingOrders ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto mb-3"></div>
                        <p className="text-sm text-gray-600">Loading your orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                        <Link
                          href="/shop"
                          className="inline-block bg-black text-white px-6 py-2.5 rounded font-medium hover:bg-gray-900 transition"
                        >
                          Browse Products
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order._id}
                            className="border border-gray-200 rounded p-4 hover:shadow-sm transition"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">ORDER PLACED</p>
                                <p className="text-sm font-medium">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">TOTAL</p>
                                <p className="text-sm font-bold">₹{(order.total || order.totalAmount || 0).toLocaleString("en-IN")}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">ORDER ID</p>
                                <p className="text-sm font-medium">{order.orderNumber || order.orderId}</p>
                              </div>
                              {getStatusBadge(order.orderStatus || order.status)}
                            </div>

                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded border"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                                    <p className="text-xs text-gray-600">
                                      Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                                    </p>
                                    <p className="text-sm font-medium mt-1">₹{item.price.toLocaleString("en-IN")}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-3 mt-4 pt-4 border-t">
                              <Link
                                href={`/track?orderId=${order.orderNumber || order.orderId}`}
                                className="flex-1 text-center px-4 py-2 border border-black rounded text-sm font-medium hover:bg-black hover:text-white transition"
                              >
                                Track Order
                              </Link>
                              <button className="flex-1 text-center px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition">
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="bg-white rounded border border-gray-200">
                  <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Profile Information</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                    >
                      <Edit2 size={16} />
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            name="fullName"
                            value={profileData.fullName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Enter your full name"
                            className={`w-full px-4 py-2.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isEditing ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="email"
                              value={profileData.email}
                              disabled
                              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded bg-gray-50"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                              type="tel"
                              name="phone"
                              value={profileData.phone}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              placeholder="+91"
                              className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isEditing ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleSaveProfile}
                            className="px-6 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-900 transition"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Address Tab */}
              {activeTab === "address" && (
                <div className="bg-white rounded border border-gray-200">
                  <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Manage Addresses</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                    >
                      <Edit2 size={16} />
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="inline mr-2" size={16} />
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="House No., Building Name, Street"
                          className={`w-full px-4 py-2.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isEditing ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            name="city"
                            value={profileData.city}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="City"
                            className={`w-full px-4 py-2.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isEditing ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                          <input
                            type="text"
                            name="state"
                            value={profileData.state}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="State"
                            className={`w-full px-4 py-2.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isEditing ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                          <input
                            type="text"
                            name="pincode"
                            value={profileData.pincode}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="6-digit PIN"
                            className={`w-full px-4 py-2.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isEditing ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                            }`}
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleSaveProfile}
                            className="px-6 py-2.5 bg-black text-white rounded font-medium hover:bg-gray-900 transition"
                          >
                            Save Address
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2.5 border border-gray-300 rounded font-medium hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div className="bg-white rounded border border-gray-200">
                  <div className="p-4 md:p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold">My Wishlist</h2>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                      <p className="text-gray-600 mb-6">Save your favorite items here</p>
                      <Link
                        href="/shop"
                        className="inline-block bg-black text-white px-6 py-2.5 rounded font-medium hover:bg-gray-900 transition"
                      >
                        Explore Products
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function getStatusBadge(status: string) {
  const normalizedStatus = status?.toLowerCase() || "pending"
  
  const statusConfig = {
    delivered: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: "Delivered" },
    shipped: { bg: "bg-blue-100", text: "text-blue-700", icon: Truck, label: "Shipped" },
    processing: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Processing" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Confirmed" },
    pending: { bg: "bg-gray-100", text: "text-gray-700", icon: Clock, label: "Pending" },
  }

  const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon size={14} />
      {config.label}
    </span>
  )
}
