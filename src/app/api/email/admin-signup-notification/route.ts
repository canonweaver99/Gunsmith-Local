import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, signupMethod } = await request.json()

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not set; skipping admin-signup-notification email send')
      return NextResponse.json({ success: true, skipped: true })
    }

    const resend = new Resend(apiKey)

    // Send notification to admin (you)
    const { data, error } = await resend.emails.send({
      from: 'GunsmithLocal <contact@gunsmithlocal.com>',
      to: ['canonweaver@loopline.design'],
      subject: '🎉 New User Signup - GunsmithLocal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New User Signup</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 28px; text-align: center;">
              🎯 NEW USER SIGNUP
            </h1>
            <p style="text-align: center; margin: 10px 0 0 0; color: #9CA3AF;">
              Someone just joined GunsmithLocal!
            </p>
          </div>

          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #D4AF37;">
            <h2 style="color: #D4AF37; margin-top: 0;">User Details</h2>
            
            <div style="margin: 15px 0;">
              <strong>Name:</strong> ${userName || 'Not provided'}
            </div>
            
            <div style="margin: 15px 0;">
              <strong>Email:</strong> ${userEmail}
            </div>
            
            <div style="margin: 15px 0;">
              <strong>Signup Method:</strong> ${signupMethod || 'Email'}
            </div>
            
            <div style="margin: 15px 0;">
              <strong>Signup Time:</strong> ${new Date().toLocaleString()}
            </div>
          </div>

          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #1a73e8; margin-top: 0;">Quick Actions</h3>
            <p style="margin: 10px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" 
                 style="background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Admin Dashboard
              </a>
            </p>
            <p style="margin: 10px 0; font-size: 14px; color: #666;">
              Monitor new user activity and manage listings from your admin panel.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin: 0;">
              This notification was sent to you as the site administrator.
            </p>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('Failed to send admin notification:', error)
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error('Admin notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
