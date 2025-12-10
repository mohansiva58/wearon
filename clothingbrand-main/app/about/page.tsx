"use client"
import React from 'react';
import { motion } from 'framer-motion';

export default function BrandStory() {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-neutral-50 pb-24 md:pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              <div className="aspect-[4/5] rounded-[60px] overflow-hidden">
                <img
                  src="https://plus.unsplash.com/premium_photo-1697695568160-ab895da7610b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGZhc2hpb24lMjBtb2RlbCUyMG1lbnxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Brand story"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating accent image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -bottom-8 -right-8 w-40 h-52 rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
              >
                <img
                  src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&q=80"
                  alt="Detail"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:pl-12"
          >
            <span className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-6 block">
              Our Story
            </span>
            
            <h2 className="text-4xl md:text-5xl font-light text-black leading-tight mb-8">
              Crafted with passion,{' '}
              <span className="italic">worn with pride</span>
            </h2>

            <p className="text-neutral-600 text-lg leading-relaxed mb-8">
              We believe fashion is more than fabric—it's an expression of identity. 
              Each piece in our collection is thoughtfully designed to empower you, 
              blending timeless elegance with contemporary edge.
            </p>

            <p className="text-neutral-500 leading-relaxed mb-10">
              From sustainable sourcing to ethical production, we're committed to 
              creating fashion that feels as good as it looks. Join us in redefining 
              what it means to dress with intention.
            </p>

            <div className="flex flex-wrap gap-12">
              <div>
                <span className="text-4xl font-light text-black">15+</span>
                <p className="text-neutral-500 text-sm mt-1">Years of Excellence</p>
              </div>
              <div>
                <span className="text-4xl font-light text-black">50K</span>
                <p className="text-neutral-500 text-sm mt-1">Happy Customers</p>
              </div>
              <div>
                <span className="text-4xl font-light text-black">100%</span>
                <p className="text-neutral-500 text-sm mt-1">Sustainable</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}