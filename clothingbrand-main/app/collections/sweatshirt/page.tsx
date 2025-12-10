"use client"

import { Suspense } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { CollectionPageContent } from "@/components/collection-page-content"

export default function Page() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
          <Footer />
        </>
      }
    >
      <CollectionPageContent
        category="Activewear"
        title="Active Sweatshirts"
        description="Performance-ready sweatshirts for active lifestyle"
      />
    </Suspense>
  )
}
