"use client"

import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

interface OpenMapButtonProps {
  latitude: number
  longitude: number
}

export function OpenMapButton({ latitude, longitude }: OpenMapButtonProps) {
  const handleOpenMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    window.open(url, "_blank")
  }

  return (
    <Button onClick={handleOpenMap} variant="outline" className="w-full bg-transparent">
      <MapPin className="mr-2 h-4 w-4" />
      Open in Google Maps
    </Button>
  )
}
