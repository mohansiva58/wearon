"use client"

import Link from "next/link"
import { motion } from "framer-motion"

type Category = {
  name: string
  category: string
  image: string
}

const categories: Category[] = [
  { name: "Shirt", category: "Shirt", image: "https://plus.unsplash.com/premium_photo-1678218594563-9fe0d16c6838?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2hpcnR8ZW58MHx8MHx8fDA%3D" },
  { name: "Jeans", category: "Jeans", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGplYW5zfGVufDB8fDB8fHww" },
  { name: "Sweatshirt", category: "Sweatshirt", image: "https://images.unsplash.com/photo-1630254688956-40da9f30216a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3dlYXRzaGlydHN8ZW58MHx8MHx8fDA%3D" },
  { name: "Polo", category: "Polo", image: "https://images.unsplash.com/photo-1625910513399-c9fcba54338c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cG9sbyUyMHNoaXJ0c3xlbnwwfHwwfHx8MA%3D%3D" },
  { name: "Jacket", category: "Jacket", image: "https://images.unsplash.com/photo-1577660002965-04865592fc60?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8amFja2V0c3xlbnwwfHwwfHx8MA%3D%3D" },
  {name:"sweater", category:"sweater", image:"https://images.unsplash.com/photo-1715176531842-7ffda4acdfa9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHN3ZWF0ZXJ8ZW58MHx8MHx8fDA%3D"},
  { name: "Trouser", category: "Trouser", image: "https://plus.unsplash.com/premium_photo-1661255382106-f20f0f683c69?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dHJvdXNlcnxlbnwwfHwwfHx8MA%3D%3D" },
  { name: "T-Shirt", category: "T-Shirt", image: "https://plus.unsplash.com/premium_photo-1673356302067-aac3b545a362?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dHNoaXJ0c3xlbnwwfHwwfHx8MA%3D%3D" },
  { name: "Sale", category: "All", image: "https://images.unsplash.com/photo-1577538928305-3807c3993047?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c2FsZXxlbnwwfHwwfHx8MA%3D%3D" },
]

export default function CategoriesGrid() {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-6 lg:gap-8">
          {categories.map((cat, idx) => (
            <Link 
              key={cat.category} 
              href={cat.name === "Sale" ? `/shop?sort=discount` : `/shop?category=${cat.category}`}
              className="group"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden ring-1 ring-gray-200 bg-white">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="mt-3 text-center text-sm sm:text-base font-semibold text-gray-900 group-hover:text-gray-700">
                  {cat.name}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
