"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AchievementsGrid } from "@/components/profile/AchievementsGrid";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { ProfileDetailsTab } from "@/components/profile/ProfileDetailsTab";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import {
  ProfileTab,
  ProfileTabNavigation,
} from "@/components/profile/ProfileTabNavigation";
import { ProfileSettingsTab } from "@/components/profile/ProfileSettingsTab";
import { SubscriptionCard } from "@/components/profile/SubscriptionCard";
import { useUserStore } from "@/store/userStore";
import { useThemeStore } from "@/store/themeStore";
import { useUnifiedProgressData } from "@/hooks/useUnifiedProgressData";
import type { ProfileFormData } from "@/components/profile/ProfileDetailsTab";
import type { UserPreferences } from "@/store/types";

const DEFAULT_FORM_STATE: ProfileFormData = {
  name: "",
  email: "",
  bio: "",
};

export default function ProfilePage() {
  const { user, updateUser, updatePreferences } = useUserStore();
  const { mode, setMode, fontScale, setFontScale } = useThemeStore();

  // Get progress data for specialty mastery
  const userId = user?.id ?? "";
  const { progressData } = useUnifiedProgressData(userId, false);

  // Custom tab state management
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(() => ({
    ...DEFAULT_FORM_STATE,
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
  }));

  // Preferences API state
  const [preferenceSaveStatus, setPreferenceSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load preferences from API on mount
  useEffect(() => {
    const loadPreferencesFromAPI = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/users/${user.id}/preferences`);
        if (response.ok) {
          const result = (await response.json()) as {
            success: boolean;
            data: unknown;
            source: string;
          };
          if (result.success && result.data) {
            // Merge API preferences with local state
            updatePreferences(result.data);
            console.log("✅ Preferences loaded from", result.source);
          }
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      }
    };

    if (user?.id) {
      loadPreferencesFromAPI();
    }
  }, [user?.id, updatePreferences]);

  // Keep form data in sync when user data changes (unless actively editing)
  useEffect(() => {
    if (!user || isEditing) return;

    setFormData({
      ...DEFAULT_FORM_STATE,
      name: user.name,
      email: user.email,
      bio: user.bio || "",
    });
  }, [user, isEditing]);

  // Clear pending preference saves on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Debounced save to API
  const savePreferencesToAPI = useCallback(
    async (preferences: UserPreferences) => {
      if (!user?.id) return;

      // Clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set saving status
      setPreferenceSaveStatus("saving");

      // Debounce the API call
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/users/${user.id}/preferences`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(preferences),
          });

          if (response.ok) {
            setPreferenceSaveStatus("saved");
            // Reset status after 2 seconds
            setTimeout(() => setPreferenceSaveStatus("idle"), 2000);
          } else {
            setPreferenceSaveStatus("error");
            setTimeout(() => setPreferenceSaveStatus("idle"), 3000);
          }
        } catch (error) {
          console.error("Failed to save preferences:", error);
          setPreferenceSaveStatus("error");
          setTimeout(() => setPreferenceSaveStatus("idle"), 3000);
        }
      }, 800); // 800ms debounce
    },
    [user]
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Under construction...</p>
      </div>
    );
  }

  const handleFormChange = (updates: Partial<ProfileFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveProfile = () => {
    updateUser({
      ...user,
      name: formData.name,
      email: formData.email,
      bio: formData.bio,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData({
      ...DEFAULT_FORM_STATE,
      name: user.name,
      email: user.email,
      bio: user.bio || "",
    });
    setIsEditing(false);
  };

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      // In a real app, you would upload the file to your server
      console.log("Avatar file:", file);
      // For now, we'll just log it
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    // In a real app, you would call an API to delete the account
    console.log("Account deletion confirmed");

    // Here you would:
    // 1. Call API to delete account
    // 2. Clear all local storage
    // 3. Redirect to login/goodbye page

    // For demo purposes, just log the action
    // await deleteAccount(user.id);
    // clearUserData();
    // router.push('/account-deleted');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert("Account deletion initiated. You will be logged out shortly.");
  };

  const handlePreferenceChange = (
    key: string,
    value: boolean | string | number
  ) => {
    if (!user) return;

    const updatedPreferences: UserPreferences = {
      ...user.preferences,
      notifications: { ...user.preferences.notifications },
      quiz: { ...user.preferences.quiz },
      study: { ...user.preferences.study },
    };

    const segments = key.split(".");
    const preferencesRecord = updatedPreferences as unknown as Record<
      string,
      unknown
    >;

    if (segments.length === 1) {
      preferencesRecord[segments[0]] = value;
    } else {
      let cursor = preferencesRecord;

      segments.forEach((segment, index) => {
        if (index === segments.length - 1) {
          cursor[segment] = value;
          return;
        }

        const nextValue = cursor[segment];
        if (typeof nextValue === "object" && nextValue !== null) {
          cursor[segment] = {
            ...(nextValue as Record<string, unknown>),
          };
          cursor = cursor[segment] as Record<string, unknown>;
        } else {
          cursor[segment] = {};
          cursor = cursor[segment] as Record<string, unknown>;
        }
      });
    }

    updatePreferences(updatedPreferences);
    savePreferencesToAPI(updatedPreferences);
  };

  return (
    <div className="py-4 bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30 dark:bg-background">
      <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-6">
        <ProfileHeaderCard
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing((previous) => !previous)}
        />

        <div className="space-y-6">
          <ProfileTabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === "profile" && user && (
            <ProfileDetailsTab
              user={user}
              formData={formData}
              isEditing={isEditing}
              onFormChange={handleFormChange}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
              onAvatarChange={handleAvatarChange}
            />
          )}

          {activeTab === "achievements" && (
            <AchievementsGrid
              specialtyCoverage={progressData?.specialtyCoverage}
            />
          )}

          {activeTab === "settings" && user && (
            <ProfileSettingsTab
              user={user}
              mode={mode}
              fontScale={fontScale}
              preferenceSaveStatus={preferenceSaveStatus}
              onPreferenceChange={handlePreferenceChange}
              onToggleDarkMode={(checked) =>
                setMode(checked ? "dark" : "light")
              }
              onFontScaleChange={setFontScale}
              onDeleteAccount={handleDeleteAccount}
            />
          )}

          {activeTab === "subscription" && <SubscriptionCard />}
        </div>

        <DeleteAccountDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirmDelete={handleConfirmDelete}
          userName={user?.name || "User"}
        />
      </div>
    </div>
  );
}
