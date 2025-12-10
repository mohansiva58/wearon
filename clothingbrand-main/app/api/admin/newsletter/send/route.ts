import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { recipientEmail, recipientName, discount, productName, productPrice, validUntil } = await req.json()

    await sendEmail({
      to: recipientEmail,
      subject: `${discount}% OFF - Exclusive Offer Just For You! 🎉`,
      type: 'promotional',
      data: {
        name: recipientName,
        discount,
        productName,
        productPrice,
        validUntil,
        ctaUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send newsletter' },
      { status: 500 }
    )
  }
}
