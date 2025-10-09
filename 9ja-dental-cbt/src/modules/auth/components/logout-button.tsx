"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/modules/auth/actions/auth.action";
import authRoutes from "../auth.route";
import { useUserStore } from "@/store";
import { useQuizEngineStore } from "@/store/quizEngineStore";
import { useQuizStore } from "@/store/quizStore";
import { useProgressStore } from "@/store/progressStore";
import { useStudyStore } from "@/store/studyStore";
import { useNotificationStore } from "@/store/notificationStore";

export default function LogoutButton() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const userName = user?.email;
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (!result.success) {
        console.error("Logout failed:", result.message);
        return;
      }

      useQuizEngineStore.getState().resetQuiz();
      useQuizStore.getState().resetQuiz();
      useProgressStore.getState().resetProgress();
      useStudyStore.getState().resetStudyPageUI();
      useNotificationStore.getState().clearAllNotifications();
      logout();

      router.replace(authRoutes.login);
      router.refresh();
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
