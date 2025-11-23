/**
 * Role-Based Access Control Utilities
 *
 * Helper functions for checking user roles and permissions
 */

import { getCurrentUser } from "@/modules/auth/utils/auth-utils";
import type { AuthUser } from "@/modules/auth/models/user.model";

export type UserRole = "user" | "admin";

/**
 * Check if current user has admin role
 * @returns Promise<boolean> - true if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

/**
 * Check if a specific user has admin role
 * @param user - The user to check
 * @returns boolean - true if user is admin
 */
export function hasAdminRole(user: AuthUser | null): boolean {
  return user?.role === "admin";
}

/**
 * Require admin role or throw error
 * Use in API routes that require admin access
 * @throws Error if user is not admin
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return user;
}

/**
 * Check if user has specific role
 * @param role - Role to check for
 * @returns Promise<boolean>
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Get user role or default to 'user'
 * @returns Promise<UserRole>
 */
export async function getUserRole(): Promise<UserRole> {
  const user = await getCurrentUser();
  return user?.role || "user";
}
