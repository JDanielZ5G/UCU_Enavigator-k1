"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, MapPin, CheckCircle, XCircle, Trash2, AlertCircle, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AdminEventsListProps {
  status: "pending" | "approved" | "rejected"
}

export default function AdminEventsList({ status }: AdminEventsListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const supabase = createClient()
  const router = useRouter()

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [status])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setEvents(data || [])
    } catch (err: any) {
      setError(err.message || "Failed to load events")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (eventId: string) => {
    if (!isOnline) {
      setError("You must be online to approve events")
      return
    }

    setActionLoading(eventId)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("events")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .eq("id", eventId)

      if (updateError) throw updateError

      // Remove from current list
      setEvents(events.filter((e) => e.id !== eventId))
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to approve event")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (eventId: string) => {
    if (!isOnline) {
      setError("You must be online to reject events")
      return
    }

    setActionLoading(eventId)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("events")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", eventId)

      if (updateError) throw updateError

      // Remove from current list
      setEvents(events.filter((e) => e.id !== eventId))
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to reject event")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!eventToDelete || !isOnline) {
      setError("You must be online to delete events")
      return
    }

    setActionLoading(eventToDelete)
    setError(null)

    try {
      const { error: deleteError } = await supabase.from("events").delete().eq("id", eventToDelete)

      if (deleteError) throw deleteError

      // Remove from list
      setEvents(events.filter((e) => e.id !== eventToDelete))
      setDeleteDialogOpen(false)
      setEventToDelete(null)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to delete event")
    } finally {
      setActionLoading(null)
    }
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

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Offline Alert */}
      {!isOnline && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You are currently offline. Admin actions are unavailable.</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No {status} events</h3>
            <p className="text-muted-foreground">There are currently no events with {status} status.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                  <Badge className={getDepartmentColor(event.department)}>{event.department.split(" ")[0]}</Badge>
                </div>
                <CardDescription className="line-clamp-3">{event.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.date), "PPP 'at' p")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Details
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  {status === "pending" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(event.id)}
                        disabled={actionLoading === event.id || !isOnline}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(event.id)}
                        disabled={actionLoading === event.id || !isOnline}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {status === "rejected" && (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleApprove(event.id)}
                      disabled={actionLoading === event.id || !isOnline}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                  )}

                  {status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => handleReject(event.id)}
                      disabled={actionLoading === event.id || !isOnline}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => {
                      setEventToDelete(event.id)
                      setDeleteDialogOpen(true)
                    }}
                    disabled={actionLoading === event.id || !isOnline}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEventToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
