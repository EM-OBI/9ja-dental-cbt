"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { initializeStores, useAppState } from "./index";
import { useQuizStore } from "./quizStore";
import { useStudyStore } from "./studyStore";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

interface AppStateContextType {
  isInitialized: boolean;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

export const useAppStateContext = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error(
      "useAppStateContext must be used within an AppStateProvider"
    );
  }
  return context;
};

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({
  children,
}) => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const appState = useAppState();
  const router = useRouter();

  useEffect(() => {
    // Initialize all stores
    initializeStores();
    setIsInitialized(true);
  }, []);

  // Add global keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      // Get fresh state inside handler instead of depending on it
      const currentQuiz = useQuizStore.getState().currentSession;
      const currentStudy = useStudyStore.getState().currentSession;
      const isInActiveSession = !!(
        currentQuiz?.isActive || currentStudy?.isActive
      );

      // Prevent shortcuts during active quiz/study sessions
      if (isInActiveSession) return;

      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        switch (event.key) {
          case "q":
            router.push("/quiz");
            break;
          case "s":
            router.push("/study");
            break;
          case "p":
            router.push("/progress");
            break;
          case "h":
            router.push("/overview");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyboardShortcuts);
    return () =>
      document.removeEventListener("keydown", handleKeyboardShortcuts);
  }, [router]); // Only depend on router, get fresh state inside handler

  // Auto-save session data periodically
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      // Get fresh state from stores inside interval instead of depending on it
      const currentQuiz = useQuizStore.getState().currentSession;
      const currentStudy = useStudyStore.getState().currentSession;

      // Auto-save current quiz session
      if (currentQuiz?.isActive) {
        // Save quiz progress to localStorage
        localStorage.setItem(
          `quiz-autosave-${currentQuiz.id}`,
          JSON.stringify(currentQuiz)
        );
      }

      // Auto-save current study session
      if (currentStudy?.isActive) {
        // Save study progress to localStorage
        localStorage.setItem(
          `study-autosave-${currentStudy.id}`,
          JSON.stringify(currentStudy)
        );
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isInitialized]); // Only depend on isInitialized to avoid recreating interval

  // Show streak notifications
  useEffect(() => {
    if (isInitialized && appState.streakData.currentStreak > 0) {
      const today = new Date().toISOString().split("T")[0];
      const lastNotificationDate = localStorage.getItem(
        "last-streak-notification"
      );

      if (
        lastNotificationDate !== today &&
        appState.streakData.currentStreak >= 3
      ) {
        // Show streak notification (but not too frequently)
        import("./notificationStore").then(({ showStreakNotification }) => {
          showStreakNotification(appState.streakData.currentStreak);
        });
        localStorage.setItem("last-streak-notification", today);
      }
    }
  }, [isInitialized, appState.streakData.currentStreak]);

  return (
    <AppStateContext.Provider value={{ isInitialized }}>
      <ThemeProvider>{children}</ThemeProvider>
    </AppStateContext.Provider>
  );
};

// HOC for components that need app state
export const withAppState = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    <AppStateProvider>
      <Component {...props} />
    </AppStateProvider>
  );

  WrappedComponent.displayName = `withAppState(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
};
