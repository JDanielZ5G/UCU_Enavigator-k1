// Type definitions for the application

export interface Event {
  id: string
  title: string
  description: string
  department: "Computing and Technology" | "Visual Art and Design" | "Engineering"
  date: string
  venue: string
  latitude?: number
  longitude?: number
  google_form_url?: string
  status: "pending" | "approved" | "rejected"
  created_by: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export interface EventFormData {
  title: string
  description: string
  department: Event["department"]
  date: string
  venue: string
  latitude?: number
  longitude?: number
  google_form_url?: string
}
