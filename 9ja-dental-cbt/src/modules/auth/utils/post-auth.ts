"use client";

import { initializeUser } from "@/store";
import { useProgressStore } from "@/store/progressStore";
import { useUserStore } from "@/store/userStore";
import { trackLoginActivity } from "@/utils/activityTracker";

export const hydrateClientAfterAuth = async () => {
  await initializeUser();

  const userId = useUserStore.getState().user?.id;

  if (!userId) {
    return;
  }

  let loginRecorded = false;
  try {
    const result = await trackLoginActivity(userId);
    loginRecorded = !result.skipped;
  } catch (error) {
    console.warn("Login activity tracking failed", error);
  }

  const progressStore = useProgressStore.getState();
  progressStore.resetProgress();
  await progressStore.loadProgressFromDatabase(userId);

  if (loginRecorded) {
    progressStore.updateStreak("login");
  }

  progressStore.updateStats();
};
