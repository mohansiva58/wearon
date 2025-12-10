"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const fashionImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1571255604884-fa433d2536f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEyN3x8fGVufDB8fHx8fA%3D%3D", alt: "Model in elegant coat", label: "Shirts", category: "Shirt" },
  { id: 2, src: "https://thehouseofrare.com/cdn/shop/files/LAURELLIGHTTURQ-CC1380.webp?v=1743582326&width=768", alt: "Fashion model in blazer", label: "Jeans", category: "Jeans" },
  { id: 3, src: "https://images.unsplash.com/photo-1658080728906-60bb17de693c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDZ8fHxlbnwwfHx8fHw%3D", alt: "Street style fashion", label: "Trousers", category: "Trouser" },
  { id: 4, src: "https://images.unsplash.com/photo-1610014133451-0f8b938d9661?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fG1lbnMlMjBmYXNoaW9uJTIwbW9kZWwlMjBwaG90b3N8ZW58MHx8MHx8fDA%3D", alt: "Minimal fashion", label: "Polo", category: "Polo" },
  { id: 5, src: "https://images.unsplash.com/photo-1654005018306-7066fc118281?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZmFzaGlvbiUyMG1vZGVsJTIwbWVufGVufDB8fDB8fHww", alt: "Modern styling", label: "Jackets", category: "Jacket" }
]

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(2)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const router = useRouter()

  const handleImageClick = (category: string) => {
    router.push(`/shop?category=${category}`)
  }

  useEffect(() => {
    const interval = isAutoPlaying ? setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % fashionImages.length)
    }, 1800) : undefined
    return () => { if (interval) clearInterval(interval) }
  }, [isAutoPlaying])

  const handlePrev = () => {
    setIsAutoPlaying(false)
    setActiveIndex((prev) => (prev - 1 + fashionImages.length) % fashionImages.length)
  }

  const handleNext = () => {
    setIsAutoPlaying(false)
    setActiveIndex((prev) => (prev + 1) % fashionImages.length)
  }

  const getPosition = (index: number) => {
    const diff = index - activeIndex
    const normalizedDiff = ((diff + fashionImages.length + 2) % fashionImages.length) - 2
    return normalizedDiff
  }

  return (
    <div className="relative w-full h-[520px] md:h-[600px] overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {fashionImages.map((image, index) => {
          const position = getPosition(index)
          const isActive = position === 0
          const isVisible = Math.abs(position) <= 2

          if (!isVisible) return null

          return (
            <motion.div
              key={image.id}
              className="absolute cursor-pointer group"
              initial={false}
              animate={{ x: position * 260, scale: isActive ? 1 : 0.8, zIndex: isActive ? 10 : 5 - Math.abs(position), opacity: Math.abs(position) > 1 ? 0.4 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => { 
                setIsAutoPlaying(false)
                if (isActive && image.category) {
                  handleImageClick(image.category)
                } else {
                  setActiveIndex(index)
                }
              }}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <div className={`${isActive ? 'w-[280px] h-[420px] md:w-[340px] md:h-[520px]' : 'w-[200px] h-[320px] md:w-[240px] md:h-[380px]'} relative overflow-hidden transition-all duration-500`} style={{ borderRadius: '120px' }}>
                <img src={image.src} alt={image.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <motion.div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-end pb-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ borderRadius: '120px' }}>
                  <span className="text-white text-sm font-medium tracking-wide">{image.label}</span>
                  {isActive && image.category && (
                    <span className="text-white/90 text-xs mt-2 bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm">Click to Shop</span>
                  )}
                </motion.div>
                {isActive && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-full">
                    <span className="text-white text-base font-medium">{image.label}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <button onClick={handlePrev} className="absolute left-6 md:left-16 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110 z-20">
        <ChevronLeft className="w-6 h-6 text-black" />
      </button>

      <button onClick={handleNext} className="absolute right-6 md:right-16 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center hover:bg-white transition-all duration-300 hover:scale-110 z-20">
        <ChevronRight className="w-6 h-6 text-black" />
      </button>

      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {fashionImages.map((_, index) => (
          <button key={index} onClick={() => { setIsAutoPlaying(false); setActiveIndex(index) }} className={`${index === activeIndex ? 'bg-black w-8' : 'bg-black/30 w-2'} h-2 rounded-full transition-all duration-300`} />
        ))}
      </div>
    </div>
  )
}
