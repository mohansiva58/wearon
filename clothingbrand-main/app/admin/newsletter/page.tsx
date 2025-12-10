"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Send, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function NewsletterPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [discount, setDiscount] = useState(20)
  const [productName, setProductName] = useState("Premium Midnight Black Hoodie")
  const [productPrice, setProductPrice] = useState(2599)
  const [validUntil, setValidUntil] = useState("2024-12-31")
  const [recipients, setRecipients] = useState("customer@example.com")
  const [sending, setSending] = useState(false)
  const [subs, setSubs] = useState<Array<{ email: string; name?: string; createdAt?: string }>>([])
  const [loadingSubs, setLoadingSubs] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  if (!user || user.email !== "admin@rarereabbit.com") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <Link href="/" className="inline-block px-6 py-2 bg-black text-white rounded hover:bg-gray-800">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const loadSubs = async () => {
      try {
        const res = await fetch('/api/admin/newsletter/subscribers')
        const json = await res.json()
        if (json?.success) setSubs(json.data || [])
      } finally {
        setLoadingSubs(false)
      }
    }
    loadSubs()
  }, [])

  const handleSendNewsletter = async () => {
    if (!recipients.trim()) {
      setMessage({ type: "error", text: "Please enter at least one email address" })
      return
    }

    setSending(true)
    setMessage(null)

    try {
      const emailList = recipients.split(",").map((e) => e.trim())

      for (const email of emailList) {
        const response = await fetch('/api/admin/newsletter/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientEmail: email,
            recipientName: email.split("@")[0],
            discount,
            productName,
            productPrice,
            validUntil,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send email')
        }
      }

      setMessage({
        type: "success",
        text: `Newsletter sent successfully to ${emailList.length} recipient(s)`,
      })

      setRecipients("")
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to send newsletter. Please try again.",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Refero NEWSLETTER</h1>
          <Link href="/admin" className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 transition text-sm">
            Back to Admin
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold mb-6">Send Promotional Email</h2>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
              ) : (
                <AlertCircle size={20} className="text-red-600 mt-0.5" />
              )}
              <p className={message.type === "success" ? "text-green-700" : "text-red-700"}>{message.text}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Product Details */}
            <div className="border-b pb-6">
              <h3 className="font-bold text-lg mb-4">Product Details</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
                <input
                  type="number"
                  placeholder="Product Price"
                  value={productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Discount %"
                    min="0"
                    max="100"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Offer Preview */}
            <div className="border-b pb-6">
              <h3 className="font-bold text-lg mb-4">Offer Preview</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Original Price: ₹{productPrice.toLocaleString("en-IN")}</p>
                <p className="text-lg font-bold mt-1">
                  Discounted Price: ₹{Math.round(productPrice * (1 - discount / 100)).toLocaleString("en-IN")}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Save: ₹{Math.round(productPrice * (discount / 100)).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-600 mt-3">Valid until: {validUntil}</p>
              </div>
            </div>

            {/* Recipients */}
            <div>
              <h3 className="font-bold text-lg mb-4">Recipients</h3>
              <textarea
                placeholder="Enter email addresses (comma separated)&#10;e.g., customer1@example.com, customer2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
              />
              <p className="text-xs text-gray-600 mt-2">
                {recipients.split(",").filter((e) => e.trim()).length} recipients
              </p>
            </div>

            <button
              onClick={handleSendNewsletter}
              disabled={sending}
              className="w-full py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <Send size={20} />
              {sending ? "Sending..." : "Send Newsletter"}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Subscribers</h2>
            <a href="/api/admin/newsletter/export" className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm">Export CSV</a>
          </div>
          {loadingSubs ? (
            <p className="text-gray-600">Loading subscribers...</p>
          ) : subs.length === 0 ? (
            <p className="text-gray-600">No subscribers yet.</p>
          ) : (
            <div className="overflow-auto -mx-4">
              <table className="min-w-full text-sm mx-4">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.email} className="border-b">
                      <td className="py-2 pr-4 font-mono">{s.email}</td>
                      <td className="py-2 pr-4">{s.name || '-'}</td>
                      <td className="py-2">{s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
