import { type NextRequest, NextResponse } from "next/server";
import { getAuthInstance } from "./src/modules/auth/utils/auth-utils";

export async function middleware(request: NextRequest) {
  try {
    // Validate session using the same auth instance as the rest of the app
    const auth = await getAuthInstance();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if accessing admin routes
    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

    if (isAdminRoute) {
      // Check if user has admin role
      const user = session.user as { role?: string; email?: string };
      const isAdmin =
        user.role === "admin" ||
        user.role === "superadmin" ||
        user.email?.includes("admin"); // Temporary fallback

      if (!isAdmin) {
        // Not an admin, redirect to regular dashboard with error message
        const url = new URL("/", request.url);
        url.searchParams.set("error", "admin_required");
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error);
    // If session validation fails, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/quiz/:path*",
    "/study/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/progress/:path*",
    "/admin/:path*",
    "/test-db/:path*",
  ],
};
