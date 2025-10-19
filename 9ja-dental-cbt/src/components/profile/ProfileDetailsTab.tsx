import { Save, X } from "lucide-react";
import type { User } from "@/store/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { cn } from "@/lib/utils";

export interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
}

interface ProfileDetailsTabProps {
  user: User;
  formData: ProfileFormData;
  isEditing: boolean;
  onFormChange: (updates: Partial<ProfileFormData>) => void;
  onSave: () => void;
  onCancel: () => void;
  onAvatarChange: (file: File | null) => void;
}

export function ProfileDetailsTab({
  user,
  formData,
  isEditing,
  onFormChange,
  onSave,
  onCancel,
  onAvatarChange,
}: ProfileDetailsTabProps) {
  return (
    <Card className="p-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-amber-200/50 dark:border-slate-700 shadow-lg">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              Profile Picture
            </h3>
            <AvatarUploader
              currentAvatar={user.avatar}
              userName={user.name}
              onAvatarChange={onAvatarChange}
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Personal Information
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="username"
                  className="text-amber-700 dark:text-amber-300 font-medium"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  value={formData.name}
                  onChange={(event) =>
                    onFormChange({ name: event.target.value })
                  }
                  disabled={!isEditing}
                  className={cn(
                    "border-amber-300 focus:border-amber-500 focus:ring-amber-500/20",
                    !isEditing && "bg-amber-50/50 dark:bg-amber-900/10"
                  )}
                />
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-amber-700 dark:text-amber-300 font-medium"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    onFormChange({ email: event.target.value })
                  }
                  disabled
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
                onChange={(event) => onFormChange({ bio: event.target.value })}
                disabled={!isEditing}
                className={cn(!isEditing && "bg-muted")}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex space-x-3">
              <Button onClick={onSave} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
            <ProfileStat label="Level" value={user.level} />
            <ProfileStat label="XP" value={user.xp.toLocaleString()} />
            <ProfileStat label="Plan" value={user.subscription} />
            <ProfileStat
              label="Joined"
              value={new Date(user.joinedDate).toLocaleDateString()}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ProfileStatProps {
  label: string;
  value: string | number;
}

function ProfileStat({ label, value }: ProfileStatProps) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
