// Validation utilities

/**
 * Validates if an email belongs to UCU domain
 */
export function isUCUEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@ucu.ac.ug")
}

/**
 * Validates event form data
 */
export function validateEventData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Title is required")
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push("Description is required")
  }

  if (!data.department) {
    errors.push("Department is required")
  }

  if (!data.date) {
    errors.push("Date is required")
  } else {
    const eventDate = new Date(data.date)
    if (eventDate < new Date()) {
      errors.push("Event date must be in the future")
    }
  }

  if (!data.venue || data.venue.trim().length === 0) {
    errors.push("Venue is required")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
