import { createAuthClient } from "better-auth/react";

// Create the auth client for client-side usage
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});
