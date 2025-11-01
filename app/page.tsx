import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, MapPin, Users, Shield } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <div className="flex justify-center mb-6">
            <Image
              src="/ucu-logo.png"
              alt="Uganda Christian University Logo"
              width={600}
              height={120}
              priority
              className="h-24 w-auto"
            />
          </div>
          {/* </CHANGE> */}

          <h1 className="text-5xl font-bold text-primary">UCU Event Nav</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your gateway to discovering and navigating events at Uganda Christian University&apos;s Faculty of
            Engineering, Design and Technology
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/auth/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="outline">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Event Discovery</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse and search events across Computing, Design, and Engineering departments
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Campus Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Get GPS-based directions to event venues on Mukono campus</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Easy Sign-Ups</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Register for events quickly with integrated Google Forms</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Secure Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>UCU email authentication ensures a safe, verified community</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Departments Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Serving Three Departments</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Computing & Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Tech workshops, hackathons, and innovation seminars</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Visual Art & Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Design thinking sessions, exhibitions, and creative workshops
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Engineering</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Engineering conferences, project showcases, and technical talks
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
