"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/modules/auth/actions/auth.action";
import authRoutes from "../auth.route";
import { useUserStore } from "@/store";

export default function LogoutButton() {
  const { user } = useUserStore();
  const userName = user?.email;
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        router.push(authRoutes.login);
        router.refresh(); // Refresh to clear any cached data
      } else {
        console.error("Logout failed:", result.message);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    // todo: improve styling by adding the name and avatar
    <Button variant="ghost" onClick={handleLogout}>
      {userName} <LogOut className="size-4" />
    </Button>
  );
}
