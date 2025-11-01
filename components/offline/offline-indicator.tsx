"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { WifiOff, Wifi } from "lucide-react"
import { getCacheStatus } from "@/lib/utils/offline"
import { formatDistanceToNow } from "date-fns"

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOnlineMessage, setShowOnlineMessage] = useState(false)
  const [cacheInfo, setCacheInfo] = useState<{ lastSync: Date | null; count: number }>({
    lastSync: null,
    count: 0,
  })

  useEffect(() => {
    const updateStatus = () => {
      const status = getCacheStatus()
      setIsOnline(status.isOnline)
      setCacheInfo({
        lastSync: status.lastSync,
        count: status.cachedItemsCount,
      })
    }

    const handleOnline = () => {
      updateStatus()
      setShowOnlineMessage(true)
      setTimeout(() => setShowOnlineMessage(false), 5000)
    }

    const handleOffline = () => {
      updateStatus()
      setShowOnlineMessage(false)
    }

    // Initial check
    updateStatus()

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline && !showOnlineMessage) {
    return null
  }

  if (showOnlineMessage) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <Wifi className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          You&apos;re back online! Data will sync automatically.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert>
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        You&apos;re offline. Showing {cacheInfo.count} cached event{cacheInfo.count !== 1 ? "s" : ""}.
        {cacheInfo.lastSync && (
          <span className="block text-xs mt-1">
            Last synced {formatDistanceToNow(cacheInfo.lastSync, { addSuffix: true })}
          </span>
        )}
      </AlertDescription>
    </Alert>
  )
}
