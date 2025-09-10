import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Notification as AppNotification,
  NotificationActions,
} from "./types";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      isLoading: false,

      // Actions
      addNotification: (
        notification: Omit<AppNotification, "id" | "timestamp">
      ) => {
        const newNotification: AppNotification = {
          ...notification,
          id: `notification-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

        const notifications = [newNotification, ...get().notifications];
        const unreadCount = notifications.filter((n) => !n.isRead).length;

        set({
          notifications,
          unreadCount,
        });

        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new window.Notification(newNotification.title, {
            body: newNotification.message,
            icon: "/favicon.ico",
          });
        }
      },

      markAsRead: (notificationId: string) => {
        const notifications = get().notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        );

        const unreadCount = notifications.filter((n) => !n.isRead).length;

        set({
          notifications,
          unreadCount,
        });
      },

      markAllAsRead: () => {
        const notifications = get().notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));

        set({
          notifications,
          unreadCount: 0,
        });
      },

      deleteNotification: (notificationId: string) => {
        const notifications = get().notifications.filter(
          (notification) => notification.id !== notificationId
        );

        const unreadCount = notifications.filter((n) => !n.isRead).length;

        set({
          notifications,
          unreadCount,
        });
      },

      clearAllNotifications: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

// Helper functions
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showAchievementNotification = (
  title: string,
  description: string
) => {
  const { addNotification } = useNotificationStore.getState();

  addNotification({
    userId: "user-123", // Get from user store
    type: "achievement",
    title: `🎉 Achievement Unlocked!`,
    message: `${title}: ${description}`,
    priority: "high",
    isRead: false,
  });
};

export const showStreakNotification = (streakCount: number) => {
  const { addNotification } = useNotificationStore.getState();

  addNotification({
    userId: "user-123", // Get from user store
    type: "streak",
    title: `🔥 ${streakCount} Day Streak!`,
    message: `You're on fire! Keep up the great work.`,
    priority: "medium",
    isRead: false,
  });
};

export const showReminderNotification = (
  type: "study" | "quiz",
  message: string
) => {
  const { addNotification } = useNotificationStore.getState();

  addNotification({
    userId: "user-123", // Get from user store
    type: "reminder",
    title: "⏰ Study Reminder",
    message,
    priority: "medium",
    isRead: false,
  });
};

export const getNotificationsByType = (type: AppNotification["type"]) => {
  const { notifications } = useNotificationStore.getState();
  return notifications.filter((notification) => notification.type === type);
};

export const getRecentNotifications = (limit: number = 5) => {
  const { notifications } = useNotificationStore.getState();
  return notifications
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
};
