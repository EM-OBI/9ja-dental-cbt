"use client";

import { usePathname } from "next/navigation";

const useNavigation = () => {
  const pathname = usePathname();

  const isHomeActive = pathname === "/dashboard";
  const isExploreActive = pathname === "/dashboard/quiz";
  const isNotificationsActive = pathname === "/dashboard/leaderboard";
  const isMessagesActive = pathname === "/dashboard/progress";

  return {
    isHomeActive,
    isExploreActive,
    isNotificationsActive,
    isMessagesActive,
  };
};

export default useNavigation;
