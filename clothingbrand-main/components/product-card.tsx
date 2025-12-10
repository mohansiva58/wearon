"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ShoppingCart, Heart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useWishlist } from "@/hooks/use-wishlist"

interface ProductCardProps {
  product: {
    id: number | string
    name: string
    price: number
    mrp?: number
    discount?: number
    image: string
    colors: string[]
    stockQuantity?: number
    inStock?: boolean
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const { addItem } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const productId = product.id  // Keep as-is (string or number)
  const inWishlist = isInWishlist(productId)
  const isOutOfStock = product.stockQuantity === 0 || product.inStock === false

  const handleAddToCart = () => {
    if (isOutOfStock) return
    addItem({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      color: selectedColor,
      quantity: 1,
    })
  }

  return (
    <div className="group">
      <Link href={`/product/${product.id}`} className="block">
  <div
    className="relative overflow-hidden bg-gray-200 rounded-lg mb-2 md:mb-3 cursor-pointer"
    style={{ aspectRatio: '3 / 4' }}
  >
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 33vw"
            className="object-cover group-hover:scale-110 transition duration-300"
            loading="lazy"
            unoptimized
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
          />
          {isOutOfStock && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg z-10">
              OUT OF STOCK
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center gap-3 md:gap-4">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleWishlist({ id: productId, name: product.name, price: product.price, image: product.image })
              }}
              className={`p-2 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition transform group-hover:scale-100 scale-75 ${
                inWishlist ? "bg-red-500 text-white" : "bg-white text-black"
              }`}
            >
              <Heart size={18} className={`md:w-5 md:h-5 ${inWishlist ? "fill-red-500" : ""}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleAddToCart()
              }}
              disabled={isOutOfStock}
              className={`p-2 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition transform group-hover:scale-100 scale-75 ${
                isOutOfStock 
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
                  : "bg-black text-white"
              }`}
            >
              <ShoppingCart size={18} className="md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </Link>

      <Link href={`/product/${product.id}`} className="hover:underline">
        <h3 className="text-xs md:text-base font-bold mb-1 md:mb-2 line-clamp-2 leading-tight">{product.name}</h3>
      </Link>

      <div className="mb-2 md:mb-3">
        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
          {product.mrp && (
            <>
              <p className="text-xs md:text-sm text-gray-600">MRP</p>
              <p className="text-xs md:text-base text-gray-400 line-through">₹{product.mrp.toLocaleString("en-IN")}</p>
            </>
          )}
          <p className="font-bold text-sm md:text-xl">₹{product.price.toLocaleString("en-IN")}</p>
          {product.discount && (
            <span className="text-xs md:text-sm text-red-600 font-bold">{product.discount}%</span>
          )}
        </div>
      </div>

      <div className="flex gap-1 md:gap-2 flex-wrap">
        {product.colors.map((color) => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1 border-2 rounded transition ${
              selectedColor === color ? "border-black bg-black text-white" : "border-gray-300 hover:border-black"
            }`}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  )
}
