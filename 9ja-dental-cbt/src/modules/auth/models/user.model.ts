export interface AuthUser {
  id: string;
  name: string;
  email: string;
  bio?: string; // Optional user biography
  role?: "user" | "admin"; // Role for access control
}
