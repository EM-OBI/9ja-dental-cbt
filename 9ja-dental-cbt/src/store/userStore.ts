import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, UserActions, UserPreferences } from "./types";
import { databaseService } from "@/services/database";
import { authClient } from "@/modules/auth/utils/auth-client";
import { clearUserStores } from "./storeUtils";

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type UserStore = UserState & UserActions;

// Default user preferences
const defaultPreferences: UserPreferences = {
  theme: "system",
  notifications: {
    studyReminders: true,
    streakAlerts: true,
    progressReports: true,
    achievements: true,
  },
  quiz: {
    defaultMode: "study",
    showExplanations: true,
    timePerQuestion: 60,
    autoSubmit: false,
  },
  study: {
    defaultFocusTime: 25,
    breakTime: 5,
    soundEffects: true,
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      updatePreferences: (preferences: Partial<UserPreferences>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              preferences: {
                ...currentUser.preferences,
                ...preferences,
              },
            },
          });
        }
      },

      logout: () => {
        const userId = get().user?.id;

        // Clear user-specific stores
        if (userId) {
          clearUserStores(userId);
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper functions
export const initializeUser = async () => {
  // Check for authentication tokens and load user data from API
  const { setUser, logout, user: existingUser } = useUserStore.getState();
  const previousUserId = existingUser?.id ?? null;

  const cloneDefaultPreferences = (): UserPreferences => ({
    theme: defaultPreferences.theme,
    notifications: { ...defaultPreferences.notifications },
    quiz: { ...defaultPreferences.quiz },
    study: { ...defaultPreferences.study },
  });

  const mergeUserPreferences = (rawPreferences: unknown): UserPreferences => {
    const merged = cloneDefaultPreferences();

    if (!rawPreferences || typeof rawPreferences !== "object") {
      return merged;
    }

    const prefs = rawPreferences as Record<string, unknown>;

    if (
      typeof prefs.theme === "string" &&
      ["light", "dark", "system"].includes(prefs.theme)
    ) {
      merged.theme = prefs.theme as UserPreferences["theme"];
    }

    const notificationSource = prefs.notifications;
    if (typeof notificationSource === "boolean") {
      merged.notifications.studyReminders = notificationSource;
      merged.notifications.streakAlerts = notificationSource;
      merged.notifications.progressReports = notificationSource;
      merged.notifications.achievements = notificationSource;
    } else if (notificationSource && typeof notificationSource === "object") {
      const notifications = notificationSource as Record<string, unknown>;
      if (typeof notifications.studyReminders === "boolean") {
        merged.notifications.studyReminders = notifications.studyReminders;
      }
      if (typeof notifications.streakAlerts === "boolean") {
        merged.notifications.streakAlerts = notifications.streakAlerts;
      }
      if (typeof notifications.progressReports === "boolean") {
        merged.notifications.progressReports = notifications.progressReports;
      }
      if (typeof notifications.achievements === "boolean") {
        merged.notifications.achievements = notifications.achievements;
      }
      if (typeof notifications.study_reminders === "boolean") {
        merged.notifications.studyReminders = notifications.study_reminders;
      }
    }

    if (typeof prefs.study_reminders === "boolean") {
      merged.notifications.studyReminders = prefs.study_reminders;
    }

    const quizSource = prefs.quiz;
    if (quizSource && typeof quizSource === "object") {
      const quizPrefs = quizSource as Record<string, unknown>;
      if (
        typeof quizPrefs.defaultMode === "string" &&
        ["study", "exam"].includes(quizPrefs.defaultMode)
      ) {
        merged.quiz.defaultMode = quizPrefs.defaultMode as "study" | "exam";
      }
      if (typeof quizPrefs.showExplanations === "boolean") {
        merged.quiz.showExplanations = quizPrefs.showExplanations;
      }
      if (typeof quizPrefs.timePerQuestion === "number") {
        merged.quiz.timePerQuestion = quizPrefs.timePerQuestion;
      }
      if (typeof quizPrefs.autoSubmit === "boolean") {
        merged.quiz.autoSubmit = quizPrefs.autoSubmit;
      }
    }

    const studySource = prefs.study;
    if (studySource && typeof studySource === "object") {
      const studyPrefs = studySource as Record<string, unknown>;
      if (typeof studyPrefs.defaultFocusTime === "number") {
        merged.study.defaultFocusTime = studyPrefs.defaultFocusTime;
      }
      if (typeof studyPrefs.breakTime === "number") {
        merged.study.breakTime = studyPrefs.breakTime;
      }
      if (typeof studyPrefs.soundEffects === "boolean") {
        merged.study.soundEffects = studyPrefs.soundEffects;
      }
    }

    return merged;
  };

  const buildUserFromSources = (
    sessionUser: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    },
    backendUser?: Record<string, unknown> | null
  ): User => {
    const backend = backendUser ?? null;

    const nameFromBackend =
      backend && typeof backend.name === "string"
        ? (backend.name as string)
        : undefined;
    const nameFromSession =
      typeof sessionUser.name === "string" && sessionUser.name.trim().length
        ? sessionUser.name
        : undefined;
    const fallbackName = sessionUser.email.split("@")[0];

    const allowedSubscriptions: User["subscription"][] = [
      "free",
      "premium",
      "enterprise",
    ];
    const rawSubscription =
      backend && typeof backend.subscription === "string"
        ? (backend.subscription as string)
        : undefined;
    const subscription = allowedSubscriptions.includes(
      rawSubscription as User["subscription"]
    )
      ? (rawSubscription as User["subscription"])
      : "free";

    const rawLevel = backend ? backend.level : undefined;
    const level =
      typeof rawLevel === "number" ? rawLevel : Number(rawLevel ?? 1) || 1;

    const rawXp = backend ? backend.xp : undefined;
    const xp = typeof rawXp === "number" ? rawXp : Number(rawXp ?? 0) || 0;

    const rawCreatedAt = backend
      ? backend["created_at"] ?? backend["createdAt"]
      : undefined;
    const joinedDate =
      typeof rawCreatedAt === "string"
        ? rawCreatedAt
        : rawCreatedAt instanceof Date
        ? rawCreatedAt.toISOString()
        : new Date().toISOString();

    const preferences = mergeUserPreferences(
      backend ? backend["preferences"] : undefined
    );

    const rawAvatar = backend ? backend.avatar : undefined;

    return {
      id: sessionUser.id,
      name: nameFromBackend || nameFromSession || fallbackName,
      email: sessionUser.email,
      avatar:
        (typeof rawAvatar === "string" ? rawAvatar : undefined) ||
        sessionUser.image ||
        undefined,
      subscription,
      level,
      xp,
      joinedDate,
      preferences,
    };
  };

  try {
    useUserStore.setState({ isLoading: true });

    const session = await authClient.getSession();
    const sessionUser = session?.data?.user;

    if (!sessionUser) {
      logout();
      return;
    }

    // If the authenticated user changed, clear user-specific storage before rehydrating
    if (previousUserId && previousUserId !== sessionUser.id) {
      try {
        clearUserStores(previousUserId);
        const { useProgressStore } = await import("./progressStore");
        useProgressStore.getState().resetProgress();
      } catch (cleanupError) {
        console.warn("Failed to reset stores for previous user", cleanupError);
      }
    }

    let backendUser: Record<string, unknown> | null = null;
    try {
      backendUser = (await databaseService.getUserById(
        sessionUser.id
      )) as Record<string, unknown> | null;
    } catch (error) {
      console.warn(
        "Unable to fetch user from backend, using session data only",
        error
      );
    }

    const user = buildUserFromSources(sessionUser, backendUser);
    setUser(user);
  } catch (error) {
    console.error("Failed to initialize user:", error);
    logout();
  } finally {
    useUserStore.setState({ isLoading: false });
  }
};

export const getCurrentUserId = (): string | null => {
  return useUserStore.getState().user?.id ?? null;
};

export const getUserLevel = (xp: number): number => {
  // XP requirements: Level 1 = 0, Level 2 = 100, Level 3 = 250, etc.
  return Math.floor(Math.sqrt(xp / 25)) + 1;
};

export const getXpForNextLevel = (currentLevel: number): number => {
  return Math.pow(currentLevel, 2) * 25;
};

export const addXp = (points: number) => {
  const { user, updateUser } = useUserStore.getState();
  if (user) {
    const newXp = user.xp + points;
    const newLevel = getUserLevel(newXp);

    updateUser({
      xp: newXp,
      level: newLevel,
    });

    // If level increased, show achievement notification
    if (newLevel > user.level) {
      // This would trigger a notification in the notification store
      console.log(`Level up! You are now level ${newLevel}`);
    }
  }
};
