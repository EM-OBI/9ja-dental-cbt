// App State Provider Component
"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { initializeStores, useAppState } from "./index";
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

  useEffect(() => {
    // Initialize all stores
    initializeStores();
    setIsInitialized(true);
  }, []);

  // Add global keyboard shortcuts
  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      // Prevent shortcuts during active quiz/study sessions
      if (appState.isInActiveSession) return;

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "q":
            event.preventDefault();
            window.location.href = "/dashboard/quiz";
            break;
          case "s":
            event.preventDefault();
            window.location.href = "/dashboard/study";
            break;
          case "p":
            event.preventDefault();
            window.location.href = "/dashboard/progress";
            break;
          case "h":
            event.preventDefault();
            window.location.href = "/dashboard";
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyboardShortcuts);
    return () =>
      document.removeEventListener("keydown", handleKeyboardShortcuts);
  }, [appState.isInActiveSession]);

  // Auto-save session data periodically
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      // Auto-save current quiz session
      if (appState.currentQuiz?.isActive) {
        // Save quiz progress to localStorage
        localStorage.setItem(
          `quiz-autosave-${appState.currentQuiz.id}`,
          JSON.stringify(appState.currentQuiz)
        );
      }

      // Auto-save current study session
      if (appState.currentStudy?.isActive) {
        // Save study progress to localStorage
        localStorage.setItem(
          `study-autosave-${appState.currentStudy.id}`,
          JSON.stringify(appState.currentStudy)
        );
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isInitialized, appState.currentQuiz, appState.currentStudy]);

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
