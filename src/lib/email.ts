// Email service for sending notifications
// This is a simplified version - in production, you'd use a service like Resend, SendGrid, or AWS SES

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export interface ContactMessageEmail {
  businessName: string
  senderName: string
  senderEmail: string
  senderPhone?: string
  subject: string
  message: string
  contactMethod: string
  listingUrl: string
}

export interface ReviewEmail {
  businessName: string
  reviewerName: string
  rating: number
  reviewTitle: string
  reviewComment: string
  listingUrl: string
}

export interface WelcomeEmail {
  userName: string
  loginUrl: string
}

// Mock email service - replace with actual email service in production
export class EmailService {
  private static instance: EmailService
  private apiKey: string

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || 'mock-key'
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    // In production, this would send actual emails
    // For now, we'll just log to console
    console.log('📧 Email would be sent:', {
      to: template.to,
      subject: template.subject,
      html: template.html
    })
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return true
  }

  async sendContactMessageNotification(data: ContactMessageEmail): Promise<boolean> {
    const html = this.generateContactMessageHTML(data)
    const text = this.generateContactMessageText(data)

    return this.sendEmail({
      to: data.senderEmail, // In production, this would be the business owner's email
      subject: `New Contact Message for ${data.businessName}`,
      html,
      text
    })
  }

  async sendReviewNotification(data: ReviewEmail): Promise<boolean> {
    const html = this.generateReviewHTML(data)
    const text = this.generateReviewText(data)

    return this.sendEmail({
      to: 'business@example.com', // In production, this would be the business owner's email
      subject: `New Review for ${data.businessName}`,
      html,
      text
    })
  }

  async sendWelcomeEmail(data: WelcomeEmail): Promise<boolean> {
    const html = this.generateWelcomeHTML(data)
    const text = this.generateWelcomeText(data)

    return this.sendEmail({
      to: data.userName, // In production, this would be the user's email
      subject: 'Welcome to GunsmithLocal!',
      html,
      text
    })
  }

  private generateContactMessageHTML(data: ContactMessageEmail): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Message</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: #FFD700; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .message-box { background: white; padding: 15px; border-left: 4px solid #FFD700; margin: 15px 0; }
            .contact-info { background: #e8e8e8; padding: 10px; margin: 10px 0; }
            .button { display: inline-block; background: #FFD700; color: #1a1a1a; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>GUNSMITHLOCAL</h1>
              <h2>New Contact Message</h2>
            </div>
            <div class="content">
              <p>You have received a new contact message for your business <strong>${data.businessName}</strong>.</p>
              
              <div class="contact-info">
                <h3>Contact Information</h3>
                <p><strong>Name:</strong> ${data.senderName}</p>
                <p><strong>Email:</strong> ${data.senderEmail}</p>
                ${data.senderPhone ? `<p><strong>Phone:</strong> ${data.senderPhone}</p>` : ''}
                <p><strong>Preferred Contact:</strong> ${data.contactMethod}</p>
              </div>

              <div class="message-box">
                <h3>Message Details</h3>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${data.message.replace(/\n/g, '<br>')}</p>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${data.listingUrl}" class="button">View Listing</a>
              </p>

              <p style="font-size: 12px; color: #666; margin-top: 30px;">
                This message was sent through GunsmithLocal. Please reply directly to the customer's email address.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateContactMessageText(data: ContactMessageEmail): string {
    return `
GUNSMITHLOCAL - New Contact Message

You have received a new contact message for your business: ${data.businessName}

Contact Information:
- Name: ${data.senderName}
- Email: ${data.senderEmail}
${data.senderPhone ? `- Phone: ${data.senderPhone}` : ''}
- Preferred Contact: ${data.contactMethod}

Message Details:
- Subject: ${data.subject}
- Message: ${data.message}

View your listing: ${data.listingUrl}

This message was sent through GunsmithLocal. Please reply directly to the customer's email address.
    `.trim()
  }

  private generateReviewHTML(data: ReviewEmail): string {
    const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating)
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Review</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: #FFD700; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .review-box { background: white; padding: 15px; border-left: 4px solid #FFD700; margin: 15px 0; }
            .stars { color: #FFD700; font-size: 20px; margin: 10px 0; }
            .button { display: inline-block; background: #FFD700; color: #1a1a1a; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>GUNSMITHLOCAL</h1>
              <h2>New Review Received</h2>
            </div>
            <div class="content">
              <p>You have received a new review for your business <strong>${data.businessName}</strong>.</p>
              
              <div class="review-box">
                <h3>Review Details</h3>
                <p><strong>Reviewer:</strong> ${data.reviewerName}</p>
                <div class="stars">${stars}</div>
                <p><strong>Title:</strong> ${data.reviewTitle}</p>
                <p><strong>Comment:</strong></p>
                <p>${data.reviewComment.replace(/\n/g, '<br>')}</p>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${data.listingUrl}" class="button">View Review</a>
              </p>

              <p style="font-size: 12px; color: #666; margin-top: 30px;">
                This review was posted on GunsmithLocal and is now visible to potential customers.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateReviewText(data: ReviewEmail): string {
    const stars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating)
    
    return `
GUNSMITHLOCAL - New Review Received

You have received a new review for your business: ${data.businessName}

Review Details:
- Reviewer: ${data.reviewerName}
- Rating: ${stars} (${data.rating}/5)
- Title: ${data.reviewTitle}
- Comment: ${data.reviewComment}

View your listing: ${data.listingUrl}

This review was posted on GunsmithLocal and is now visible to potential customers.
    `.trim()
  }

  private generateWelcomeHTML(data: WelcomeEmail): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to GunsmithLocal</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: #FFD700; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .button { display: inline-block; background: #FFD700; color: #1a1a1a; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .feature { margin: 15px 0; padding: 10px; background: white; border-left: 3px solid #FFD700; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>GUNSMITHLOCAL</h1>
              <h2>Welcome to the Community!</h2>
            </div>
            <div class="content">
              <p>Welcome to GunsmithLocal, ${data.userName}!</p>
              
              <p>You're now part of the premier directory for finding and connecting with professional gunsmiths across America.</p>

              <div class="feature">
                <h3>🔍 Find Gunsmiths</h3>
                <p>Search our directory to find qualified gunsmiths in your area.</p>
              </div>

              <div class="feature">
                <h3>⭐ Save Favorites</h3>
                <p>Save listings you're interested in for easy access later.</p>
              </div>

              <div class="feature">
                <h3>📝 Leave Reviews</h3>
                <p>Share your experiences to help other gun owners make informed decisions.</p>
              </div>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${data.loginUrl}" class="button">Get Started</a>
              </p>

              <p style="font-size: 12px; color: #666; margin-top: 30px;">
                If you have any questions, feel free to contact us at support@gunsmithlocal.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  private generateWelcomeText(data: WelcomeEmail): string {
    return `
GUNSMITHLOCAL - Welcome!

Welcome to GunsmithLocal, ${data.userName}!

You're now part of the premier directory for finding and connecting with professional gunsmiths across America.

What you can do:
- Search our directory to find qualified gunsmiths in your area
- Save listings you're interested in for easy access later
- Leave reviews to help other gun owners make informed decisions

Get started: ${data.loginUrl}

If you have any questions, feel free to contact us at support@gunsmithlocal.com
    `.trim()
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()
