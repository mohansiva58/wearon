"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit, Package, ShoppingCart } from "lucide-react"

interface Product {
  _id?: string
  id?: number
  name: string
  price: number
  mrp: number
  stock: number
  category: string
}

interface Order {
  _id?: string
  id: string
  customer: string
  amount: number
  status: "Processing" | "In Transit" | "Delivered"
  date: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders">("dashboard")
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    mrp: 0,
    stock: 0,
    category: "Hoodies",
  })

  useEffect(() => {
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      const result = await response.json()
      if (result.success) {
        setProducts(result.data || [])
        console.log("[v0] Products fetched:", result.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching products:", error)
      // Fallback to initial products if MongoDB connection fails
      setProducts([
        {
          id: 1,
          name: "BOXY FIT EMBROIDERED SHIRT",
          price: 1749,
          mrp: 3499,
          stock: 45,
          category: "Shirts",
        },
        {
          id: 2,
          name: "Urban Grey Hoodie",
          price: 2199,
          mrp: 2799,
          stock: 32,
          category: "Hoodies",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const result = await response.json()
      if (result.success) {
        setOrders(result.data || [])
        console.log("[v0] Orders fetched:", result.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching orders:", error)
      // Fallback to initial orders
      setOrders([
        {
          id: "ORD-001",
          customer: "John Doe",
          amount: 5497,
          status: "Delivered",
          date: "2024-11-01",
        },
        {
          id: "ORD-002",
          customer: "Jane Smith",
          amount: 2399,
          status: "In Transit",
          date: "2024-11-02",
        },
      ])
    }
  }

  const handleAddProduct = async () => {
    try {
      if (editingProduct && editingProduct._id) {
        const response = await fetch(`/api/products/${editingProduct._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        const result = await response.json()
        if (result.success) {
          console.log("[v0] Product updated successfully")
          fetchProducts()
        }
      } else {
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        const result = await response.json()
        if (result.success) {
          console.log("[v0] Product added successfully")
          fetchProducts()
        }
      }
      setFormData({ name: "", price: 0, mrp: 0, stock: 0, category: "Hoodies" })
      setEditingProduct(null)
      setShowAddProduct(false)
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      alert("Error saving product")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
        })
        const result = await response.json()
        if (result.success) {
          console.log("[v0] Product deleted successfully")
          fetchProducts()
        }
      } catch (error) {
        console.error("[v0] Error deleting product:", error)
        alert("Error deleting product")
      }
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
      category: product.category,
    })
    setShowAddProduct(true)
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0)
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-col md:flex-row gap-4">
          <h1 className="text-3xl font-bold">Refero ADMIN</h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition text-sm"
          >
            Back to Store
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-8 px-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-4 px-2 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "dashboard"
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`py-4 px-2 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "products" ? "border-black text-black" : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-4 px-2 font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "orders" ? "border-black text-black" : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">TOTAL PRODUCTS</p>
                  <p className="text-4xl font-bold mt-2">{products.length}</p>
                </div>
                <Package size={40} className="text-gray-300" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">TOTAL ORDERS</p>
                  <p className="text-4xl font-bold mt-2">{orders.length}</p>
                </div>
                <ShoppingCart size={40} className="text-gray-300" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">TOTAL REVENUE</p>
                  <p className="text-3xl font-bold mt-2">₹{totalRevenue.toLocaleString("en-IN")}</p>
                </div>
                <ShoppingCart size={40} className="text-gray-300" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">TOTAL STOCK</p>
                  <p className="text-4xl font-bold mt-2">{totalStock}</p>
                </div>
                <Package size={40} className="text-gray-300" />
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-col md:flex-row gap-4">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <button
                onClick={() => {
                  setShowAddProduct(true)
                  setEditingProduct(null)
                  setFormData({ name: "", price: 0, mrp: 0, stock: 0, category: "Hoodies" })
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition whitespace-nowrap"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>

            {showAddProduct && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="number"
                    placeholder="MRP"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="Hoodies">Hoodies</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Limited Edition">Limited Edition</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-4 flex-col sm:flex-row">
                  <button
                    onClick={handleAddProduct}
                    className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                  >
                    {editingProduct ? "Update" : "Add"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddProduct(false)
                      setEditingProduct(null)
                    }}
                    className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Name</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold hidden sm:table-cell">Category</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Price</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold hidden md:table-cell">Stock</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id || product.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4">{product.name}</td>
                      <td className="px-4 md:px-6 py-4 hidden sm:table-cell">{product.category}</td>
                      <td className="px-4 md:px-6 py-4">₹{product.price.toLocaleString("en-IN")}</td>
                      <td className="px-4 md:px-6 py-4 hidden md:table-cell">{product.stock}</td>
                      <td className="px-4 md:px-6 py-4">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-blue-600 hover:underline mr-3"
                          title="Edit"
                        >
                          <Edit size={18} className="inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id || String(product.id))}
                          className="text-red-600 hover:underline"
                          title="Delete"
                        >
                          <Trash2 size={18} className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold">Order Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Order ID</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold hidden sm:table-cell">Customer</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Amount</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Status</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id || order.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4 font-semibold">{order.id}</td>
                      <td className="px-4 md:px-6 py-4 hidden sm:table-cell">{order.customer}</td>
                      <td className="px-4 md:px-6 py-4">₹{order.amount.toLocaleString("en-IN")}</td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "In Transit"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 hidden md:table-cell">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
