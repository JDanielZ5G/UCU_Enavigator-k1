"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, Shield } from "lucide-react"
import Link from "next/link"
import { validateEventData } from "@/lib/utils/validation"

export default function CreateEventPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  // </CHANGE>

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    date: "",
    time: "",
    venue: "",
    latitude: "",
    longitude: "",
    google_form_url: "",
  })

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (profile?.role !== "admin") {
          router.push("/events")
          return
        }

        setIsAdmin(true)
      } catch (err) {
        console.error("Error checking admin status:", err)
        router.push("/events")
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAdminStatus()
  }, [router, supabase])
  // </CHANGE>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isOnline) {
      setError("You must be online to create an event")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.time}`)

      const eventData = {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        date: eventDateTime.toISOString(),
        venue: formData.venue,
        latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
        google_form_url: formData.google_form_url || null,
      }

      // Validate
      const validation = validateEventData(eventData)
      if (!validation.valid) {
        setError(validation.errors.join(", "))
        setIsLoading(false)
        return
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in to create an event")
        setIsLoading(false)
        return
      }

      const { error: insertError } = await supabase.from("events").insert({
        ...eventData,
        created_by: user.id,
        status: "approved", // Admins can directly approve their own events
      })
      // </CHANGE>

      if (insertError) throw insertError

      router.push("/events?success=created")
    } catch (err: any) {
      setError(err.message || "Failed to create event")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Verifying admin access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If not admin, don't render the form (will redirect)
  if (!isAdmin) {
    return null
  }
  // </CHANGE>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/events">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Admin Access</span>
            </div>
            {/* </CHANGE> */}
            <CardTitle className="text-2xl">Create New Event</CardTitle>
            <CardDescription>
              Fill in the details below to create a new event. As an admin, your event will be automatically approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isOnline && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>You are offline. Please connect to the internet to create an event.</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Tech Innovation Workshop"
                  disabled={isLoading || !isOnline}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about the event..."
                  rows={4}
                  disabled={isLoading || !isOnline}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                  disabled={isLoading || !isOnline}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computing and Technology">Computing and Technology</SelectItem>
                    <SelectItem value="Visual Art and Design">Visual Art and Design</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    disabled={isLoading || !isOnline}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    disabled={isLoading || !isOnline}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g., Engineering Block, Room 201"
                  disabled={isLoading || !isOnline}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="0.3476"
                    disabled={isLoading || !isOnline}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="32.6256"
                    disabled={isLoading || !isOnline}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_form_url">Google Form URL (Optional)</Label>
                <Input
                  id="google_form_url"
                  type="url"
                  value={formData.google_form_url}
                  onChange={(e) => setFormData({ ...formData, google_form_url: e.target.value })}
                  placeholder="https://forms.google.com/..."
                  disabled={isLoading || !isOnline}
                />
                <p className="text-xs text-muted-foreground">Add a Google Form link for event registration</p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading || !isOnline} className="flex-1">
                  {isLoading ? "Creating..." : "Create Event"}
                </Button>
                <Link href="/events" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
