import { withAuth } from "@/lib/auth-guards"

/**
 * Test endpoint to verify Casbin RBAC enforcement.
 * Only users with 'mcq:write' permission (e.g., teachers, super_admins) can access this.
 * Students should receive a 403 Forbidden response.
 */
export const GET = withAuth("mcq", "write", async (req, user) => {
  return Response.json({
    message: "Success! You have permission to write MCQs.",
    user: {
      email: user.email,
      role: user.role
    }
  })
})
