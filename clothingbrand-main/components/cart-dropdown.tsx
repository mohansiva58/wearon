"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import Link from "next/link"
import { useState } from "react"

export default function CartDropdown() {
  const { items, total } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-100 relative">
        <ShoppingCart size={20} />
        {items.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded shadow-lg w-80 p-4 z-50">
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b">
                    <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-12 h-12 object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x ₹{item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-semibold mb-3">Total: ₹{total}</p>
                <Link href="/checkout" className="block w-full bg-black text-white text-center py-2 rounded text-sm">
                  Go to Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
