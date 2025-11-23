import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, UserActions, UserPreferences } from "./types";
import { calculateLevelFromXp, calculateXpForLevel } from "@/lib/leveling";
import { clearUserStores } from "./storeUtils";

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type UserStore = UserState & UserActions;

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

export const getCurrentUserId = (): string | null => {
  return useUserStore.getState().user?.id ?? null;
};

export const getUserLevel = (xp: number): number => {
  return calculateLevelFromXp(xp);
};

export const getXpForNextLevel = (currentLevel: number): number => {
  const nextLevel = Math.max(1, Math.floor(currentLevel)) + 1;
  return calculateXpForLevel(nextLevel);
};

export const addXp = (points: number) => {
  const { user, updateUser } = useUserStore.getState();
  if (user) {
    const newXp = user.xp + points;
    const newLevel = calculateLevelFromXp(newXp);

    updateUser({
      xp: newXp,
      level: newLevel,
    });

    // If level increased, show achievement notification
    if (newLevel > user.level) {
      console.log(`Level up! You are now level ${newLevel}`);
    }
  }
};

