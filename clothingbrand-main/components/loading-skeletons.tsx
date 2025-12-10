"use client"

export function ProductCardSkeleton() {
  return (
    <div className="group animate-pulse">
      <div className="relative overflow-hidden bg-gray-200 rounded-lg mb-2 md:mb-3" style={{ aspectRatio: '3 / 4' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
      </div>
      
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-10">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-64 space-y-6">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Products grid skeleton */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
            </div>
            
            <ProductGridSkeleton count={24} />
          </div>
        </div>
      </div>
    </div>
  )
}
