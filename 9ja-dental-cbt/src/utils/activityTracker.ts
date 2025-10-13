export const getLoginActivityStorageKey = (userId: string) =>
  `last-login-activity-${userId}`;

interface TrackResult {
  skipped: boolean;
  data?: unknown;
}

export const trackLoginActivity = async (
  userId: string
): Promise<TrackResult> => {
  if (!userId) {
    throw new Error("trackLoginActivity requires a userId");
  }

  if (typeof window === "undefined") {
    return { skipped: true };
  }

  const storageKey = getLoginActivityStorageKey(userId);
  const today = new Date().toISOString().split("T")[0];
  const lastLogged = window.localStorage.getItem(storageKey);

  if (lastLogged === today) {
    return { skipped: true };
  }

  const response = await fetch(`/api/users/${userId}/daily-activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      activityType: "login",
      streakType: "login",
      loginCount: 1,
      metadata: { source: "auth" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to record login activity: ${response.status} ${errorText}`
    );
  }

  const payload = await response.json();
  window.localStorage.setItem(storageKey, today);
  return { skipped: false, data: payload };
};
