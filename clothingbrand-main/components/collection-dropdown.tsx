"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

interface MenuItem {
  label: string
  href: string
}

interface CategorySection {
  title: string
  color: string
  items: MenuItem[]
}

const categories: CategorySection[] = [
  /* ---------------------- MEN CLOTHING ---------------------- */
  {
    title: "Men Clothing",
    color: "text-gray-800",
    items: [
      { label: "Shirts", href: "/shop?category=Shirt" },
      { label: "T-Shirts", href: "/shop?category=T-Shirt" },
      { label: "Polo", href: "/shop?category=Polo" },
      { label: "Jeans", href: "/shop?category=Jeans" },
      { label: "Trouser", href: "/shop?category=Trouser" },
    ],
  },

  /* ---------------------- TOPWEAR GROUP ---------------------- */
  {
    title: "Topwear",
    color: "text-gray-800",
    items: [
      { label: "T-Shirts", href: "/shop?category=T-Shirt" },
      { label: "Shirts", href: "/shop?category=Shirt" },
      { label: "Sweatshirts", href: "/shop?category=Sweatshirt" },
      { label: "Polo T-Shirts", href: "/shop?category=Polo" },
    ],
  },

  /* ---------------------- WINTERWEAR ---------------------- */
  {
    title: "Winterwear",
    color: "text-gray-800",
    items: [
      { label: "Sweater", href: "/shop?category=Sweater" },
      { label: "Jackets", href: "/shop?category=Jacket" },
      { label: "Sweatshirts", href: "/shop?category=Sweatshirt" },
    ],
  },
]


interface CollectionDropdownProps {
  variant?: "navbar" | "floating"
}

export default function CollectionDropdown({ variant = "navbar" }: CollectionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const hoverTimeout = useRef<number | null>(null)

  // Keep menu open briefly after mouse leave to avoid immediate close
  const openMenu = () => {
    if (hoverTimeout.current) {
      window.clearTimeout(hoverTimeout.current)
      hoverTimeout.current = null
    }
    setIsOpen(true)
  }

  const closeMenuWithDelay = () => {
    if (hoverTimeout.current) window.clearTimeout(hoverTimeout.current)
    hoverTimeout.current = window.setTimeout(() => {
      setIsOpen(false)
      hoverTimeout.current = null
    }, 200) // slight delay before closing
  }

  const baseStyles =
    variant === "floating"
      ? "flex items-center gap-0 px-4 py-0 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-full hover:bg-muted/30"
      : "flex items-center gap-0 px-3 py-0 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded transition duration-200"

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenuWithDelay}
    >
      {/* Collection Button */}
      <button className={baseStyles} aria-label="Collection" aria-expanded={isOpen}>
        Collection
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu - Shows on hover */}
{isOpen && (
  <div
    className="fixed left-1/2 -translate-x-1/2 bg-white shadow-2xl z-50 w-[85vw] max-w-[1200px] border-t border-gray-200 rounded-b-lg"
    style={{
      top: variant === "floating" ? "calc(2.625rem + 8px)" : "calc(2.125rem + 8px)",
    }}
    onMouseEnter={openMenu}
    onMouseLeave={closeMenuWithDelay}
  >
    <div className="w-full px-12 py-8">
      <div className="grid grid-cols-3 gap-x-16 gap-y-8">
        {categories.map((category, index) => (
          <div key={index} className="space-y-3">
            <h3
              className={`font-bold text-xs ${category.color} tracking-wider uppercase mb-3`}
            >
              {category.title}
            </h3>

            <ul className="space-y-1.5">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-black transition-colors duration-150 block py-0.5 hover:translate-x-1 transform transition-transform"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
)}


    </div>
  )
}
