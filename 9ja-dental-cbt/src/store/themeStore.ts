import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ThemeMode,
  ThemeConfig,
  getThemeConfig,
  getSystemTheme,
  getResolvedTheme,
  generateCSSCustomProperties,
  getFontScalePreference,
  prefersReducedMotion,
} from "@/lib/theme";

interface ThemeState {
  mode: ThemeMode;
  config: ThemeConfig;
  resolvedMode: "light" | "dark";
  fontScale: number;
  reducedMotion: boolean;
  isInitialized: boolean;
}

interface ThemeActions {
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setFontScale: (scale: number) => void;
  setReducedMotion: (enabled: boolean) => void;
  initializeTheme: () => void;
  applyTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

// Initial state - SSR-safe defaults
const getInitialState = (): Omit<ThemeState, "isInitialized"> => {
  const mode: ThemeMode = "system";

  // Use safe defaults during SSR, will be resolved during initialization
  const resolvedMode: "light" | "dark" =
    typeof window === "undefined" ? "light" : getResolvedTheme(mode);
  const config =
    typeof window === "undefined"
      ? getThemeConfig("light")
      : getThemeConfig(mode);

  return {
    mode,
    config,
    resolvedMode,
    fontScale: 1,
    reducedMotion: false,
  };
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      isInitialized: false,

      setMode: (mode: ThemeMode) => {
        const resolvedMode = getResolvedTheme(mode);
        const config = getThemeConfig(mode);

        set({
          mode,
          resolvedMode,
          config,
        });

        // Apply theme immediately
        get().applyTheme();
      },

      toggleMode: () => {
        const currentMode = get().mode;
        let newMode: ThemeMode;

        if (currentMode === "system") {
          const systemTheme = getSystemTheme();
          newMode = systemTheme === "light" ? "dark" : "light";
        } else {
          newMode = currentMode === "light" ? "dark" : "light";
        }

        get().setMode(newMode);
      },

      setFontScale: (scale: number) => {
        set({ fontScale: Math.max(0.5, Math.min(2, scale)) }); // Clamp between 0.5x and 2x
        get().applyTheme();
      },

      setReducedMotion: (enabled: boolean) => {
        set({ reducedMotion: enabled });
        get().applyTheme();
      },

      initializeTheme: () => {
        if (typeof window === "undefined") return;

        // Get user preferences
        const fontScale = getFontScalePreference();
        const reducedMotion = prefersReducedMotion();

        // Resolve the actual theme now that we're on the client
        const currentMode = get().mode;
        const resolvedMode = getResolvedTheme(currentMode);
        const config = getThemeConfig(currentMode);

        set({
          fontScale,
          reducedMotion,
          resolvedMode,
          config,
          isInitialized: true,
        });

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemThemeChange = () => {
          const currentMode = get().mode;
          if (currentMode === "system") {
            const resolvedMode = getResolvedTheme("system");
            const config = getThemeConfig("system");
            set({ resolvedMode, config });
            get().applyTheme();
          }
        };

        mediaQuery.addEventListener("change", handleSystemThemeChange);

        // Listen for reduced motion preference changes
        const motionQuery = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        );
        const handleMotionPreferenceChange = () => {
          set({ reducedMotion: motionQuery.matches });
          get().applyTheme();
        };

        motionQuery.addEventListener("change", handleMotionPreferenceChange);

        // Apply initial theme
        get().applyTheme();

        // Cleanup function (would be used in a component effect)
        return () => {
          mediaQuery.removeEventListener("change", handleSystemThemeChange);
          motionQuery.removeEventListener(
            "change",
            handleMotionPreferenceChange
          );
        };
      },

      applyTheme: () => {
        if (typeof window === "undefined") return;

        const { config, fontScale, reducedMotion } = get();
        const root = document.documentElement;

        // Generate CSS custom properties
        const cssProperties = generateCSSCustomProperties(config);

        // Apply font scaling
        Object.entries(cssProperties).forEach(([property, value]) => {
          if (property.startsWith("--font-size-")) {
            const scaledValue = `calc(${value} * ${fontScale})`;
            root.style.setProperty(property, scaledValue);
          } else {
            root.style.setProperty(property, value);
          }
        });

        // Apply reduced motion preference
        if (reducedMotion) {
          root.style.setProperty("--transition-fast", "none");
          root.style.setProperty("--transition-normal", "none");
          root.style.setProperty("--transition-slow", "none");
        }

        // Apply theme class to html element for Tailwind compatibility
        const { resolvedMode } = get();
        root.classList.remove("light", "dark");
        root.classList.add(resolvedMode);

        // Set data attribute for CSS selectors
        root.setAttribute("data-theme", resolvedMode);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector(
          'meta[name="theme-color"]'
        );
        if (metaThemeColor) {
          metaThemeColor.setAttribute("content", config.colors.background);
        } else {
          const meta = document.createElement("meta");
          meta.name = "theme-color";
          meta.content = config.colors.background;
          document.head.appendChild(meta);
        }
      },
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        mode: state.mode,
        fontScale: state.fontScale,
        reducedMotion: state.reducedMotion,
      }),
    }
  )
);

// Hooks for specific theme properties
export const useThemeMode = () => {
  const mode = useThemeStore((state) => state.mode);
  const resolvedMode = useThemeStore((state) => state.resolvedMode);
  const setMode = useThemeStore((state) => state.setMode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  return { mode, resolvedMode, setMode, toggleMode };
};

export const useThemeConfig = () => {
  return useThemeStore((state) => state.config);
};

export const useThemeColors = () => {
  return useThemeStore((state) => state.config.colors);
};

export const useThemeAccessibility = () => {
  const fontScale = useThemeStore((state) => state.fontScale);
  const reducedMotion = useThemeStore((state) => state.reducedMotion);
  const setFontScale = useThemeStore((state) => state.setFontScale);
  const setReducedMotion = useThemeStore((state) => state.setReducedMotion);

  return { fontScale, reducedMotion, setFontScale, setReducedMotion };
};

// Helper hook for theme-aware styles
export const useThemeStyles = () => {
  const config = useThemeConfig();
  const reducedMotion = useThemeStore((state) => state.reducedMotion);

  const getTransition = (speed: "fast" | "normal" | "slow" = "normal") => {
    return reducedMotion ? "none" : config.transitions[speed];
  };

  const getBoxShadow = (size: "sm" | "md" | "lg" | "xl" = "md") => {
    return config.shadows[size];
  };

  const getBorderRadius = (size: "sm" | "md" | "lg" | "xl" | "full" = "md") => {
    return config.borderRadius[size];
  };

  return {
    config,
    getTransition,
    getBoxShadow,
    getBorderRadius,
  };
};

// Initialize theme system
export const initializeTheme = () => {
  const { initializeTheme } = useThemeStore.getState();
  return initializeTheme();
};
