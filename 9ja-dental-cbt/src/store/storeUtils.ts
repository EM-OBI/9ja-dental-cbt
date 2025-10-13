/**
 * Multi-tenant store utilities
 * Ensures each user has isolated data in localStorage
 */

import { getCurrentUserId } from "./userStore";

/**
 * Clear all user-specific data from localStorage
 * Call this when user logs out to prevent data leakage
 */
export const clearUserStores = (userId?: string) => {
  const targetUserId = userId || getCurrentUserId();

  if (!targetUserId) {
    console.warn("No user ID provided for store cleanup");
    return;
  }

  const storesToClear = [
    `quiz-storage-${targetUserId}`,
    `quiz-engine-${targetUserId}`,
    `progress-${targetUserId}`,
    `study-${targetUserId}`,
    `notifications-${targetUserId}`,
    `last-login-activity-${targetUserId}`,
  ];

  storesToClear.forEach((key) => {
    try {
      localStorage.removeItem(key);
      console.log(`✅ Cleared store: ${key}`);
    } catch (error) {
      console.error(`Failed to clear store ${key}:`, error);
    }
  });
};

/**
 * Clear all guest user data
 * Call this to clean up anonymous user data
 */
export const clearGuestStores = () => {
  const guestStores = [
    "quiz-storage-guest",
    "quiz-engine-guest",
    "progress-guest",
    "study-guest",
    "notifications-guest",
    "last-login-activity-guest",
  ];

  guestStores.forEach((key) => {
    try {
      localStorage.removeItem(key);
      console.log(`✅ Cleared guest store: ${key}`);
    } catch (error) {
      console.error(`Failed to clear guest store ${key}:`, error);
    }
  });
};

/**
 * List all user-specific stores in localStorage
 * Useful for debugging
 */
export const listUserStores = (userId?: string) => {
  const targetUserId = userId || getCurrentUserId();

  if (!targetUserId) {
    console.warn("No user ID provided");
    return [];
  }

  const userStores: string[] = [];
  const pattern = new RegExp(`-${targetUserId}$`);

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && pattern.test(key)) {
      userStores.push(key);
    }
  }

  return userStores;
};

/**
 * Get storage size for a specific user
 * Returns size in bytes
 */
export const getUserStorageSize = (userId?: string): number => {
  const targetUserId = userId || getCurrentUserId();

  if (!targetUserId) {
    return 0;
  }

  const stores = listUserStores(targetUserId);
  let totalSize = 0;

  stores.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value) {
      totalSize += new Blob([value]).size;
    }
  });

  return totalSize;
};

/**
 * Export helper to get user-specific storage key
 * Use this pattern in all stores
 */
export const getUserStorageKey = (baseKey: string): string => {
  const userId = getCurrentUserId();
  return userId ? `${baseKey}-${userId}` : `${baseKey}-guest`;
};
