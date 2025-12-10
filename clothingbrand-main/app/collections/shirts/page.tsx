"use client"

import { Suspense } from "react"
import Footer from "@/components/footer"
import { CollectionPageContent } from "@/components/collection-page-content"

export default function ShirtsPage() {
  return (
    <Suspense
      fallback={
        <>
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
        category="Shirts"
        title="Premium Shirts"
        description="Premium quality shirts for every style and occasion"
      />
    </Suspense>
  )
}
