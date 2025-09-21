import { useNotificationStore } from "@/store/notificationStore";

// Demo notifications to populate the system
export const addDemoNotifications = () => {
  const { addNotification } = useNotificationStore.getState();

  // Achievement notification
  addNotification({
    userId: "user-123",
    type: "achievement",
    title: "🏆 First Quiz Completed!",
    message:
      "Congratulations! You've completed your first quiz with 85% accuracy.",
    priority: "high",
    isRead: false,
  });

  // Streak notification
  addNotification({
    userId: "user-123",
    type: "streak",
    title: "🔥 7 Day Streak!",
    message:
      "Amazing! You've studied for 7 days in a row. Keep up the great work!",
    priority: "medium",
    isRead: false,
  });

  // Study reminder
  addNotification({
    userId: "user-123",
    type: "reminder",
    title: "⏰ Study Time!",
    message:
      "Don't forget to review Oral Pathology today. You have 3 topics pending.",
    priority: "medium",
    isRead: true,
  });

  // Progress notification
  addNotification({
    userId: "user-123",
    type: "progress",
    title: "📊 Weekly Progress Report",
    message:
      "This week you completed 12 quizzes with 92% average accuracy. Great progress!",
    priority: "low",
    isRead: true,
  });

  // System notification
  addNotification({
    userId: "user-123",
    type: "system",
    title: "🔔 New Features Available",
    message:
      "Check out the new study timer and progress analytics in your dashboard.",
    priority: "low",
    isRead: false,
  });

  // Another achievement
  addNotification({
    userId: "user-123",
    type: "achievement",
    title: "🎯 Perfect Score!",
    message: "Outstanding! You scored 100% on your Periodontics quiz.",
    priority: "high",
    isRead: false,
  });
};

// Utility to add a quick test notification
export const addTestNotification = () => {
  const { addNotification } = useNotificationStore.getState();

  addNotification({
    userId: "user-123",
    type: "system",
    title: "🧪 Test Notification",
    message: `Test notification sent at ${new Date().toLocaleTimeString()}`,
    priority: "medium",
    isRead: false,
  });
};
