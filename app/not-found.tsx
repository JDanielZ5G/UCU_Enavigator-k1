import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileQuestion className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            <div className="pt-4">
              <Link href="/events" className="block w-full">
                <Button className="w-full">Go to Events</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
