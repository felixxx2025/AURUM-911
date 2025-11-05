import admin from 'firebase-admin'

interface PushNotification {
  title: string
  body: string
  data?: Record<string, string>
  imageUrl?: string
  actionUrl?: string
}

interface NotificationTarget {
  userId?: string
  tenantId?: string
  deviceTokens?: string[]
  topic?: string
}

export class PushNotificationService {
  private initialized = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    if (this.initialized || !process.env.FIREBASE_SERVICE_ACCOUNT) return

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    })

    this.initialized = true
  }

  async send(notification: PushNotification, target: NotificationTarget) {
    if (!this.initialized) return

    const message: admin.messaging.Message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl
      },
      data: {
        ...notification.data,
        actionUrl: notification.actionUrl || '',
        timestamp: Date.now().toString()
      },
      webpush: {
        fcmOptions: {
          link: notification.actionUrl
        }
      }
    }

    if (target.topic) {
      message.topic = target.topic
      return await admin.messaging().send(message)
    }

    if (target.deviceTokens?.length) {
      message.tokens = target.deviceTokens
      return await admin.messaging().sendMulticast(message)
    }

    throw new Error('No valid target specified')
  }

  async sendToUser(userId: string, notification: PushNotification) {
    // Get user's device tokens from database
    const tokens = await this.getUserDeviceTokens(userId)
    if (tokens.length === 0) return

    return await this.send(notification, { deviceTokens: tokens })
  }

  async sendToTenant(tenantId: string, notification: PushNotification) {
    return await this.send(notification, { topic: `tenant_${tenantId}` })
  }

  async subscribeToTopic(deviceToken: string, topic: string) {
    return await admin.messaging().subscribeToTopic([deviceToken], topic)
  }

  async unsubscribeFromTopic(deviceToken: string, topic: string) {
    return await admin.messaging().unsubscribeFromTopic([deviceToken], topic)
  }

  private async getUserDeviceTokens(userId: string): Promise<string[]> {
    // Implementation would fetch from database
    return []
  }
}