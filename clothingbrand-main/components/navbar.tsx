"use client"

import Link from "next/link"
import { useState, useEffect, Suspense, useRef, useCallback } from "react"
import { Search, X, Menu, Heart, ShoppingCart, User, LogOut, Home } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"

function NavbarContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [showUserMenu, setShowUserMenu] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const searchWrapperRef = useRef<HTMLDivElement | null>(null)
  const userMenuRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { items } = useCart()
  const { user, loading, setShowLoginModal, logout } = useAuth()
  const cartCount = items.length

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Sync search query with URL parameter
  useEffect(() => {
    const urlSearchQuery = searchParams.get("search")
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery)
      setIsSearchOpen(true)
    }
  }, [searchParams])

  // Focus input when inline search opens (desktop) and handle outside/Esc
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!isSearchOpen) return
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsSearchOpen(false)
    }
    document.addEventListener("mousedown", handleDocClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleDocClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [isSearchOpen])

  // Handle user menu outside click
  useEffect(() => {
    function handleUserMenuClick(e: MouseEvent) {
      if (!showUserMenu) return
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowUserMenu(false)
    }
    document.addEventListener("mousedown", handleUserMenuClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleUserMenuClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [showUserMenu])

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() && isSearchOpen) {
      router.push(`/shop?search=${encodeURIComponent(debouncedQuery)}`)
    }
  }, [debouncedQuery, router, isSearchOpen])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setIsSearchOpen(false)
    if (pathname === "/shop" && searchParams.get("search")) {
      router.push("/shop")
    }
  }

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
    router.push("/")
  }

  return (
  <nav className="w-full bg-white sticky top-0 z-50 border-b border-gray-200 mb-2.5 sm:mb-0">
      {/* Main Navbar */}
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 md:py-4 max-w-7xl mx-auto w-full">
        {/* Left - Logo on desktop, empty spacer on mobile */}
        <div className="flex items-center gap-2 md:gap-0 flex-1 md:flex-none">
          <div className="hidden md:flex items-center">
            <Link href="/" className="flex items-center" aria-label="Home">
              <img
                src="https://images.yourstory.com/cs/images/companies/shoprarerabbitlogo-1719813730851.jpg?fm=auto&ar=1%3A1&mode=fill&fill=solid&fill-color=fff&format=auto&w=1920&q=75"
                alt="ROFERO"
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
              <span className="text-xs font-semibold tracking-widest hidden sm:inline ml-2">
                ROFERO
              </span>
            </Link>
          </div>
        </div>

        {/* Center - Logo on mobile only */}
        <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
          <Link href="/" className="flex items-center" aria-label="Home">
            <img
              src="https://images.yourstory.com/cs/images/companies/shoprarerabbitlogo-1719813730851.jpg?fm=auto&ar=1%3A1&mode=fill&fill=solid&fill-color=fff&format=auto&w=1920&q=75"
              alt="ROFERO"
              className="w-12 h-12 object-contain"
            />
          </Link>
        </div>

        {/* Right - Icons and Collection */}
        <div className="flex items-center gap-2 md:gap-4 md:flex-1 md:justify-end">
          <div ref={searchWrapperRef} className="relative flex items-center">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-gray-100 rounded transition"
              aria-label="Search"
            >
              <Search size={18} className="md:w-5 md:h-5" />
            </button>

            {/* Inline expanding input for all screens */}
            <div className="flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className={`transition-all duration-200 ease-in-out text-sm rounded focus:outline-none focus:ring-2 focus:ring-black ${
                  isSearchOpen
                    ? "w-full md:w-64 px-3 py-1 border border-gray-300 ml-2 opacity-100"
                    : "w-0 md:w-0 px-0 py-0 border-0 opacity-0"
                }`}
                aria-label="Search products"
              />
              {searchQuery && isSearchOpen && (
                <button
                  onClick={handleClearSearch}
                  className="ml-2 p-1 hover:bg-gray-100 rounded-full transition"
                  aria-label="Clear search"
                >
                  <X size={14} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <Link
            href="/wishlist"
            className="p-2 hover:bg-gray-100 rounded transition hidden sm:flex items-center justify-center"
            aria-label="Wishlist"
          >
            <Heart size={18} className="md:w-5 md:h-5" />
          </Link>

          <Link
            href="/cart"
            className="p-2 hover:bg-gray-100 rounded transition relative hidden md:flex items-center justify-center"
            aria-label="Cart"
          >
            <ShoppingCart size={18} className="md:w-5 md:h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {!loading && (
            <div ref={userMenuRef} className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 hover:bg-gray-100 rounded transition hidden md:flex items-center justify-center"
                    aria-label="Account"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <User size={18} className="md:w-5 md:h-5" />
                    )}
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.displayName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/my-orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Wishlist
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="p-2 hover:bg-gray-100 rounded transition hidden md:flex items-center justify-center"
                  aria-label="Login"
                >
                  <User size={18} className="md:w-5 md:h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Bar (handled inline via the icon wrapper; mobile full-width removed) */}
    </nav>
  )
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <nav className="w-full bg-white sticky top-0 z-50 border-b border-gray-200">
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-2 md:py-3 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="w-8 h-8" />
            </div>
            <Link href="/" className="flex items-center" aria-label="Home">
              <img
                src="https://images.yourstory.com/cs/images/companies/shoprarerabbitlogo-1719813730851.jpg?fm=auto&ar=1%3A1&mode=fill&fill=solid&fill-color=fff&format=auto&w=1920&q=75"
                alt="ROFERO"
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
              <span className="text-xs font-semibold tracking-widest hidden sm:inline ml-2">
                ROFERO
              </span>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="w-8 h-8" />
            </div>
          </div>
        </nav>
      }
    >
      <NavbarContent />
    </Suspense>
  )
}
