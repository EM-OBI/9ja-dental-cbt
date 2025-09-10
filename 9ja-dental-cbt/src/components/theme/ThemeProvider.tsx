"use client";

import React, { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { mode, resolvedMode, isInitialized, applyTheme } = useThemeStore();

  useEffect(() => {
    if (isInitialized) {
      applyTheme();
    }
  }, [isInitialized, applyTheme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const html = document.documentElement;

      // Remove existing theme classes
      html.classList.remove("light", "dark");

      // Add current theme class
      html.classList.add(resolvedMode);

      // Add theme mode attribute for CSS targeting
      html.setAttribute("data-theme", mode);
      html.setAttribute("data-resolved-theme", resolvedMode);
    }
  }, [mode, resolvedMode]);

  return <>{children}</>;
};
