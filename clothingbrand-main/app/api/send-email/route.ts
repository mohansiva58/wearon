import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, type, data } = body

    // Validate required fields
    if (!to || !subject || !type || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, type, data' },
        { status: 400 }
      )
    }

    // Validate email type
    const validTypes = ['welcome', 'orderShipped', 'orderDelivered', 'orderCancelled']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid email type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if email is configured
    const isEmailConfigured = 
      process.env.EMAIL_USER && 
      process.env.EMAIL_PASS

    if (!isEmailConfigured) {
      console.warn('[Email] Email service not configured. Skipping email send.')
      // Return success to prevent blocking the order flow
      return NextResponse.json({ 
        success: true, 
        warning: 'Email service not configured',
        message: 'Operation completed without sending email',
        messageId: 'skipped' 
      })
    }

    // Send email
    const result = await sendEmail({ to, subject, type, data })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
      })
    } else {
      // Log error but don't fail the request (to prevent blocking order updates)
      console.error('[Email] Failed to send email:', result.error)
      return NextResponse.json({
        success: true,
        warning: 'Email send failed but operation completed',
        message: 'Operation completed without sending email',
        error: result.error,
      })
    }
  } catch (error: any) {
    console.error('[Send Email API] Error:', error)
    // Return success to prevent blocking the order flow
    return NextResponse.json({
      success: true,
      warning: 'Email API error but operation completed',
      message: 'Operation completed without sending email',
      error: error.message || 'Unknown error',
    })
  }
}
