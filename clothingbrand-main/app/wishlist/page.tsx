"use client"

// Navbar and Footer are rendered globally in `app/layout.tsx`
import { Heart, Trash2 } from "lucide-react"
import { useWishlist } from "@/hooks/use-wishlist"
import { useCart } from "@/hooks/use-cart"
import Link from "next/link"

export default function WishlistPage() {
  const { items, removeItem, toggleWishlist } = useWishlist()
  const { addItem } = useCart()

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    })
  }

  return (
    <>
      <main className="bg-white min-h-screen pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">MY WISHLIST</h1>
            <p className="text-sm md:text-base text-gray-600">
              {items.length} item{items.length !== 1 ? "s" : ""} in your wishlist
            </p>
          </div>

          {items.length === 0 ? (
            /* Empty state with call to action */
            <div className="text-center py-12 md:py-16">
              <Heart size={40} className="md:w-12 md:h-12 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl md:text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
              <p className="text-sm md:text-base text-gray-600 mb-6">Save your favorite hoodies to your wishlist</p>
              <Link
                href="/shop"
                className="inline-block px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base bg-black text-white font-bold rounded hover:bg-gray-800 transition"
              >
                START SHOPPING
              </Link>
            </div>
          ) : (
            /* Wishlist items grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item.id} className="group">
                  <div className="relative overflow-hidden bg-gray-200 rounded-lg mb-3 md:mb-4 h-64 sm:h-72 md:h-80">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <button
                      onClick={() => toggleWishlist(item)}
                      className="absolute top-2 md:top-3 right-2 md:right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      title="Remove from wishlist"
                    >
                      <Heart size={18} className="md:w-5 md:h-5 fill-white text-white" />
                    </button>
                  </div>

                  <Link href={`/product/${item.id}`} className="hover:underline">
                    <h3 className="text-sm md:text-base font-bold mb-2 line-clamp-2">{item.name}</h3>
                  </Link>

                  <p className="text-base md:text-lg font-bold mb-3 md:mb-4">₹{item.price.toLocaleString("en-IN")}</p>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full py-2 text-sm bg-black text-white font-bold rounded hover:bg-gray-800 transition"
                    >
                      ADD TO CART
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-full py-2 text-sm border-2 border-gray-300 text-gray-700 font-bold rounded hover:border-red-500 hover:text-red-500 transition flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4" />
                      REMOVE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
