import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderCardProps {
  isEditing: boolean;
  onToggleEdit: () => void;
}

export function ProfileHeaderCard({
  isEditing,
  onToggleEdit,
}: ProfileHeaderCardProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 dark:border-slate-700 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xs font-bold text-slate-800 dark:text-slate-100">
            Account Settings
          </h1>
          <p className="text-amber-700 dark:text-amber-300 mt-2 text-xs font-medium">
            Manage your account, preferences, and achievements
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onToggleEdit}
          className="flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-700 hover:text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300"
        >
          <Edit className="h-4 w-4" />
          <span>{isEditing ? "Close Editor" : "Edit Profile"}</span>
        </Button>
      </div>
    </div>
  );
}
