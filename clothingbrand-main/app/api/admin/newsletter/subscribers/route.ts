import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Subscriber from '@/models/Subscriber'

export async function GET() {
  try {
    await connectToDatabase()
    const subs = await Subscriber.find({}, { _id: 0, email: 1, name: 1, createdAt: 1 }).sort({ createdAt: -1 })
    return NextResponse.json({ success: true, data: subs })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}
