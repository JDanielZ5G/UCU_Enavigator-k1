"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Calendar, MapPin, Filter, AlertCircle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { updateLastSync } from "@/lib/utils/offline"
import { scheduleEventNotification, canSendNotifications } from "@/lib/utils/notifications"

interface EventsListProps {
  searchQuery?: string
  departmentFilter?: string
  timeFilter?: string
}

export default function EventsList({
  searchQuery = "",
  departmentFilter = "all",
  timeFilter = "upcoming",
}: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState(searchQuery)
  const [department, setDepartment] = useState(departmentFilter)
  const [timeRange, setTimeRange] = useState(timeFilter)
  const [isOnline, setIsOnline] = useState(true)

  const supabase = createClient()

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

  // Fetch events
  useEffect(() => {
    fetchEvents()
  }, [])

  // Filter events when filters change
  useEffect(() => {
    filterEvents()
  }, [events, search, department, timeRange])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to load from cache first
      const cachedEvents = localStorage.getItem("cached_events")
      if (cachedEvents && !isOnline) {
        setEvents(JSON.parse(cachedEvents))
        setIsLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .order("date", { ascending: true })

      if (fetchError) throw fetchError

      setEvents(data || [])

      // Cache events for offline use
      if (data) {
        localStorage.setItem("cached_events", JSON.stringify(data))
        updateLastSync()

        if (canSendNotifications()) {
          data.forEach((event) => {
            const eventDate = new Date(event.date)
            if (eventDate > new Date()) {
              scheduleEventNotification(event.id, event.title, eventDate, event.venue)
            }
          })
        }
        // </CHANGE>
      }
    } catch (err: any) {
      setError(err.message || "Failed to load events")

      // Try to load from cache on error
      const cachedEvents = localStorage.getItem("cached_events")
      if (cachedEvents) {
        setEvents(JSON.parse(cachedEvents))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]
    const now = new Date()

    // Filter by time range
    if (timeRange === "upcoming") {
      filtered = filtered.filter((event) => new Date(event.date) >= now)
    } else if (timeRange === "past") {
      filtered = filtered.filter((event) => new Date(event.date) < now)
    }

    // Filter by department
    if (department !== "all") {
      filtered = filtered.filter((event) => event.department === department)
    }

    // Filter by search query
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.venue.toLowerCase().includes(searchLower),
      )
    }

    setFilteredEvents(filtered)
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
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Department Filter */}
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Computing and Technology">Computing & Technology</SelectItem>
                <SelectItem value="Visual Art and Design">Visual Art & Design</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>

            {/* Time Filter */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or check back later for new events.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                      <Badge className={getDepartmentColor(event.department)}>{event.department.split(" ")[0]}</Badge>
                    </div>
                    <CardDescription className="line-clamp-3">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(event.date), "PPP 'at' p")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
