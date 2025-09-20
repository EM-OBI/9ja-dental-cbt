"use client";

import React, { useState } from "react";
import { Edit, Save, X, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { AchievementsGrid } from "@/components/profile/AchievementsGrid";
import { SubscriptionCard } from "@/components/profile/SubscriptionCard";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { useUserStore } from "@/store/userStore";
import { useThemeStore } from "@/store/themeStore";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, updateUser, updatePreferences } = useUserStore();
  const { mode, setMode } = useThemeStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateUser({
      ...user,
      name: formData.name,
      email: formData.email,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user.name,
      email: user.email,
      bio: "",
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
    const updatedPreferences = { ...user.preferences };

    if (key === "notifications.studyReminders") {
      updatedPreferences.notifications.studyReminders = value as boolean;
    } else if (key === "notifications.streakAlerts") {
      updatedPreferences.notifications.streakAlerts = value as boolean;
    } else if (key === "notifications.progressReports") {
      updatedPreferences.notifications.progressReports = value as boolean;
    } else if (key === "notifications.achievements") {
      updatedPreferences.notifications.achievements = value as boolean;
    } else if (key === "quiz.defaultMode") {
      updatedPreferences.quiz.defaultMode = value as "study" | "exam";
    } else if (key === "quiz.showExplanations") {
      updatedPreferences.quiz.showExplanations = value as boolean;
    } else if (key === "quiz.autoSubmit") {
      updatedPreferences.quiz.autoSubmit = value as boolean;
    } else if (key === "quiz.timePerQuestion") {
      updatedPreferences.quiz.timePerQuestion = value as number;
    }

    updatePreferences(updatedPreferences);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account, preferences, and achievements
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Profile</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="flex items-center space-x-2"
          >
            <span>Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <span>Settings</span>
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="flex items-center space-x-2"
          >
            <span>Subscription</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Avatar Section */}
              <div className="md:col-span-1">
                <AvatarUploader
                  currentAvatar={user.avatar}
                  userName={user.name}
                  onAvatarChange={handleAvatarChange}
                />
              </div>

              {/* Profile Form */}
              <div className="md:col-span-2 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        disabled={!isEditing}
                        className={cn(!isEditing && "bg-muted")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={true}
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      disabled={!isEditing}
                      className={cn(!isEditing && "bg-muted")}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSaveProfile}
                      className="flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                )}

                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {user.level}
                    </p>
                    <p className="text-sm text-muted-foreground">Level</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {user.xp.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {user.subscription}
                    </p>
                    <p className="text-sm text-muted-foreground">Plan</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Joined</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <AchievementsGrid />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Preferences</h3>
            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Appearance</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={mode === "dark"}
                    onCheckedChange={(checked) =>
                      setMode(checked ? "dark" : "light")
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select
                    value={
                      user.preferences?.study?.defaultFocusTime?.toString() ||
                      "medium"
                    }
                    onValueChange={(value) =>
                      handlePreferenceChange("fontSize", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="study-reminders">Study Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about your study schedule
                      </p>
                    </div>
                    <Switch
                      id="study-reminders"
                      checked={user.preferences.notifications.studyReminders}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "notifications.studyReminders",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="streak-alerts">Streak Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about your study streaks
                      </p>
                    </div>
                    <Switch
                      id="streak-alerts"
                      checked={user.preferences.notifications.streakAlerts}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "notifications.streakAlerts",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="progress-reports">Progress Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly progress summaries
                      </p>
                    </div>
                    <Switch
                      id="progress-reports"
                      checked={user.preferences.notifications.progressReports}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "notifications.progressReports",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="achievements">
                        Achievement Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you earn achievements
                      </p>
                    </div>
                    <Switch
                      id="achievements"
                      checked={user.preferences.notifications.achievements}
                      onCheckedChange={(checked) =>
                        handlePreferenceChange(
                          "notifications.achievements",
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Quiz Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Quiz Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-mode">Default Quiz Mode</Label>
                    <Select
                      value={user.preferences.quiz.defaultMode}
                      onValueChange={(value) =>
                        handlePreferenceChange("quiz.defaultMode", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="study">Study Mode</SelectItem>
                        <SelectItem value="exam">Exam Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-per-question">
                      Time Per Question (seconds)
                    </Label>
                    <Select
                      value={user.preferences.quiz.timePerQuestion.toString()}
                      onValueChange={(value) =>
                        handlePreferenceChange(
                          "quiz.timePerQuestion",
                          parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                        <SelectItem value="90">90 seconds</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-explanations">Show Explanations</Label>
                    <p className="text-sm text-muted-foreground">
                      Display explanations after answering questions
                    </p>
                  </div>
                  <Switch
                    id="show-explanations"
                    checked={user.preferences.quiz.showExplanations}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("quiz.showExplanations", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-submit">Auto Submit</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically submit when time runs out
                    </p>
                  </div>
                  <Switch
                    id="auto-submit"
                    checked={user.preferences.quiz.autoSubmit}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange("quiz.autoSubmit", checked)
                    }
                  />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4 pt-6 border-t border-destructive/20">
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Label className="text-destructive font-medium">
                        Delete Account
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1 mt-2">
                        <p>
                          • All your quiz progress and achievements will be lost
                        </p>
                        <p>• Your subscription will be immediately cancelled</p>
                        <p>• Your study materials and notes will be deleted</p>
                        <p>• This action is irreversible</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAccount}
                      className="ml-4 flex items-center space-x-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>Delete Account</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionCard />
        </TabsContent>
      </Tabs>

      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
        userName={user?.name || "User"}
      />
    </div>
  );
}
