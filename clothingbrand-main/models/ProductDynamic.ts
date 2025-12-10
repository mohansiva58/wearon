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
      index: true
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
      index: true
    },
    discount: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100,
      index: true
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
      index: true
    },
    gender: { 
      type: String, 
      default: 'Unisex',
      enum: ['Men', 'Women', 'Unisex'],
      index: true
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
      index: true
    },
    stockQuantity: { 
      type: Number, 
      default: 0,
      min: 0
    },
    sku: { 
      type: String,
      unique: true,
      sparse: true,
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

// 1. Text search index
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

// 2. Compound indexes
ProductSchema.index({ category: 1, price: 1 })
ProductSchema.index({ category: 1, gender: 1 })
ProductSchema.index({ inStock: 1, category: 1 })
ProductSchema.index({ discount: -1, inStock: 1 })
ProductSchema.index({ soldCount: -1, viewCount: -1 })
ProductSchema.index({ category: 1, inStock: 1, price: 1 })

// Pre-save hook to auto-generate slug
ProductSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    const baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100)
    
    if (this.isNew) {
      const timestamp = Date.now().toString(36)
      this.slug = `${baseSlug}-${timestamp}`
    } else {
      this.slug = baseSlug
    }
  }
  next()
})

// Helper function to get collection name from category
export function getCollectionName(category: string): string {
  return `products_${category.toLowerCase().replace(/[^a-z0-9]/g, '')}`
}

// Cache for models to avoid recreation
const modelCache: { [key: string]: Model<IProduct> } = {}

/**
 * Get or create a model for a specific category
 * This creates separate collections like: products_jeans, products_shirts, etc.
 */
export function getProductModel(category: string): Model<IProduct> {
  const collectionName = getCollectionName(category)
  
  // Return cached model if exists
  if (modelCache[collectionName]) {
    return modelCache[collectionName]
  }

  // Check if model already exists in mongoose
  if (mongoose.models[collectionName]) {
    modelCache[collectionName] = mongoose.models[collectionName] as Model<IProduct>
    return modelCache[collectionName]
  }

  // Create new model with category-specific collection
  const model = mongoose.model<IProduct>(collectionName, ProductSchema, collectionName)
  modelCache[collectionName] = model
  
  return model
}

// Export default model for backward compatibility (uses 'products' collection)
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product
