"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import CollectionDropdown from "./collection-dropdown"

const navItems = [
   { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "My Orders", href: "/my-orders" },
  // { label: "Contact", href: "#contact" },
]

export function FloatingNav() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      // Always show on desktop, use scroll detection if needed
      setIsVisible(true)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={cn(
        "hidden lg:flex fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none",
      )}
    >
      <div className="flex items-center gap-6 px-8 py-3 bg-white rounded-full shadow-lg border border-border/50">
        {/* Navigation */}
        <nav className="flex items-center">
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-full hover:bg-muted/30"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Divider */}
        <div className="w-px h-6 bg-border/30"></div>

        {/* Collection Dropdown */}
        <CollectionDropdown variant="floating" />
      </div>
    </div>
  )
}
