// Notification service for sending emails and managing notifications

export interface NotificationData {
  type: 'contact_message' | 'review' | 'welcome'
  data: any
}

export class NotificationService {
  private static instance: NotificationService

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async sendContactMessageNotification(data: {
    listingId: string
    senderName: string
    senderEmail: string
    senderPhone?: string
    subject: string
    message: string
    contactMethod: string
  }): Promise<boolean> {
    try {
      const response = await fetch('/api/email/contact-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error('Error sending contact message notification:', error)
      return false
    }
  }

  async sendReviewNotification(data: {
    listingId: string
    reviewerName: string
    rating: number
    reviewTitle: string
    reviewComment: string
  }): Promise<boolean> {
    try {
      const response = await fetch('/api/email/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error('Error sending review notification:', error)
      return false
    }
  }

  async sendWelcomeNotification(data: {
    userEmail: string
    userName: string
  }): Promise<boolean> {
    try {
      const response = await fetch('/api/email/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error('Error sending welcome notification:', error)
      return false
    }
  }

  // Utility method to send any notification
  async sendNotification(notification: NotificationData): Promise<boolean> {
    switch (notification.type) {
      case 'contact_message':
        return this.sendContactMessageNotification(notification.data)
      case 'review':
        return this.sendReviewNotification(notification.data)
      case 'welcome':
        return this.sendWelcomeNotification(notification.data)
      default:
        console.error('Unknown notification type:', notification.type)
        return false
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()
