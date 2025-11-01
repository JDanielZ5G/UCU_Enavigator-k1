// Browser notification utilities for event reminders

export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return { granted: false, denied: true, default: false }
  }

  if (Notification.permission === "granted") {
    return { granted: true, denied: false, default: false }
  }

  if (Notification.permission === "denied") {
    return { granted: false, denied: true, default: false }
  }

  try {
    const permission = await Notification.requestPermission()
    return {
      granted: permission === "granted",
      denied: permission === "denied",
      default: permission === "default",
    }
  } catch (error) {
    console.error("[v0] Error requesting notification permission:", error)
    return { granted: false, denied: false, default: true }
  }
}

/**
 * Check if notifications are supported and permitted
 */
export function canSendNotifications(): boolean {
  return "Notification" in window && Notification.permission === "granted"
}

/**
 * Send a browser notification
 */
export function sendNotification(title: string, options?: NotificationOptions): Notification | null {
  if (!canSendNotifications()) {
    console.warn("[v0] Cannot send notification: permission not granted")
    return null
  }

  try {
    return new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    })
  } catch (error) {
    console.error("[v0] Error sending notification:", error)
    return null
  }
}

/**
 * Schedule a notification for an event (1 hour before)
 */
export function scheduleEventNotification(
  eventId: string,
  eventTitle: string,
  eventDate: Date,
  venue: string,
): number | null {
  if (!canSendNotifications()) {
    return null
  }

  const now = new Date()
  const notificationTime = new Date(eventDate.getTime() - 60 * 60 * 1000) // 1 hour before

  if (notificationTime <= now) {
    // Event is too soon or already passed
    return null
  }

  const delay = notificationTime.getTime() - now.getTime()

  // Store in localStorage for persistence
  const scheduledNotifications = getScheduledNotifications()
  scheduledNotifications[eventId] = {
    eventId,
    eventTitle,
    eventDate: eventDate.toISOString(),
    venue,
    scheduledFor: notificationTime.toISOString(),
  }
  localStorage.setItem("scheduled_notifications", JSON.stringify(scheduledNotifications))

  // Schedule the notification
  const timeoutId = window.setTimeout(() => {
    sendNotification(`Upcoming Event: ${eventTitle}`, {
      body: `Starting in 1 hour at ${venue}`,
      tag: eventId,
      requireInteraction: true,
    })

    // Remove from scheduled notifications
    removeScheduledNotification(eventId)
  }, delay)

  return timeoutId
}

/**
 * Get all scheduled notifications from localStorage
 */
export function getScheduledNotifications(): Record<string, any> {
  try {
    const stored = localStorage.getItem("scheduled_notifications")
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Remove a scheduled notification
 */
export function removeScheduledNotification(eventId: string): void {
  const scheduledNotifications = getScheduledNotifications()
  delete scheduledNotifications[eventId]
  localStorage.setItem("scheduled_notifications", JSON.stringify(scheduledNotifications))
}

/**
 * Restore scheduled notifications on app load
 */
export function restoreScheduledNotifications(): void {
  const scheduledNotifications = getScheduledNotifications()
  const now = new Date()

  Object.values(scheduledNotifications).forEach((notification: any) => {
    const eventDate = new Date(notification.eventDate)
    const scheduledFor = new Date(notification.scheduledFor)

    if (scheduledFor > now && eventDate > now) {
      // Re-schedule the notification
      scheduleEventNotification(notification.eventId, notification.eventTitle, eventDate, notification.venue)
    } else {
      // Remove expired notification
      removeScheduledNotification(notification.eventId)
    }
  })
}
