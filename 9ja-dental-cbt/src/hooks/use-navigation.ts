"use client";

import { usePathname } from "next/navigation";

const useNavigation = () => {
  const pathname = usePathname();

  const isHomeActive = pathname === "/overview";
  const isExploreActive = pathname === "/quiz";
  const isNotificationsActive = pathname === "/leaderboard";
  const isMessagesActive = pathname === "/progress";

  return {
    isHomeActive,
    isExploreActive,
    isNotificationsActive,
    isMessagesActive,
  };
};

export default useNavigation;
