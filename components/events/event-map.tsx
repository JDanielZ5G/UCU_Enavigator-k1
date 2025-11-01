"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, ExternalLink } from "lucide-react"

interface EventMapProps {
  latitude: number
  longitude: number
  venue: string
}

export default function EventMap({ latitude, longitude, venue }: EventMapProps) {
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    window.open(url, "_blank")
  }

  const openVenueInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    window.open(url, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
        <CardDescription>View venue location on Google Maps</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Venue Information */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <p className="font-medium">{venue}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button onClick={openInGoogleMaps} className="w-full" variant="default">
            <MapPin className="mr-2 h-4 w-4" />
            Get Directions
          </Button>

          <Button onClick={openVenueInMaps} className="w-full bg-transparent" variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Google Maps
          </Button>
        </div>

        {/* Info Message */}
        <p className="text-xs text-center text-muted-foreground">Interactive campus navigation coming soon</p>
      </CardContent>
    </Card>
  )
}
