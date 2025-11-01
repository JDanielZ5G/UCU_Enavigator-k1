// Offline support utilities

export interface CacheStatus {
  isOnline: boolean
  lastSync: Date | null
  cachedItemsCount: number
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Get cache status
 */
export function getCacheStatus(): CacheStatus {
  const lastSyncStr = localStorage.getItem("last_sync")
  const cachedEvents = localStorage.getItem("cached_events")

  let cachedItemsCount = 0
  if (cachedEvents) {
    try {
      cachedItemsCount = JSON.parse(cachedEvents).length
    } catch {
      cachedItemsCount = 0
    }
  }

  return {
    isOnline: isOnline(),
    lastSync: lastSyncStr ? new Date(lastSyncStr) : null,
    cachedItemsCount,
  }
}

/**
 * Update last sync timestamp
 */
export function updateLastSync(): void {
  localStorage.setItem("last_sync", new Date().toISOString())
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  localStorage.removeItem("cached_events")
  localStorage.removeItem("last_sync")
}

/**
 * Setup online/offline event listeners
 */
export function setupOfflineListeners(onOnline: () => void, onOffline: () => void): () => void {
  window.addEventListener("online", onOnline)
  window.addEventListener("offline", onOffline)

  return () => {
    window.removeEventListener("online", onOnline)
    window.removeEventListener("offline", onOffline)
  }
}
