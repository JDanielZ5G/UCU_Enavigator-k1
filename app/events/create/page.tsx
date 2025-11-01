"use client"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreateEventForm from "@/components/events/create-event-form"

export default async function CreateEventPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    // Redirect non-admins to events page with error message
    redirect("/events?error=unauthorized")
  }

  return <CreateEventForm />
}
