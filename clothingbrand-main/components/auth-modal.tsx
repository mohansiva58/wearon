"use client"

import { useState, useEffect } from "react"
import { X, Mail, Phone } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "login" | "register"
}

export default function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "phone">(defaultMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [acceptUpdates, setAcceptUpdates] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth()

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
      setError("")
    }
  }, [isOpen, defaultMode])

  // Close on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "register") {
        await registerWithEmail(email, password, name)
      } else {
        await loginWithEmail(email, password)
      }
      onClose()
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setError("")
    setLoading(true)

    try {
      await loginWithGoogle()
      onClose()
    } catch (err: any) {
      setError(err.message || "Google sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Phone authentication will be implemented separately
      setError("Phone authentication coming soon!")
    } catch (err: any) {
      setError(err.message || "Phone authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white border border-gray-200 rounded-full shadow-sm transition-colors z-10 flex items-center gap-1"
          title="Close"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header */}
        <div className="bg-black text-white p-8 pb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-wide">
            LET'S GET RARE!
          </h2>
          <p className="text-sm text-gray-300 mt-2">
            {mode === "register" ? "Create your account" : "Sign in to continue"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 -mt-6 bg-white rounded-t-3xl relative">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Mode Selection */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === "login"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setMode("phone")}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === "phone"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              disabled={loading}
            >
              <Phone className="w-4 h-4 inline mr-2" />
              Phone
            </button>
          </div>

          {/* Phone Number Form */}
          {mode === "phone" && (
            <form onSubmit={handlePhoneAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    disabled={loading}
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Processing..." : "Continue"}
              </button>
            </form>
          )}

          {/* Email Form */}
          {mode !== "phone" && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Processing..." : mode === "register" ? "Create Account" : "Sign In"}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Updates Checkbox */}
          <div className="mt-6 flex items-start gap-2">
            <input
              type="checkbox"
              id="updates"
              checked={acceptUpdates}
              onChange={(e) => setAcceptUpdates(e.target.checked)}
              className="mt-1 w-4 h-4 border-gray-300 rounded focus:ring-black"
              disabled={loading}
            />
            <label htmlFor="updates" className="text-xs text-gray-600">
              Keep me updated on the latest trends, offers and much more!
            </label>
          </div>

          {/* Toggle Mode */}
          <div className="mt-6 text-center text-sm">
            {mode === "register" ? (
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-black font-semibold hover:underline"
                  disabled={loading}
                >
                  Sign In
                </button>
              </p>
            ) : mode === "login" ? (
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-black font-semibold hover:underline"
                  disabled={loading}
                >
                  Create Account
                </button>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
