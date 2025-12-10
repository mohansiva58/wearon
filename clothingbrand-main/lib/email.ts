import nodemailer from 'nodemailer'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: parseInt(process.env.EMAIL_PORT || '587') === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
})
// gg
// Modern email templates
const getEmailTemplate = (type: string, data: any) => {
  const baseStyles = `
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .welcome-icon { font-size: 60px; margin-bottom: 20px; }
    .order-status { display: inline-block; padding: 12px 24px; border-radius: 25px; font-weight: 600; font-size: 14px; margin: 20px 0; }
    .status-shipped { background: #EEF2FF; color: #4F46E5; }
    .status-delivered { background: #DCFCE7; color: #16A34A; }
    .status-cancelled { background: #FEE2E2; color: #DC2626; }
    .order-card { background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .order-number { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 10px; }
    .order-detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
    .order-detail:last-child { border-bottom: none; }
    .label { color: #6B7280; font-size: 14px; }
    .value { color: #111827; font-weight: 500; font-size: 14px; }
    .button { display: inline-block; background: #000000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #333333; }
    .footer { background: #F9FAFB; padding: 30px; text-align: center; color: #6B7280; font-size: 13px; }
    .footer a { color: #4F46E5; text-decoration: none; }
    .tracking-timeline { margin: 30px 0; }
    .timeline-step { display: flex; align-items: center; margin: 15px 0; }
    .timeline-dot { width: 16px; height: 16px; border-radius: 50%; margin-right: 15px; }
    .dot-active { background: #16A34A; }
    .dot-inactive { background: #E5E7EB; }
    .timeline-text { color: #374151; font-size: 14px; }
  `

  const templates = {
    welcome: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to The House of Rare!</h1>
          </div>
          <div class="content">
            <div class="welcome-icon">👋</div>
            <h2 style="color: #111827; margin-top: 0;">Hello ${data.userName}!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for signing in to The House of Rare. We're thrilled to have you as part of our exclusive community!
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Discover our latest collection of premium hoodies, shirts, and limited edition items crafted with exceptional quality.
            </p>
            <a href="${data.shopUrl || 'http://localhost:3000/shop'}" class="button">Start Shopping</a>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <h3 style="margin-top: 0; color: #111827;">What's Next?</h3>
              <ul style="color: #374151; line-height: 1.8;">
                <li>Browse our exclusive collections</li>
                <li>Add items to your wishlist</li>
                <li>Enjoy seamless checkout experience</li>
                <li>Track your orders in real-time</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Need help? Contact us at <a href="mailto:support@thehouseofrare.com">support@thehouseofrare.com</a></p>
            <p>© 2025 The House of Rare. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    orderShipped: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order is on the Way!</h1>
          </div>
          <div class="content">
            <p style="color: #374151; font-size: 16px;">Hi ${data.userName},</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Great news! Your order has been shipped and is on its way to you.
            </p>
            <div class="order-status status-shipped">✓ Shipped</div>
            <div class="order-card">
              <div class="order-number">Order ${data.orderNumber}</div>
              <div class="order-detail">
                <span class="label">Order Date:</span>
                <span class="value">${data.orderDate ? new Date(data.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
              </div>
              <div class="order-detail">
                <span class="label">Total Items:</span>
                <span class="value">${data.itemCount || 0} items</span>
              </div>
              <div class="order-detail">
                <span class="label">Total Amount:</span>
                <span class="value">₹${data.total ? data.total.toLocaleString('en-IN') : '0'}</span>
              </div>
              ${data.trackingNumber ? `
              <div class="order-detail">
                <span class="label">Tracking Number:</span>
                <span class="value">${data.trackingNumber}</span>
              </div>
              ` : ''}
            </div>
            <div class="tracking-timeline">
              <h3 style="color: #111827; margin-bottom: 20px;">Delivery Progress</h3>
              <div class="timeline-step">
                <div class="timeline-dot dot-active"></div>
                <div class="timeline-text"><strong>Order Confirmed</strong></div>
              </div>
              <div class="timeline-step">
                <div class="timeline-dot dot-active"></div>
                <div class="timeline-text"><strong>Shipped</strong> - Your order is on the way</div>
              </div>
              <div class="timeline-step">
                <div class="timeline-dot dot-inactive"></div>
                <div class="timeline-text">Out for Delivery</div>
              </div>
              <div class="timeline-step">
                <div class="timeline-dot dot-inactive"></div>
                <div class="timeline-text">Delivered</div>
              </div>
            </div>
            <p style="color: #374151; font-size: 14px; line-height: 1.6;">
              <strong>Shipping Address:</strong><br>
              ${data.shippingAddress?.name || 'N/A'}<br>
              ${data.shippingAddress?.address || ''}<br>
              ${data.shippingAddress?.city || ''}, ${data.shippingAddress?.state || ''} ${data.shippingAddress?.pincode || ''}<br>
              Phone: ${data.shippingAddress?.phone || 'N/A'}
            </p>
            <a href="${data.trackUrl || 'http://localhost:3000/my-orders'}" class="button">Track Your Order</a>
          </div>
          <div class="footer">
            <p>Questions? Contact us at <a href="mailto:support@thehouseofrare.com">support@thehouseofrare.com</a></p>
            <p>© 2025 The House of Rare. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    ` ,

    orderDelivered: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Your Order Has Been Delivered!</h1>
          </div>
          <div class="content">
            <p style="color: #374151; font-size: 16px;">Hi ${data.userName},</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Wonderful news! Your order has been successfully delivered. We hope you love your new items!
            </p>
            <div class="order-status status-delivered">✓ Delivered</div>
            <div class="order-card">
              <div class="order-number">Order ${data.orderNumber}</div>
              <div class="order-detail">
                <span class="label">Delivered On:</span>
                <span class="value">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div class="order-detail">
                <span class="label">Total Items:</span>
                <span class="value">${data.itemCount || 0} items</span>
              </div>
              <div class="order-detail">
                <span class="label">Total Amount:</span>
                <span class="value">₹${data.total ? data.total.toLocaleString('en-IN') : '0'}</span>
              </div>
            </div>
            <div style="background: #DCFCE7; border-left: 4px solid #16A34A; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="margin-top: 0; color: #16A34A;">✓ All Done!</h3>
              <p style="color: #166534; margin: 0; line-height: 1.6;">
                Your package has been delivered${data.shippingAddress ? ` to: <strong>${data.shippingAddress.address}, ${data.shippingAddress.city}</strong>` : ''}!
              </p>
            </div>
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="margin-top: 0; color: #111827;">How was your experience?</h3>
              <p style="color: #374151; margin-bottom: 15px;">
                We'd love to hear your feedback about your purchase and delivery experience.
              </p>
              <a href="${data.reviewUrl || 'http://localhost:3000/profile'}" style="display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">Leave a Review</a>
            </div>
            <a href="${data.shopUrl || 'http://localhost:3000/shop'}" class="button">Shop Again</a>
          </div>
          <div class="footer">
            <p>Need assistance? <a href="mailto:support@thehouseofrare.com">Contact Support</a></p>
            <p>© 2025 The House of Rare. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    orderCancelled: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><style>${baseStyles}</style></head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled</h1>
          </div>
          <div class="content">
            <p style="color: #374151; font-size: 16px;">Hi ${data.userName},</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              We're writing to confirm that your order has been cancelled as requested.
            </p>
            <div class="order-status status-cancelled">✕ Cancelled</div>
            <div class="order-card">
              <div class="order-number">Order ${data.orderNumber}</div>
              <div class="order-detail">
                <span class="label">Order Date:</span>
                <span class="value">${new Date(data.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div class="order-detail">
                <span class="label">Cancelled On:</span>
                <span class="value">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div class="order-detail">
                <span class="label">Total Amount:</span>
                <span class="value">₹${data.total ? data.total.toLocaleString('en-IN') : '0'}</span>
              </div>
            </div>
            <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="margin-top: 0; color: #92400E;">Refund Information</h3>
              <p style="color: #92400E; margin: 0; line-height: 1.6;">
                ${data.paymentMethod === 'cod' 
                  ? 'Since this was a Cash on Delivery order, no refund processing is required.'
                  : 'Your refund will be processed within 5-7 business days to your original payment method.'}
              </p>
            </div>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              We're sorry to see this order cancelled. If you have any questions or concerns, our support team is here to help.
            </p>
            <a href="${data.shopUrl || 'http://localhost:3000/shop'}" class="button">Continue Shopping</a>
          </div>
          <div class="footer">
            <p>Have questions? <a href="mailto:support@thehouseofrare.com">Contact Support</a></p>
            <p>© 2025 The House of Rare. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  return templates[type as keyof typeof templates] || templates.welcome
}

// Send email function
export async function sendEmail(options: {
  to: string
  subject: string
  type: 'welcome' | 'orderShipped' | 'orderDelivered' | 'orderCancelled'
  data: any
}) {
  try {
    const html = getEmailTemplate(options.type, options.data)

    const info = await transporter.sendMail({
      from: `"The House of Rare" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html,
    })

    console.log('[Email] Message sent: %s', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('[Email] Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}

// Verify transporter configuration
export async function verifyEmailConfig() {
  try {
    await transporter.verify()
    console.log('[Email] Server is ready to send emails')
    return true
  } catch (error) {
    console.error('[Email] Server configuration error:', error)
    return false
  }
}
