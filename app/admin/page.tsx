import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import AdminEventsList from "@/components/admin/admin-events-list"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage events and approvals</p>
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
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
