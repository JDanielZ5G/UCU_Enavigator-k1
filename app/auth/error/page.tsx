import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error_description ? (
              <p className="text-center text-sm text-muted-foreground">{params.error_description}</p>
            ) : params?.error ? (
              <p className="text-center text-sm text-muted-foreground">Error code: {params.error}</p>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                An unexpected error occurred during authentication.
              </p>
            )}

            <div className="pt-4 space-y-2">
              <Link href="/auth/login" className="block w-full">
                <Button className="w-full">Try Again</Button>
              </Link>
              <Link href="/auth/sign-up" className="block w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Create New Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
