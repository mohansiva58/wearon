import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Subscriber from '@/models/Subscriber'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name } = body || {}

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const existing = await Subscriber.findOne({ email })
    if (existing) {
      return NextResponse.json({ success: true, message: 'Already subscribed' })
    }

    await Subscriber.create({ email, name })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Graceful error handling; avoid leaking internals
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
