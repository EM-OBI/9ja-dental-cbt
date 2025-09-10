import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, UserActions, UserPreferences } from "./types";

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

// Mock user data for development
const mockUser: User = {
  id: "user-123",
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  avatar: "/avatars/alex.jpg",
  subscription: "premium",
  level: 15,
  xp: 2850,
  joinedDate: "2024-01-15",
  preferences: defaultPreferences,
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
export const initializeUser = () => {
  // In a real app, this would check for authentication tokens
  // and load user data from an API
  const { setUser } = useUserStore.getState();

  // For development, set mock user
  setTimeout(() => {
    setUser(mockUser);
  }, 1000);
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
