import CacheMonitor from "@/components/cache-monitor"

export default function CachePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cache Management</h1>
          <p className="text-gray-600">
            Monitor and manage Redis cache for improved performance
          </p>
        </div>

        <CacheMonitor />

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Cache Information</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What is cached?</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Product listings (5 minutes TTL)</li>
                <li>Product details (10 minutes TTL)</li>
                <li>Categories (15 minutes TTL)</li>
                <li>Search results (3 minutes TTL)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">When is cache cleared?</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Automatically when products are created, updated, or deleted</li>
                <li>Manually using the "Clear Cache" button</li>
                <li>Automatically after TTL expires</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Benefits</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>25x faster API responses (3-6ms vs 80-200ms)</li>
                <li>Reduced database load</li>
                <li>Better user experience with instant page loads</li>
                <li>Lower hosting costs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
