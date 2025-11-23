import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { User } from "@/store/types";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface ProfileSettingsTabProps {
  user: User;
  mode: "light" | "dark" | "system";
  fontScale: number;
  preferenceSaveStatus: "idle" | "saving" | "saved" | "error";
  onPreferenceChange: (key: string, value: boolean | string | number) => void;
  onToggleDarkMode: (isDark: boolean) => void;
  onFontScaleChange: (scale: number) => void;
  onDeleteAccount: () => void;
}

export function ProfileSettingsTab({
  user,
  mode,
  fontScale,
  preferenceSaveStatus,
  onPreferenceChange,
  onToggleDarkMode,
  onFontScaleChange,
  onDeleteAccount,
}: ProfileSettingsTabProps) {
  const fontSizeOptions = [
    { value: "small", label: "Small", scale: 0.9 },
    { value: "medium", label: "Medium", scale: 1 },
    { value: "large", label: "Large", scale: 1.15 },
  ];

  const nearestFontOption = fontSizeOptions.reduce((nearest, option) => {
    const currentDiff = Math.abs(option.scale - fontScale);
    const nearestDiff = Math.abs(nearest.scale - fontScale);
    return currentDiff < nearestDiff ? option : nearest;
  }, fontSizeOptions[0]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Preferences</h3>
        <StatusBadge status={preferenceSaveStatus} />
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
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
              onCheckedChange={onToggleDarkMode}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size</Label>
            <Select
              value={nearestFontOption.value}
              onValueChange={(value) => {
                const option = fontSizeOptions.find(
                  (item) => item.value === value
                );
                if (option) {
                  onFontScaleChange(option.scale);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="font-medium">Notifications</h4>
          <PreferenceToggle
            id="study-reminders"
            label="Study Reminders"
            description="Get notified about your study schedule"
            checked={user.preferences.notifications.studyReminders}
            onChange={(value) =>
              onPreferenceChange("notifications.studyReminders", value)
            }
          />
          <PreferenceToggle
            id="streak-alerts"
            label="Streak Alerts"
            description="Get notified about your study streaks"
            checked={user.preferences.notifications.streakAlerts}
            onChange={(value) =>
              onPreferenceChange("notifications.streakAlerts", value)
            }
          />
          <PreferenceToggle
            id="progress-reports"
            label="Progress Reports"
            description="Receive weekly progress summaries"
            checked={user.preferences.notifications.progressReports}
            onChange={(value) =>
              onPreferenceChange("notifications.progressReports", value)
            }
          />
          <PreferenceToggle
            id="achievements"
            label="Achievement Notifications"
            description="Get notified when you earn achievements"
            checked={user.preferences.notifications.achievements}
            onChange={(value) =>
              onPreferenceChange("notifications.achievements", value)
            }
          />
        </section>

        <section className="space-y-4">
          <h4 className="font-medium">Quiz Preferences</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-mode">Default Quiz Mode</Label>
              <Select
                value={user.preferences.quiz.defaultMode}
                onValueChange={(value) =>
                  onPreferenceChange("quiz.defaultMode", value)
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
                  onPreferenceChange(
                    "quiz.timePerQuestion",
                    parseInt(value, 10)
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
          <PreferenceToggle
            id="show-explanations"
            label="Show Explanations"
            description="Display explanations after answering questions"
            checked={user.preferences.quiz.showExplanations}
            onChange={(value) =>
              onPreferenceChange("quiz.showExplanations", value)
            }
          />
          <PreferenceToggle
            id="auto-submit"
            label="Auto Submit"
            description="Automatically submit when time runs out"
            checked={user.preferences.quiz.autoSubmit}
            onChange={(value) => onPreferenceChange("quiz.autoSubmit", value)}
          />
        </section>

        <section className="space-y-4 pt-6 border-t border-destructive/20">
          <h4 className="font-medium text-destructive">Danger Zone</h4>
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Label className="text-destructive font-medium">
                  Delete Account
                </Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                  <p>• All your quiz progress and achievements will be lost</p>
                  <p>• Your subscription will be immediately cancelled</p>
                  <p>• Your study materials and notes will be deleted</p>
                  <p>• This action is irreversible</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDeleteAccount}
                className="ml-4 flex items-center space-x-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Delete Account</span>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Card>
  );
}

interface PreferenceToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function PreferenceToggle({
  id,
  label,
  description,
  checked,
  onChange,
}: PreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

interface StatusBadgeProps {
  status: "idle" | "saving" | "saved" | "error";
}

function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "saving") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4" />
        <span>Saved</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span>Failed to save</span>
      </div>
    );
  }

  return null;
}
