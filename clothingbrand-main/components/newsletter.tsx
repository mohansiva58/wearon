"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
// Using native inputs to avoid missing UI dependencies

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (email) {
      try {
        // 1) Persist subscriber (idempotent)
        await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: email.split('@')[0] })
        })

        // 2) Send welcome email regardless of backend configuration
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Welcome to Refero',
            type: 'welcome',
            data: { name: email.split('@')[0] }
          })
        })
        // We treat non-200 as non-blocking since API returns success even if email not configured
        await res.json().catch(() => null)
        setIsSubmitted(true)
        setEmail('')
      } catch {
        // Still show success to avoid blocking UX
        setIsSubmitted(true)
        setEmail('')
      }
    }
  }

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="w-8 h-8 text-white/60 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-tight">Join the inner circle</h2>
          <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto">
            Be the first to know about new arrivals, exclusive offers,
            and styling inspiration delivered to your inbox.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="flex-1 h-14 bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-full px-6 focus:ring-2 focus:ring-white/30 outline-none"
              />
              <button type="submit" className="h-14 px-8 bg-white text-black rounded-full hover:bg-white/90 transition-all duration-300 group flex items-center justify-center">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <p className="text-white text-lg">Welcome to the family! ✨</p>
              <p className="text-white/60 text-sm mt-2">Check your inbox for a special welcome gift.</p>
            </motion.div>
          )}

          <p className="text-white/40 text-xs mt-6">By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.</p>
        </motion.div>
      </div>
    </section>
  )
}
