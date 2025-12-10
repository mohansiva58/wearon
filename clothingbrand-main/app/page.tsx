"use client"

import { HeroSection } from "@/components/hero-section-clean" // Main hero carousel
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import CategoriesGrid from "@/components/categories-grid"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { SpinnerCenter } from "@/components/spinner"

// Lazy load heavy components for better initial page load
const NewArrivals = dynamic(() => import("@/components/new-arrivals"), {
  loading: () => <div className="py-12 text-center text-gray-500">Loading products...</div>
})

const Newsletter = dynamic(() => import("@/components/newsletter"), {
  ssr: false,
  loading: () => <div className="py-12"></div>
})

const PersonalizedSuggestions = dynamic(() => import("@/components/personalized-suggestions"), {
  ssr: false,
  loading: () => <SpinnerCenter />
})

const RecommendationsSection = dynamic(() => import("@/components/recommendations-section"), {
  ssr: false,
  loading: () => <SpinnerCenter />
})

export default function Home() {
  const router = useRouter()

  return (
    <>
      <main className="bg-white pb-20 md:pb-0">
        <HeroSection />
        <CategoriesGrid />
        <RecommendationsSection />
        {/* Trending Section */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col lg:flex-row gap-12"
            >
              {/* Large featured image */}
              <div className="lg:w-1/2">
                <div 
                  className="relative rounded-[40px] overflow-hidden aspect-[4/5] group cursor-pointer"
                  onClick={() => router.push('/shop')}
                >
                  <img
                    src="https://images.unsplash.com/photo-1637067751055-4c75acba9936?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFzaGlvbiUyMG1vZGVsJTIwcGhvdG9zfGVufDB8fDB8fHww"
                    alt="Trending look"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <span className="text-white/80 text-sm tracking-wide uppercase mb-2 block">Trending Now</span>
                    <h3 className="text-white text-3xl font-light">The Oversized Edit</h3>
                  </div>
                </div>
              </div>

              {/* Grid of smaller images */}
              <div className="lg:w-1/2 grid grid-cols-2 gap-6">
                {[
                  { img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80", title: "Casual Luxe", category: "Shirt" },
                  { img: "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=80", title: "Power Suits", category: "Jacket" },
                  { img: "https://images.unsplash.com/photo-1523205565295-f8e91625443b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmFzaGlvbiUyMG1vZGVsJTIwbWVufGVufDB8fDB8fHww", title: "Evening Glam", category: "Polo" },
                  { img: "https://plus.unsplash.com/premium_photo-1727942418440-d085b3b5f065?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZmFzaGlvbiUyMG1vZGVsJTIwbWVufGVufDB8fDB8fHww", title: "Boho Spirit", category: "Sweatshirt" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => router.push(`/shop?category=${item.category}`)}
                  >
                    <div className="rounded-3xl overflow-hidden aspect-square mb-3">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <h4 className="text-sm font-medium text-black group-hover:text-neutral-600 transition-colors">
                      {item.title}
                    </h4>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
        <NewArrivals />
        <PersonalizedSuggestions />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
