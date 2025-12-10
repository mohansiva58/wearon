"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, ShoppingCart, Heart, UserCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"

export default function BottomNav() {
  const pathname = usePathname()
  const { user, setShowLoginModal } = useAuth()
  const { items } = useCart()
  const cartCount = items.length

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/shop",
      label: "Shop",
      icon: ShoppingBag,
      active: pathname === "/shop" || pathname?.startsWith("/product"),
    },
    {
      href: "/cart",
      label: "Cart",
      icon: ShoppingCart,
      active: pathname === "/cart" || pathname === "/checkout",
      badge: cartCount > 0 ? cartCount : null,
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      icon: Heart,
      active: pathname === "/wishlist",
    },
  ]

  const handleLoginClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      setShowLoginModal(true)
    }
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0  bg-white border-t border-gray-200 z-40 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all relative ${
                item.active
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-700 active:bg-gray-100"
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={item.active ? 2.5 : 2}
                  className={item.active ? "fill-black/10" : ""}
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium ${
                  item.active ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
              {item.active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
              )}
            </Link>
          )
        })}

        {/* Login/Profile */}
        <Link
          href={user ? "/profile" : "#"}
          onClick={handleLoginClick}
          className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all relative ${
            pathname === "/profile" || pathname === "/my-orders"
              ? "text-black"
              : "text-gray-500 hover:text-gray-700 active:bg-gray-100"
          }`}
        >
          <div className="relative">
            {user && user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-6 h-6 rounded-full border-2 border-current"
              />
            ) : (
              <UserCircle
                size={22}
                strokeWidth={
                  pathname === "/profile" || pathname === "/my-orders" ? 2.5 : 2
                }
                className={
                  pathname === "/profile" || pathname === "/my-orders"
                    ? "fill-black/10"
                    : ""
                }
              />
            )}
          </div>
          <span
            className={`text-[10px] mt-1 font-medium ${
              pathname === "/profile" || pathname === "/my-orders"
                ? "font-semibold"
                : ""
            }`}
          >
            {user ? "Profile" : "Login"}
          </span>
          {(pathname === "/profile" || pathname === "/my-orders") && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
          )}
        </Link>
      </div>
    </nav>
  )
}
