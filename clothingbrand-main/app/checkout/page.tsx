"use client"

import type React from "react"
import { useState, useEffect } from "react"
import RazorpayPayment from "@/components/razorpay-payment"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle, Plus, Minus } from "lucide-react"

export default function CheckoutPage() {
  const { items, total, clearCart, updateQuantity, removeItem } = useCart()
  const { user, loading: authLoading, setShowLoginModal } = useAuth()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")

  const minOnlineAmount = 500
  const codAdvancePercentage = 10
  const codAdvanceAmount = Math.round(total * (codAdvancePercentage / 100))
  const taxRate = 0.08 // 8% tax
  const totalWithTax = total + Math.round(total * taxRate)

  // Check if user is logged in, if not show login modal
  useEffect(() => {
    if (!authLoading && !user) {
      setShowLoginModal(true)
    }
  }, [authLoading, user, setShowLoginModal])

  // Pre-fill user details if logged in and load saved addresses
  useEffect(() => {
    if (user && !shippingAddress.email) {
      // Load saved addresses from localStorage
      const saved = localStorage.getItem(`addresses_${user.uid}`)
      if (saved) {
        const addresses = JSON.parse(saved)
        setSavedAddresses(addresses)
        if (addresses.length > 0) {
          // Select the first address by default
          setSelectedAddressIndex(0)
          setShippingAddress(addresses[0])
        } else {
          // No saved addresses, show form
          setShowNewAddressForm(true)
          setShippingAddress(prev => ({
            ...prev,
            name: user.displayName || "",
            email: user.email || "",
            phone: user.phoneNumber || "",
          }))
        }
      } else {
        // No saved addresses, show form
        setShowNewAddressForm(true)
        setShippingAddress(prev => ({
          ...prev,
          name: user.displayName || "",
          email: user.email || "",
          phone: user.phoneNumber || "",
        }))
      }
    }
  }, [user])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveAddress = () => {
    if (!user) return

    const newAddress = { ...shippingAddress }
    const updatedAddresses = selectedAddressIndex !== null 
      ? savedAddresses.map((addr, idx) => idx === selectedAddressIndex ? newAddress : addr)
      : [...savedAddresses, newAddress]

    setSavedAddresses(updatedAddresses)
    localStorage.setItem(`addresses_${user.uid}`, JSON.stringify(updatedAddresses))
    
    if (selectedAddressIndex === null) {
      setSelectedAddressIndex(updatedAddresses.length - 1)
    }
    
    setShowNewAddressForm(false)
  }

  const handleSelectAddress = (index: number) => {
    setSelectedAddressIndex(index)
    setShippingAddress(savedAddresses[index])
    setShowNewAddressForm(false)
  }

  const handleAddNewAddress = () => {
    setSelectedAddressIndex(null)
    setShippingAddress({
      name: user?.displayName || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    })
    setShowNewAddressForm(true)
  }

  const handleCODOrder = async () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setPaymentStatus("processing")
    setError("")

    try {
      // Prepare order data
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: items.map(item => ({
          productId: String(item.id), // Convert to string for MongoDB ObjectId
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: "cod",
        paymentStatus: "pending",
        subtotal: total,
        tax: Math.round(total * taxRate),
        total: totalWithTax,
      }

      // Save order to MongoDB
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create order")
      }

      console.log("COD Order created:", result.order)
      
      setPaymentStatus("success")
      setOrderPlaced(true)
      clearCart()
      
      setTimeout(() => {
        router.push(`/order-confirmation?orderNumber=${result.order.orderNumber}`)
      }, 2000)
    } catch (err) {
      setPaymentStatus("failed")
      setError(err instanceof Error ? err.message : "Order placement failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (response: any) => {
    console.log("Payment successful:", response)
    setPaymentStatus("processing")
    setError("")

    try {
      // Prepare order data with Razorpay payment details
      const orderData = {
        userId: user?.uid,
        userEmail: user?.email,
        items: items.map(item => ({
          productId: String(item.id), // Convert to string for MongoDB ObjectId
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: "online",
        paymentStatus: "paid",
        paymentDetails: {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          method: "razorpay",
        },
        subtotal: total,
        tax: Math.round(total * taxRate),
        total: totalWithTax,
      }

      // Save order to MongoDB
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const result = await orderResponse.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create order")
      }

      console.log("Online Order created:", result.order)
      
      setPaymentStatus("success")
      setOrderPlaced(true)
      clearCart()
      
      setTimeout(() => {
        router.push(`/order-confirmation?orderNumber=${result.order.orderNumber}`)
      }, 2000)
    } catch (err) {
      setPaymentStatus("failed")
      setError(err instanceof Error ? err.message : "Failed to save order. Please contact support.")
    }
  }

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error)
    setPaymentStatus("failed")
    setError(error.message || "Payment failed. Please try again.")
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <main className="bg-white py-20 pb-24 md:pb-20 text-center">
        <p className="text-xl mb-4">Your cart is empty</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </main>
    )
  }

  // Show success message after order is placed
  if (orderPlaced) {
    return (
      <main className="bg-white py-20 pb-24 md:pb-20">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="mb-6 flex justify-center">
            <CheckCircle size={64} className="text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been confirmed and will be processed shortly. You'll receive a confirmation email soon.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to order confirmation...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-gray-50 py-8 md:py-12 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-8 md:mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 md:p-4">
                  <p className="text-sm text-blue-900">
                    Please{" "}
                    <Link href="/login" className="font-semibold hover:underline">
                      login
                    </Link>{" "}
                    to continue with checkout
                  </p>
                </div>
              )}
              
              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-bold">Shipping Address</h2>
                  {savedAddresses.length > 0 && !showNewAddressForm && (
                    <button
                      onClick={handleAddNewAddress}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <div className="space-y-3 mb-4">
                    {savedAddresses.map((addr, index) => (
                      <label
                        key={index}
                        className={`flex items-start gap-3 p-3 md:p-4 border rounded cursor-pointer transition ${
                          selectedAddressIndex === index
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressIndex === index}
                          onChange={() => handleSelectAddress(index)}
                          className="mt-1"
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-semibold">{addr.name}</p>
                          <p className="text-gray-600">{addr.phone}</p>
                          <p className="text-gray-600">{addr.address}</p>
                          <p className="text-gray-600">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Address Form */}
                {showNewAddressForm && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name *"
                        value={shippingAddress.name}
                        onChange={handleAddressChange}
                        className="col-span-1 md:col-span-2 px-3 md:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={shippingAddress.email}
                        onChange={handleAddressChange}
                        className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number *"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <input
                        type="text"
                        name="address"
                        placeholder="Address *"
                        value={shippingAddress.address}
                        onChange={handleAddressChange}
                        className="col-span-1 md:col-span-2 px-3 md:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <input
                        type="text"
                        name="pincode"
                        placeholder="Pincode"
                        value={shippingAddress.pincode}
                        onChange={handleAddressChange}
                        className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleSaveAddress}
                        disabled={!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address}
                        className="px-4 py-2 bg-black text-white rounded text-sm font-medium hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Save Address
                      </button>
                      {savedAddresses.length > 0 && (
                        <button
                          onClick={() => {
                            setShowNewAddressForm(false)
                            if (savedAddresses.length > 0) {
                              setSelectedAddressIndex(0)
                              setShippingAddress(savedAddresses[0])
                            }
                          }}
                          className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
                <h2 className="text-lg md:text-xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 md:p-4 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-sm md:text-base">Cash on Delivery</span>
                      <p className="text-xs text-gray-600 mt-1">Pay when your order arrives at your doorstep</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 md:p-4 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === "online"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-sm md:text-base">Pay Online (Razorpay)</span>
                      <p className="text-xs text-gray-600 mt-1">UPI, Cards, Net Banking, Wallets</p>
                      {paymentMethod === "online" && (
                        <p className="text-xs text-green-600 font-medium mt-1">✓ Secure payment via Razorpay</p>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              
            </div>

            <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200 h-fit lg:sticky lg:top-24">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Order Summary</h2>

              {paymentStatus === "success" && (
                <div className="mb-4 md:mb-6 p-3 bg-green-50 border border-green-200 rounded flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0 md:w-5 md:h-5" />
                  <p className="text-xs md:text-sm text-green-700">Payment processed successfully!</p>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="mb-4 md:mb-6 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0 md:w-5 md:h-5" />
                  <p className="text-xs md:text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Order Items */}
              <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Items ({items.length})</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{item.name}</p>
                        <p className="text-xs text-gray-600 mb-1">
                          ₹{item.price.toLocaleString("en-IN")} each
                        </p>
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1)
                              } else {
                                removeItem(item.id)
                              }
                            }}
                            className="w-5 h-5 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-medium min-w-[20px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="font-semibold text-xs flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 pb-4 md:pb-6 border-b">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span>₹{Math.round(total * taxRate).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex justify-between text-base md:text-lg font-bold mb-4 md:mb-6">
                <span>Total</span>
                <span>₹{totalWithTax.toLocaleString("en-IN")}</span>
              </div>

              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded">
                <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
                <p className="text-xs md:text-sm capitalize font-medium">
                  {paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (Razorpay)"}
                </p>
                {paymentMethod === "cod" && (
                ""
                )}
                {paymentMethod === "online" && (
                  <div className="mt-3 p-2 md:p-3 bg-green-50 border border-green-200 rounded text-xs">
                  </div>
                )}
              </div>

              {paymentMethod === "online" ? (
                <RazorpayPayment
                  amount={totalWithTax}
                  orderId={`ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`}
                  customerDetails={{
                    name: shippingAddress.name,
                    email: shippingAddress.email,
                    phone: shippingAddress.phone,
                  }}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                  buttonText={`Pay ₹${totalWithTax.toLocaleString("en-IN")}`}
                  buttonClassName={`w-full py-2.5 md:py-3 text-sm md:text-base rounded font-semibold transition ${
                    user && !orderPlaced && !shippingAddress.name && !shippingAddress.phone && !shippingAddress.address
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-900"
                  }`}
                />
              ) : (
                <button
                  onClick={handleCODOrder}
                  disabled={!user || orderPlaced || loading || paymentStatus === "processing" || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address}
                  className={`w-full py-2.5 md:py-3 text-sm md:text-base rounded font-semibold transition ${
                    user && !orderPlaced && !(loading || paymentStatus === "processing") && shippingAddress.name && shippingAddress.phone && shippingAddress.address
                      ? "bg-black text-white hover:bg-gray-900"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Processing Order...
                    </span>
                  ) : paymentStatus === "success" ? (
                    "Order Confirmed!"
                  ) : (
                    `Place COD Order - ₹${totalWithTax.toLocaleString("en-IN")}`
                  )}
                </button>
              )}
              {!user && <p className="text-xs md:text-sm text-gray-600 text-center mt-3">Login required to proceed</p>}
            </div>
          </div>
        </div>
      </main>
  )
}
