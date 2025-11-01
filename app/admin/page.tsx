import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Users, CheckCircle, XCircle, Clock } from "lucide-react"
import AdminEventsList from "@/components/admin/admin-events-list"
import Image from "next/image"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/events")
  }

  const { data: pendingEvents } = await supabase.from("events").select("id", { count: "exact" }).eq("status", "pending")

  const { data: approvedEvents } = await supabase
    .from("events")
    .select("id", { count: "exact" })
    .eq("status", "approved")

  const { data: rejectedEvents } = await supabase
    .from("events")
    .select("id", { count: "exact" })
    .eq("status", "rejected")

  const { data: allUsers } = await supabase.from("profiles").select("id", { count: "exact" })

  const pendingCount = pendingEvents?.length || 0
  const approvedCount = approvedEvents?.length || 0
  const rejectedCount = rejectedEvents?.length || 0
  const usersCount = allUsers?.length || 0
  // </CHANGE>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/ucu-logo.png" alt="UCU Logo" width={200} height={40} className="h-10 w-auto" />
              <div className="border-l pl-4">
                <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage events and approvals</p>
              </div>
            </div>

            <Link href="/events">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Events</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Events</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">Not approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersCount}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>
        {/* </CHANGE> */}

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending">
              Pending {pendingCount > 0 && <span className="ml-1 text-xs">({pendingCount})</span>}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved {approvedCount > 0 && <span className="ml-1 text-xs">({approvedCount})</span>}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected {rejectedCount > 0 && <span className="ml-1 text-xs">({rejectedCount})</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <AdminEventsList status="pending" />
          </TabsContent>

          <TabsContent value="approved">
            <AdminEventsList status="approved" />
          </TabsContent>

          <TabsContent value="rejected">
            <AdminEventsList status="rejected" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
