"use client";

import React from "react";
import { Type, Zap, ZapOff } from "lucide-react";
import { useThemeAccessibility } from "@/store/themeStore";

interface AccessibilitySettingsProps {
  className?: string;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  className = "",
}) => {
  const { fontScale, reducedMotion, setFontScale, setReducedMotion } =
    useThemeAccessibility();

  const fontScaleOptions = [
    { value: 0.75, label: "Small", description: "75%" },
    { value: 1, label: "Default", description: "100%" },
    { value: 1.25, label: "Large", description: "125%" },
    { value: 1.5, label: "Extra Large", description: "150%" },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Font Size Control */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <Type className="inline w-4 h-4 mr-2" />
          Font Size
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {fontScaleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFontScale(option.value)}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200 text-center
                ${
                  fontScale === option.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }
              `}
            >
              <div
                className="font-medium text-gray-900 dark:text-gray-100 mb-1"
                style={{ fontSize: `${option.value}em` }}
              >
                Aa
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {option.label}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {option.description}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Adjusts the size of all text throughout the application
        </p>
      </div>

      {/* Font Scale Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom Font Scale: {Math.round(fontScale * 100)}%
        </label>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">50%</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={fontScale}
            onChange={(e) => setFontScale(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Font scale slider"
            title="Adjust font scale from 50% to 200%"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">200%</span>
        </div>
      </div>

      {/* Reduced Motion Toggle */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <ZapOff className="inline w-4 h-4 mr-2" />
              Reduce Motion
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimizes animations and transitions for better accessibility
            </p>
          </div>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${reducedMotion ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"}
            `}
            role="switch"
            aria-checked={reducedMotion}
            aria-label="Toggle reduced motion"
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out
                ${reducedMotion ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>
      </div>

      {/* Motion Preview */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Animation Preview
          </span>
          <div
            className={`
              w-4 h-4 bg-blue-500 rounded-full
              ${reducedMotion ? "" : "animate-pulse"}
            `}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {reducedMotion
            ? "Animations are disabled for better accessibility"
            : "Animations are enabled for enhanced user experience"}
        </p>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          onClick={() => {
            setFontScale(1);
            setReducedMotion(false);
          }}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
};

// Compact accessibility controls for header/navbar
export const AccessibilityControls: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { fontScale, reducedMotion, setFontScale, setReducedMotion } =
    useThemeAccessibility();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Quick font size buttons */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setFontScale(Math.max(0.5, fontScale - 0.1))}
          className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          title="Decrease font size"
          aria-label="Decrease font size"
        >
          <Type className="w-3 h-3" />
        </button>
        <span className="px-2 text-xs font-medium text-gray-600 dark:text-gray-300">
          {Math.round(fontScale * 100)}%
        </span>
        <button
          onClick={() => setFontScale(Math.min(2, fontScale + 0.1))}
          className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          title="Increase font size"
          aria-label="Increase font size"
        >
          <Type className="w-4 h-4" />
        </button>
      </div>

      {/* Motion toggle */}
      <button
        onClick={() => setReducedMotion(!reducedMotion)}
        className={`
          p-2 rounded-lg transition-colors
          ${
            reducedMotion
              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          }
        `}
        title={reducedMotion ? "Enable animations" : "Reduce motion"}
        aria-label={reducedMotion ? "Enable animations" : "Reduce motion"}
      >
        {reducedMotion ? (
          <ZapOff className="w-4 h-4" />
        ) : (
          <Zap className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
