"use client"

import { useState } from "react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const [isCheckoutReady, setIsCheckoutReady] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 5000 ? 0 : 200
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 pb-24 md:pb-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

          <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Explore our collection and add some hoodies to your cart.</p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-black text-white rounded hover:bg-gray-800 transition font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 md:py-12 px-4 md:px-8 pb-20 md:pb-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.color}-${item.size}`}
                    className="border-b border-gray-200 p-4 md:p-6 flex gap-4 md:gap-6"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow">
                      <Link href={`/product/${item.id}`} className="hover:text-gray-600 transition">
                        <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                      </Link>
                      <div className="text-sm text-gray-600 mb-2">
                        {item.color && <span>Color: {item.color} | </span>}
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                      <p className="text-lg font-bold text-black">₹{item.price.toLocaleString("en-IN")}</p>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.id, Math.max(1, Number.parseInt(e.target.value) || 1))
                          }
                          className="w-12 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded transition"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-bold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-red-50 rounded transition text-red-600"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="mt-4 flex justify-between items-center">
                <Link href="/shop" className="text-black font-semibold hover:text-gray-600 transition">
                  ← Continue Shopping
                </Link>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear the cart?")) {
                      clearCart()
                    }
                  }}
                  className="text-red-600 font-semibold hover:text-red-800 transition"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && <p className="text-xs text-gray-500">Free shipping on orders above ₹5,000</p>}
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8% GST)</span>
                    <span>₹{tax.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full block text-center px-6 py-3 bg-black text-white rounded font-semibold hover:bg-gray-800 transition mb-3"
                >
                  Proceed to Checkout
                </Link>

                <button
                  onClick={() => setIsCheckoutReady(!isCheckoutReady)}
                  className="w-full px-6 py-3 border-2 border-black text-black rounded font-semibold hover:bg-gray-100 transition text-center"
                >
                  Continue Shopping
                </button>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-semibold mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition text-sm">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Items in cart</span>
                    <span className="font-semibold text-black">{items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total quantity</span>
                    <span className="font-semibold text-black">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  )
}
