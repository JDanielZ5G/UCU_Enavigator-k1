"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, BellOff, CheckCircle } from "lucide-react"
import { requestNotificationPermission, restoreScheduledNotifications } from "@/lib/utils/notifications"

export default function NotificationSetup() {
  const [permission, setPermission] = useState<"granted" | "denied" | "default">("default")
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    // Check current permission
    if ("Notification" in window) {
      setPermission(Notification.permission)

      // Restore scheduled notifications if permission is granted
      if (Notification.permission === "granted") {
        restoreScheduledNotifications()
      }
    }
  }, [])

  const handleRequestPermission = async () => {
    setIsRequesting(true)

    const result = await requestNotificationPermission()

    if (result.granted) {
      setPermission("granted")
      restoreScheduledNotifications()
    } else if (result.denied) {
      setPermission("denied")
    }

    setIsRequesting(false)
  }

  if (!("Notification" in window)) {
    return null
  }

  if (permission === "granted") {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Event notifications are enabled. You&apos;ll receive reminders 1 hour before events.
        </AlertDescription>
      </Alert>
    )
  }

  if (permission === "denied") {
    return (
      <Alert variant="destructive">
        <BellOff className="h-4 w-4" />
        <AlertDescription>
          Notifications are blocked. Please enable them in your browser settings to receive event reminders.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Enable Event Notifications
        </CardTitle>
        <CardDescription>Get notified 1 hour before events start</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleRequestPermission} disabled={isRequesting} className="w-full">
          {isRequesting ? "Requesting..." : "Enable Notifications"}
        </Button>
      </CardContent>
    </Card>
  )
}
