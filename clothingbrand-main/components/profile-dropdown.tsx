"use client"

import { User, LogOut } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-100">
        <User size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded shadow-lg w-48 p-4 z-50">
          {user ? (
            <>
              <p className="text-sm font-medium mb-3">{user.email}</p>
              <Link href="/profile" className="block text-sm py-2 hover:bg-gray-100 px-2 rounded">
                My Profile
              </Link>
              <Link href="/orders" className="block text-sm py-2 hover:bg-gray-100 px-2 rounded">
                My Orders
              </Link>
              <button
                onClick={logout}
                className="w-full text-left text-sm py-2 hover:bg-gray-100 px-2 rounded flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm py-2 hover:bg-gray-100 px-2 rounded">
                Login
              </Link>
              <Link href="/register" className="block text-sm py-2 hover:bg-gray-100 px-2 rounded">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
