import mongoose, { Schema, models, model } from 'mongoose'

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'newsletter_subscribers' }
)

export default models.Subscriber || model('Subscriber', SubscriberSchema)
