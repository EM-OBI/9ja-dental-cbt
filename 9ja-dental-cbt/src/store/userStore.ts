import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, UserActions, UserPreferences } from "./types";
import { databaseService } from "@/services/database";

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
  const { setUser, logout } = useUserStore.getState();

  try {
    // For now, we'll skip automatic user initialization since we don't have
    // authentication tokens implemented yet. This would typically:
    // 1. Check for stored auth token
    // 2. Validate token with backend
    // 3. Load user profile if valid

    // Example implementation:
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   const currentUser = await databaseService.getCurrentUser();
    //   setUser(currentUser);
    // } else {
    //   logout();
    // }

    console.log(
      "User initialization ready - authentication flow not implemented yet"
    );
  } catch (error) {
    console.error("Failed to initialize user:", error);
    logout();
  }
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
