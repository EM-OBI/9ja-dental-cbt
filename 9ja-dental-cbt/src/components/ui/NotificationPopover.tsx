"use client";

import React from "react";
import { Bell, Check, X, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotificationStore } from "@/store/notificationStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Notification } from "@/store/types";

interface NotificationPopoverProps {
  className?: string;
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "achievement":
      return "🏆";
    case "streak":
      return "🔥";
    case "reminder":
      return "⏰";
    case "progress":
      return "📊";
    case "system":
      return "🔔";
    default:
      return "🔔";
  }
};

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "achievement":
      return "text-amber-600 dark:text-amber-400";
    case "streak":
      return "text-orange-600 dark:text-orange-400";
    case "reminder":
      return "text-blue-600 dark:text-blue-400";
    case "progress":
      return "text-green-600 dark:text-green-400";
    case "system":
      return "text-slate-600 dark:text-slate-400";
    default:
      return "text-slate-600 dark:text-slate-400";
  }
};

const getRelativeTime = (timestamp: string) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - notificationTime.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return notificationTime.toLocaleDateString();
};

export function NotificationPopover({ className }: NotificationPopoverProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const recentNotifications = notifications
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 10);

  const hasNotifications = notifications.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors",
            className
          )}
          title="Notifications"
        >
          <Bell className="h-5 w-5 text-slate-700 dark:text-white" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-white text-xs font-medium flex items-center justify-center min-w-[20px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
            Notifications
          </h3>
          {hasNotifications && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 h-7"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearAllNotifications()}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 h-7"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {!hasNotifications ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No notifications yet
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                You&apos;ll see your notifications here
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {recentNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group",
                    !notification.isRead &&
                      "bg-orange-50/50 dark:bg-orange-950/20"
                  )}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={cn(
                            "text-sm font-medium truncate",
                            notification.isRead
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-900 dark:text-white"
                          )}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-orange-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6 text-slate-400 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {getRelativeTime(notification.timestamp)}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            getNotificationColor(notification.type)
                          )}
                        >
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {hasNotifications && notifications.length > 10 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-600 dark:text-slate-400"
            >
              <Eye className="h-3 w-3 mr-1" />
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
