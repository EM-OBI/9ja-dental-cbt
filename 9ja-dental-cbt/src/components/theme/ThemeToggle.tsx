"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeMode } from "@/store/themeStore";

interface ThemeToggleProps {
  variant?: "icon" | "button" | "dropdown";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "icon",
  size = "md",
  className = "",
}) => {
  const { mode, resolvedMode, setMode, toggleMode } = useThemeMode();

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  }[size];

  const baseClasses = `
    inline-flex items-center justify-center
    transition-all duration-200 ease-in-out
    border border-transparent
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    hover:bg-gray-100 dark:hover:bg-gray-700
    ${size === "sm" ? "p-1.5" : size === "md" ? "p-2" : "p-3"}
    ${size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"}
    ${className}
  `;

  if (variant === "icon") {
    return (
      <button
        onClick={toggleMode}
        className={`${baseClasses} rounded-lg`}
        title={`Switch to ${resolvedMode === "light" ? "dark" : "light"} mode`}
        aria-label={`Switch to ${
          resolvedMode === "light" ? "dark" : "light"
        } mode`}
      >
        {resolvedMode === "light" ? (
          <Moon size={iconSize} className="text-gray-600 dark:text-gray-300" />
        ) : (
          <Sun size={iconSize} className="text-gray-600 dark:text-gray-300" />
        )}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={toggleMode}
        className={`${baseClasses} rounded-lg px-4 py-2 gap-2`}
      >
        {resolvedMode === "light" ? (
          <>
            <Moon size={iconSize} />
            <span>Dark Mode</span>
          </>
        ) : (
          <>
            <Sun size={iconSize} />
            <span>Light Mode</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className="relative">
        <div className="grid grid-cols-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setMode("light")}
            className={`
              flex items-center justify-center p-2 rounded-md transition-all duration-200
              ${
                mode === "light"
                  ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
            `}
            title="Light mode"
            aria-label="Light mode"
          >
            <Sun size={iconSize} />
          </button>
          <button
            onClick={() => setMode("dark")}
            className={`
              flex items-center justify-center p-2 rounded-md transition-all duration-200
              ${
                mode === "dark"
                  ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
            `}
            title="Dark mode"
            aria-label="Dark mode"
          >
            <Moon size={iconSize} />
          </button>
          <button
            onClick={() => setMode("system")}
            className={`
              flex items-center justify-center p-2 rounded-md transition-all duration-200
              ${
                mode === "system"
                  ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }
            `}
            title="System mode"
            aria-label="System mode"
          >
            <Monitor size={iconSize} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

// Advanced theme selector with accessibility options
export const ThemeSelector: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { mode, setMode } = useThemeMode();

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme Appearance
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setMode("light")}
            className={`
              relative p-3 rounded-lg border-2 transition-all duration-200
              ${
                mode === "light"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }
            `}
          >
            <Sun className="w-6 h-6 mx-auto mb-2 text-gray-900 dark:text-gray-100" />
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Light
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Default theme
            </div>
          </button>

          <button
            onClick={() => setMode("dark")}
            className={`
              relative p-3 rounded-lg border-2 transition-all duration-200
              ${
                mode === "dark"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }
            `}
          >
            <Moon className="w-6 h-6 mx-auto mb-2 text-gray-900 dark:text-gray-100" />
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Dark
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Easy on eyes
            </div>
          </button>

          <button
            onClick={() => setMode("system")}
            className={`
              relative p-3 rounded-lg border-2 transition-all duration-200
              ${
                mode === "system"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }
            `}
          >
            <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-900 dark:text-gray-100" />
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              System
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Auto switch
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
