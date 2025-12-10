"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, FileJson, Download } from "lucide-react"

export default function BulkUploadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [jsonInput, setJsonInput] = useState("")
  const [result, setResult] = useState<any>(null)

  const sampleProduct = {
    name: "Sample T-Shirt",
    subtitle: "Comfortable cotton t-shirt",
    description: "High-quality cotton t-shirt perfect for everyday wear",
    longDescription: "This premium cotton t-shirt offers exceptional comfort and style...",
    mrp: 999,
    price: 699,
    images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    colors: ["Black", "White", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    category: "T-Shirts",
    gender: "Unisex",
    features: ["100% Cotton", "Machine Washable", "Breathable"],
    fabricCare: ["Machine wash cold", "Tumble dry low", "Do not bleach"],
    stockQuantity: 100,
    inStock: true,
    sku: "TSH-001",
  }

  const handleBulkUpload = async () => {
    setLoading(true)
    setResult(null)

    try {
      const products = JSON.parse(jsonInput)

      if (!Array.isArray(products)) {
        alert("JSON must be an array of products")
        setLoading(false)
        return
      }

      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      })

      const data = await res.json()

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          count: data.count,
        })
        setJsonInput("")
        setTimeout(() => {
          router.push("/admin/dashboard")
        }, 2000)
      } else {
        setResult({
          success: false,
          error: data.error,
          insertedCount: data.insertedCount,
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Failed to parse JSON or upload products",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = [sampleProduct, { ...sampleProduct, name: "Sample Product 2", sku: "TSH-002" }]
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "bulk-products-template.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadSample = () => {
    const template = [sampleProduct, { ...sampleProduct, name: "Sample Product 2", sku: "TSH-002" }]
    setJsonInput(JSON.stringify(template, null, 2))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Product Upload</h1>
          <p className="mt-2 text-gray-600">Upload multiple products at once using JSON format</p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Download size={18} className="mr-2" />
              Download Template
            </button>
            <button
              onClick={loadSample}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <FileJson size={18} className="mr-2" />
              Load Sample
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Download the template to see the required JSON structure, or load a sample to get started.
          </p>
        </div>

        {/* JSON Input */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Products JSON Array
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your products JSON array here..."
            className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
          <p className="mt-2 text-sm text-gray-500">
            Enter a JSON array of product objects. Each product should follow the template structure.
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleBulkUpload}
          disabled={loading || !jsonInput.trim()}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={18} className="mr-2" />
              Upload Products
            </>
          )}
        </button>

        {/* Result */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              result.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <h3
              className={`font-semibold mb-2 ${result.success ? "text-green-800" : "text-red-800"}`}
            >
              {result.success ? "Success!" : "Error"}
            </h3>
            <p className={result.success ? "text-green-700" : "text-red-700"}>
              {result.success
                ? `${result.message} (${result.count} products created)`
                : result.error}
            </p>
            {result.insertedCount > 0 && (
              <p className="text-orange-700 mt-2">
                Partially completed: {result.insertedCount} products were created successfully.
              </p>
            )}
          </div>
        )}

        {/* Example */}
        <div className="mt-6 bg-gray-100 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Example Product Structure:</h3>
          <pre className="bg-white p-4 rounded border border-gray-300 overflow-x-auto text-xs">
            {JSON.stringify(sampleProduct, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
