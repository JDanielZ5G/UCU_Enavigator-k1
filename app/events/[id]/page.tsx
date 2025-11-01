import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { OpenMapButton } from "@/components/events/open-map-button"

export default async function EventDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { id } = params

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch event details
  const { data: event, error: eventError } = await supabase.from("events").select("*").eq("id", id).single()

  if (eventError || !event) {
    notFound()
  }

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case "Computing and Technology":
        return "bg-blue-100 text-blue-800"
      case "Visual Art and Design":
        return "bg-purple-100 text-purple-800"
      case "Engineering":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const eventDate = new Date(event.date)
  const isPastEvent = eventDate < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/events">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-1">
          {/* Main Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getDepartmentColor(event.department)}>{event.department}</Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                      {isPastEvent && <Badge variant="outline">Past Event</Badge>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Date & Time</p>
                      <p className="text-sm text-muted-foreground">{format(eventDate, "PPPP")}</p>
                      <p className="text-sm text-muted-foreground">{format(eventDate, "p")}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Venue</p>
                      <p className="text-sm text-muted-foreground">{event.venue}</p>
                    </div>
                  </div>
                </div>

                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location Information
                    </CardTitle>
                    <CardDescription>Event venue details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Venue:</p>
                      <p className="text-sm text-muted-foreground">{event.venue}</p>
                    </div>
                    {event.latitude && event.longitude && (
                      <>
                        <div>
                          <p className="text-sm font-medium mb-1">Coordinates:</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {event.latitude.toFixed(6)}, {event.longitude.toFixed(6)}
                          </p>
                        </div>
                        <OpenMapButton latitude={event.latitude} longitude={event.longitude} />
                      </>
                    )}
                    <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">📍 Navigation Coming Soon</p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Interactive campus navigation with GPS directions will be available in a future update.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {event.google_form_url && (
                  <div className="pt-4">
                    <a href={event.google_form_url} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full" size="lg">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Register for Event
                      </Button>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
