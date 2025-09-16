import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.EMAIL_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { type, userEmail, userName, businessName, businessDetails } = await request.json()

    if (!userEmail || !type) {
      return NextResponse.json(
        { error: 'User email and notification type are required' },
        { status: 400 }
      )
    }

    let subject = ''
    let actionText = ''
    let bgColor = '#1a73e8'
    
    switch (type) {
      case 'business_claimed':
        subject = '🏢 Business Claim Submitted - GunsmithLocal'
        actionText = 'claimed an existing business'
        bgColor = '#ea4335'
        break
      case 'business_added':
        subject = '🆕 New Business Added - GunsmithLocal'
        actionText = 'added a new business'
        bgColor = '#34a853'
        break
      case 'featured_purchase':
        subject = '⭐ Featured Listing Purchase - GunsmithLocal'
        actionText = 'purchased featured listing'
        bgColor = '#D4AF37'
        break
      default:
        subject = '📋 Business Activity - GunsmithLocal'
        actionText = 'performed a business action'
    }

    // Send notification to admin (you)
    const { data, error } = await resend.emails.send({
      from: 'GunsmithLocal <noreply@gunsmithlocal.com>',
      to: ['canonweaver@loopline.design'],
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 28px; text-align: center;">
              ${type === 'business_claimed' ? '🏢' : type === 'business_added' ? '🆕' : '⭐'} ${actionText.toUpperCase()}
            </h1>
            <p style="text-align: center; margin: 10px 0 0 0; color: #9CA3AF;">
              ${userName || userEmail} ${actionText} on GunsmithLocal
            </p>
          </div>

          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid ${bgColor};">
            <h2 style="color: ${bgColor}; margin-top: 0;">Details</h2>
            
            <div style="margin: 15px 0;">
              <strong>User Name:</strong> ${userName || 'Not provided'}
            </div>
            
            <div style="margin: 15px 0;">
              <strong>User Email:</strong> ${userEmail}
            </div>
            
            <div style="margin: 15px 0;">
              <strong>Business Name:</strong> ${businessName || 'Not provided'}
            </div>
            
            ${businessDetails ? `
            <div style="margin: 15px 0;">
              <strong>Additional Info:</strong><br>
              <div style="background: #fff; padding: 15px; border-radius: 6px; margin-top: 10px; font-size: 14px;">
                ${businessDetails}
              </div>
            </div>
            ` : ''}
            
            <div style="margin: 15px 0;">
              <strong>Action Time:</strong> ${new Date().toLocaleString()}
            </div>
          </div>

          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #1a73e8; margin-top: 0;">Quick Actions</h3>
            <p style="margin: 10px 0;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" 
                 style="background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-right: 10px;">
                Admin Dashboard
              </a>
              ${type === 'business_claimed' ? `
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/verification" 
                 style="background: #ea4335; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Review Claims
              </a>
              ` : ''}
            </p>
            <p style="margin: 10px 0; font-size: 14px; color: #666;">
              ${type === 'business_claimed' ? 'Review and approve the business claim in your admin panel.' : 
                type === 'business_added' ? 'The new business listing may need verification.' :
                'A user has purchased featured listing placement.'}
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
      console.error('Failed to send admin business notification:', error)
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error) {
    console.error('Admin business notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
