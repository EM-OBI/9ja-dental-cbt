/**
 * Authentication and Authorization Helper Functions
 */

import { NextRequest } from "next/server";
import { getAuthInstance } from "@/modules/auth/utils/auth-utils";

export type UserRole = "user" | "admin" | "superadmin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
  [key: string]: unknown;
}

/**
 * Get the current authenticated user from the request
 */
export async function getCurrentUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const auth = await getAuthInstance();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return null;
    }

    return session.user as AuthUser;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === "admin" || user.role === "superadmin";
}

/**
 * Check if user has superadmin role
 */
export function isSuperAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === "superadmin";
}

/**
 * Middleware helper to verify admin access
 * Returns user if authorized, throws error if not
 */
export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new Error("Authentication required");
  }

  if (!isAdmin(user)) {
    throw new Error("Admin access required");
  }

  return user;
}

/**
 * API route helper to verify admin access
 * Returns JSON error response if not authorized
 */
export async function verifyAdminAccess(request: NextRequest): Promise<{
  authorized: boolean;
  user?: AuthUser;
  error?: string;
}> {
  try {
    const user = await requireAdmin(request);
    return { authorized: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    return { authorized: false, error: message };
  }
}
