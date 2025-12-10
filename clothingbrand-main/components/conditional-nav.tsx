"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import { FloatingNav } from "@/components/floating-nav"
import BottomNav from "@/components/bottom-nav"

export default function ConditionalNav() {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")

  if (isAdminPage) {
    return null
  }

  return (
    <>
      <Navbar />
      <FloatingNav />
      <BottomNav />
    </>
  )
}
