import { auth } from "@/auth"
import { checkPermission } from "@/lib/casbin"

/**
 * Helper to enforce Casbin permissions in API routes and Server Actions.
 * 
 * @param {string} resource - The resource being accessed (e.g., 'mcq', 'past_paper')
 * @param {string} action - The action being performed (e.g., 'read', 'write')
 * @returns {Promise<{user: any} | {error: string, status: number}>}
 */
export async function authorize(resource, action) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }

  const isAllowed = await checkPermission(session.user.role, resource, action)

  if (!isAllowed) {
    return { error: "Forbidden", status: 403 }
  }

  return { user: session.user }
}

/**
 * High-order function to wrap route handlers with permission checks.
 */
export function withAuth(resource, action, handler) {
  return async (req, context) => {
    const result = await authorize(resource, action)
    
    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status })
    }

    return handler(req, result.user, context)
  }
}
