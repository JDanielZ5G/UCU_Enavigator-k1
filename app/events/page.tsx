import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import EventsList from "@/components/events/events-list"
import NotificationSetup from "@/components/notifications/notification-setup"
import OfflineIndicator from "@/components/offline/offline-indicator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { PlusCircle, LogOut, Shield } from "lucide-react"
import Image from "next/image"

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    department?: string
    filter?: string
  }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  const isAdmin = profile?.role === "admin"
  // </CHANGE>

  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/ucu-logo.png" alt="UCU Logo" width={200} height={40} className="h-10 w-auto" />
              <div className="border-l pl-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-primary">UCU Event Nav</h1>
                  {isAdmin && (
                    <Badge variant="default" className="bg-blue-600">
                      <Shield className="mr-1 h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                  {/* </CHANGE> */}
                </div>
                <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <>
                  <Link href="/admin">
                    <Button variant="outline">Admin Dashboard</Button>
                  </Link>
                  <Link href="/events/create">
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </Link>
                </>
              )}
              {/* </CHANGE> */}

              <form action="/auth/logout" method="post">
                <Button variant="ghost" type="submit">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-4 mb-6">
          <OfflineIndicator />
          <NotificationSetup />
        </div>

        <EventsList searchQuery={params.search} departmentFilter={params.department} timeFilter={params.filter} />
      </main>
    </div>
  )
}
