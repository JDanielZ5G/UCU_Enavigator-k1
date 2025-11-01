/**
 * Department Admin Configuration
 *
 * Only these 3 email addresses have admin privileges to create, edit, and delete events.
 * All other users are assigned 'student' role with view-only access.
 *
 * To modify admin list: Update this array and redeploy the application.
 */
export const DEPARTMENT_ADMINS = [
  "wasikejamesdaniel@gmail.com", // Admin 1
  "wjdaniel379@gmail.com", // Admin 2
  "trizzydaniels352@gmail.com", // Admin 3
] as const

/**
 * Check if an email belongs to a department admin
 */
export function isAdminEmail(email: string): boolean {
  return DEPARTMENT_ADMINS.includes(email.toLowerCase().trim() as any)
}

/**
 * Get role based on email
 */
export function getRoleFromEmail(email: string): "admin" | "student" {
  return isAdminEmail(email) ? "admin" : "student"
}
