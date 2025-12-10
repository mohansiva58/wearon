import { z } from 'zod'

// Order validation schemas
export const createOrderSchema = z.object({
  items: z.array(z.object({
    id: z.number().positive(),
    name: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    image: z.string().url().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
  })).min(1, "Order must contain at least one item"),
  
  totalAmount: z.number().positive(),
  
  shippingAddress: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
    address: z.string().min(10, "Address must be at least 10 characters"),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  }),
  
  paymentMethod: z.enum(['razorpay', 'cod']),
  paymentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpaySignature: z.string().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().optional(),
})

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  subtitle: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  longDescription: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  mrp: z.number().positive("MRP must be greater than 0"),
  discount: z.number().min(0).max(100, "Discount must be between 0 and 100"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).min(1, "At least one size is required"),
  category: z.string().min(2),
  features: z.array(z.string()).optional(),
  fabricCare: z.array(z.string()).optional(),
  stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative"),
  inStock: z.boolean(),
  sku: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().min(0).optional(),
})

export const updateProductSchema = createProductSchema.partial()

// Payment validation schemas
export const createPaymentOrderSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
})

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

// Newsletter validation schema
export const subscribeNewsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
})

// Email validation schema
export const sendEmailSchema = z.object({
  to: z.string().email("Invalid recipient email"),
  subject: z.string().min(1, "Subject is required"),
  type: z.enum(['welcome', 'orderShipped', 'orderDelivered', 'orderCancelled']),
  data: z.record(z.any()),
})

// Carousel validation schema
export const createCarouselSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  image: z.string().url("Invalid image URL"),
  link: z.string().url("Invalid link URL").optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().default(true),
})

export const updateCarouselSchema = createCarouselSchema.partial()

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { success: false, error: messages }
    }
    return { success: false, error: 'Validation failed' }
  }
}
