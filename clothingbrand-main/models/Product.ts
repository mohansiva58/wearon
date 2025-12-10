import mongoose, { Schema, Document, Model } from 'mongoose'

// Optimized Product Interface with better type safety
export interface IProduct extends Document {
  name: string
  slug: string // SEO-friendly URL slug
  subtitle?: string
  description: string
  longDescription?: string
  mrp: number
  price: number
  discount: number
  images: string[]
  colors: string[]
  sizes: string[]
  category: string // "Shirts", "Pants", "T-Shirts", "Hoodies", etc.
  gender: string // "Men", "Women", "Unisex"
  features: string[]
  fabricCare: string[]
  rating: number
  reviews: number
  inStock: boolean
  stockQuantity: number
  sku?: string
  sizeChart?: {
    headers: string[]
    rows: string[][]
  }
  // Performance metrics
  viewCount?: number
  soldCount?: number
  createdAt: Date
  updatedAt: Date
}

// Optimized Schema with proper indexing hints
const ProductSchema = new Schema<IProduct>(
  {
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: { 
      type: String, 
      unique: true,
      lowercase: true,
      trim: true,
      index: true // Single field index for fast slug lookups
    },
    subtitle: { 
      type: String,
      trim: true,
      maxlength: 300
    },
    description: { 
      type: String, 
      required: true,
      trim: true
    },
    longDescription: { 
      type: String,
      trim: true
    },
    mrp: { 
      type: Number, 
      required: true,
      min: 0
    },
    price: { 
      type: Number, 
      required: true,
      min: 0,
      index: true // Single field index for price sorting
    },
    discount: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100,
      index: true // Single field index for discount filtering
    },
    images: [{ 
      type: String,
      trim: true
    }],
    colors: [{ 
      type: String,
      trim: true,
      lowercase: true
    }],
    sizes: [{ 
      type: String,
      trim: true,
      uppercase: true
    }],
    category: { 
      type: String, 
      default: 'Hoodies',
      trim: true,
      index: true // Single field index for category filtering
    },
    gender: { 
      type: String, 
      default: 'Unisex',
      enum: ['Men', 'Women', 'Unisex'],
      index: true // Single field index for gender filtering
    },
    features: [{ 
      type: String,
      trim: true
    }],
    fabricCare: [{ 
      type: String,
      trim: true
    }],
    rating: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
    reviews: { 
      type: Number, 
      default: 0,
      min: 0
    },
    inStock: { 
      type: Boolean, 
      default: true,
      index: true // Single field index for stock filtering
    },
    stockQuantity: { 
      type: Number, 
      default: 0,
      min: 0
    },
    sku: { 
      type: String,
      unique: true,
      sparse: true, // Only enforce uniqueness for non-null values
      trim: true,
      uppercase: true
    },
    sizeChart: {
      headers: [{ type: String }],
      rows: [[{ type: String }]],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
  }
)

// ===== COMPREHENSIVE INDEXING STRATEGY =====

// 1. Text search index (for name, description, category search)
ProductSchema.index({ 
  name: 'text', 
  description: 'text',
  category: 'text' 
}, {
  weights: {
    name: 10,
    category: 5,
    description: 1
  }
})

// 2. Compound index for category + price (most common query pattern)
ProductSchema.index({ category: 1, price: 1 })

// 3. Compound index for category + gender (filtering by both)
ProductSchema.index({ category: 1, gender: 1 })

// 4. Compound index for inStock + category (show available products)
ProductSchema.index({ inStock: 1, category: 1 })

// 5. Compound index for discount + inStock (deals/sales page)
ProductSchema.index({ discount: -1, inStock: 1 })

// 6. Compound index for popularity metrics
ProductSchema.index({ soldCount: -1, viewCount: -1 })

// 7. Compound index for category + inStock + price (complex filtering)
ProductSchema.index({ category: 1, inStock: 1, price: 1 })

// Pre-save hook to auto-generate slug
ProductSchema.pre('save', function(next) {
  // Always generate slug if it doesn't exist or if name changed
  if (!this.slug || this.isModified('name')) {
    // Generate slug from name: "Regular Fit T-Shirt" → "regular-fit-t-shirt"
    const baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .substring(0, 100) // Limit length
    
    // Add unique suffix (always for new products)
    if (this.isNew) {
      const timestamp = Date.now().toString(36)
      this.slug = `${baseSlug}-${timestamp}`
    } else {
      this.slug = baseSlug
    }
  }
  next()
})

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product
