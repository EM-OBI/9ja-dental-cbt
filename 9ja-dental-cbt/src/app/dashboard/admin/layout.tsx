"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { Shield, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Admin Layout - Protects all admin routes
 * Checks if user has admin role before allowing access
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useUserStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication and admin role
    const checkAdminAccess = () => {
      if (isLoading) {
        return; // Wait for auth to load
      }

      if (!isAuthenticated || !user) {
        // Not logged in, redirect to login
        router.push("/login?redirect=/dashboard/admin");
        return;
      }

      // Check if user has admin role
      // TODO: Replace this with actual role check from your user object
      // For now, checking if email contains "admin" or explicitly checking role
      const isAdmin =
        user.role === "admin" ||
        user.role === "superadmin" ||
        user.email?.includes("admin"); // Temporary fallback

      if (!isAdmin) {
        // Not an admin, redirect to regular dashboard
        router.push("/dashboard");
        return;
      }

      setIsChecking(false);
    };

    checkAdminAccess();
  }, [user, isAuthenticated, isLoading, router]);

  // Show loading state while checking
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Verifying Access...</h2>
          <p className="text-muted-foreground">Checking admin permissions...</p>
        </Card>
      </div>
    );
  }

  // Show error if somehow we get here without proper auth
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md text-center border-red-200">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You must be logged in to access the admin panel.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Login
          </button>
        </Card>
      </div>
    );
  }

  // Render admin content
  return <>{children}</>;
}
