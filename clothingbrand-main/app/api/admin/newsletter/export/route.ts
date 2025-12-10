import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Subscriber from '@/models/Subscriber'

function toCSV(rows: Array<Record<string, any>>) {
  const headers = ['email', 'name', 'createdAt']
  const lines = [headers.join(',')]
  for (const row of rows) {
    const vals = headers.map((h) => {
      const v = row[h]
      const s = v instanceof Date ? v.toISOString() : (v ?? '').toString()
      // escape commas, quotes, newlines
      const escaped = s.replace(/"/g, '""')
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
    })
    lines.push(vals.join(','))
  }
  return lines.join('\n')
}

export async function GET() {
  try {
    await connectToDatabase()
    const subs = await Subscriber.find({}, { _id: 0, email: 1, name: 1, createdAt: 1 }).sort({ createdAt: -1 })
    const csv = toCSV(subs)
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="newsletter_subscribers.csv"',
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 })
  }
}
