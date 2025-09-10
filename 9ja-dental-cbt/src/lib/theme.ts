// Theme configuration and constants for dentistry industry
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  accentHover: string;
  success: string;
  warning: string;
  error: string;
  border: string;
  borderLight: string;
  shadow: string;
  overlay: string;
  // Dentistry-specific button states
  buttonPrimary: string;
  buttonPrimaryHover: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryHover: string;
  buttonSecondaryText: string;
}

// Dentistry theme color constants with type safety (WCAG AA compliant)
export const DENTISTRY_COLORS = {
  LIGHT: {
    BACKGROUND: "#F9FAFB",
    SURFACE: "#FFFFFF",
    PRIMARY: "#1D7874", // Darker teal for better contrast
    SECONDARY: "#1976D2", // Darker blue for better contrast
    ACCENT: "#0F766E", // Much darker teal accent for accessibility
    TEXT_PRIMARY: "#1F2937",
    TEXT_SECONDARY: "#4B5563",
    BORDER: "#E5E7EB",
    BUTTON_PRIMARY_BG: "#1D7874",
    BUTTON_PRIMARY_TEXT: "#FFFFFF",
    BUTTON_PRIMARY_HOVER: "#134E4A",
    BUTTON_SECONDARY_BG: "#1976D2",
    BUTTON_SECONDARY_TEXT: "#FFFFFF",
    BUTTON_SECONDARY_HOVER: "#1565C0",
    SUCCESS: "#059669", // Darker green for better contrast
    ERROR: "#DC2626", // Darker red for better contrast
    WARNING: "#D97706", // Darker orange for better contrast
  },
  DARK: {
    BACKGROUND: "#0F172A",
    SURFACE: "#1E293B",
    PRIMARY: "#0F766E", // Darker teal for better contrast with white text
    SECONDARY: "#0284C7", // Darker blue for better contrast
    ACCENT: "#0F766E", // Darker teal accent for better contrast with white text
    TEXT_PRIMARY: "#F1F5F9",
    TEXT_SECONDARY: "#94A3B8",
    BORDER: "#334155",
    BUTTON_PRIMARY_BG: "#0F766E",
    BUTTON_PRIMARY_TEXT: "#FFFFFF", // White text for better contrast
    BUTTON_PRIMARY_HOVER: "#134E4A",
    BUTTON_SECONDARY_BG: "#0284C7",
    BUTTON_SECONDARY_TEXT: "#FFFFFF", // White text for better contrast
    BUTTON_SECONDARY_HOVER: "#0369A1",
    SUCCESS: "#10B981",
    ERROR: "#F87171", // Brighter red for dark theme to contrast with dark text
    WARNING: "#F59E0B", // Darker yellow for better contrast
    BUTTON_DESTRUCTIVE_BG: "#F87171",
    BUTTON_DESTRUCTIVE_TEXT: "#0F172A", // Dark text for better contrast on bright red
    BUTTON_DESTRUCTIVE_HOVER: "#EF4444",
  },
} as const;

export interface ThemeFontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
  "5xl": string;
}

export interface ThemeFontWeights {
  light: number;
  regular: number;
  medium: number;
  semibold: number;
  bold: number;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
  "5xl": string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fontSizes: ThemeFontSizes;
  fontWeights: ThemeFontWeights;
  fontFamily: string;
  lineHeight: number;
  spacing: ThemeSpacing;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// Light theme configuration - Dentistry focused
export const lightTheme: ThemeConfig = {
  colors: {
    background: DENTISTRY_COLORS.LIGHT.BACKGROUND,
    surface: DENTISTRY_COLORS.LIGHT.SURFACE,
    surfaceSecondary: "#F5F7FA",
    text: DENTISTRY_COLORS.LIGHT.TEXT_PRIMARY,
    textSecondary: DENTISTRY_COLORS.LIGHT.TEXT_SECONDARY,
    textMuted: "#64748B",
    primary: DENTISTRY_COLORS.LIGHT.PRIMARY,
    primaryHover: DENTISTRY_COLORS.LIGHT.BUTTON_PRIMARY_HOVER,
    primaryLight: "#E0F7F4",
    secondary: DENTISTRY_COLORS.LIGHT.SECONDARY,
    secondaryHover: DENTISTRY_COLORS.LIGHT.BUTTON_SECONDARY_HOVER,
    accent: DENTISTRY_COLORS.LIGHT.ACCENT,
    accentHover: "#4DB6AC",
    success: DENTISTRY_COLORS.LIGHT.SUCCESS,
    warning: DENTISTRY_COLORS.LIGHT.WARNING,
    error: DENTISTRY_COLORS.LIGHT.ERROR,
    border: DENTISTRY_COLORS.LIGHT.BORDER,
    borderLight: "#F3F4F6",
    shadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    overlay: "rgba(0,0,0,0.45)",
    // Dentistry button tokens
    buttonPrimary: DENTISTRY_COLORS.LIGHT.BUTTON_PRIMARY_BG,
    buttonPrimaryHover: DENTISTRY_COLORS.LIGHT.BUTTON_PRIMARY_HOVER,
    buttonPrimaryText: DENTISTRY_COLORS.LIGHT.BUTTON_PRIMARY_TEXT,
    buttonSecondary: DENTISTRY_COLORS.LIGHT.BUTTON_SECONDARY_BG,
    buttonSecondaryHover: DENTISTRY_COLORS.LIGHT.BUTTON_SECONDARY_HOVER,
    buttonSecondaryText: DENTISTRY_COLORS.LIGHT.BUTTON_SECONDARY_TEXT,
  },
  fontSizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
    "4xl": "36px",
    "5xl": "48px",
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight: 1.5,
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    "4xl": "6rem",
    "5xl": "8rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  transitions: {
    fast: "150ms ease-in-out",
    normal: "300ms ease-in-out",
    slow: "500ms ease-in-out",
  },
};

// Dark theme configuration - Dentistry focused
export const darkTheme: ThemeConfig = {
  colors: {
    background: DENTISTRY_COLORS.DARK.BACKGROUND,
    surface: DENTISTRY_COLORS.DARK.SURFACE,
    surfaceSecondary: "#24324A",
    text: DENTISTRY_COLORS.DARK.TEXT_PRIMARY,
    textSecondary: DENTISTRY_COLORS.DARK.TEXT_SECONDARY,
    textMuted: "#94A3B8",
    primary: DENTISTRY_COLORS.DARK.PRIMARY,
    primaryHover: DENTISTRY_COLORS.DARK.BUTTON_SECONDARY_HOVER,
    primaryLight: "#1E40AF",
    secondary: DENTISTRY_COLORS.DARK.SECONDARY,
    secondaryHover: DENTISTRY_COLORS.DARK.BUTTON_PRIMARY_HOVER,
    accent: DENTISTRY_COLORS.DARK.ACCENT,
    accentHover: "#22D3EE",
    success: DENTISTRY_COLORS.DARK.SUCCESS,
    warning: DENTISTRY_COLORS.DARK.WARNING,
    error: DENTISTRY_COLORS.DARK.ERROR,
    border: DENTISTRY_COLORS.DARK.BORDER,
    borderLight: "#475569",
    shadow: "0 1px 3px rgba(0, 0, 0, 0.5)",
    overlay: "rgba(0,0,0,0.65)",
    // Dentistry button tokens
    buttonPrimary: DENTISTRY_COLORS.DARK.BUTTON_PRIMARY_BG,
    buttonPrimaryHover: DENTISTRY_COLORS.DARK.BUTTON_PRIMARY_HOVER,
    buttonPrimaryText: DENTISTRY_COLORS.DARK.BUTTON_PRIMARY_TEXT,
    buttonSecondary: DENTISTRY_COLORS.DARK.BUTTON_SECONDARY_BG,
    buttonSecondaryHover: DENTISTRY_COLORS.DARK.BUTTON_SECONDARY_HOVER,
    buttonSecondaryText: DENTISTRY_COLORS.DARK.BUTTON_SECONDARY_TEXT,
  },
  fontSizes: lightTheme.fontSizes,
  fontWeights: lightTheme.fontWeights,
  fontFamily: lightTheme.fontFamily,
  lineHeight: lightTheme.lineHeight,
  spacing: lightTheme.spacing,
  borderRadius: lightTheme.borderRadius,
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
  },
  transitions: lightTheme.transitions,
};

// Theme type for mode switching
export type ThemeMode = "light" | "dark" | "system";

// Get system theme preference
export const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Get resolved theme (handles 'system' mode)
export const getResolvedTheme = (mode: ThemeMode): "light" | "dark" => {
  if (mode === "system") {
    return getSystemTheme();
  }
  return mode;
};

// Get theme config for current mode
export const getThemeConfig = (mode: ThemeMode): ThemeConfig => {
  const resolvedMode = getResolvedTheme(mode);
  return resolvedMode === "dark" ? darkTheme : lightTheme;
};

// CSS custom properties generator
export const generateCSSCustomProperties = (
  theme: ThemeConfig
): Record<string, string> => {
  return {
    // Colors
    "--color-background": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-surface-secondary": theme.colors.surfaceSecondary,
    "--color-text": theme.colors.text,
    "--color-text-secondary": theme.colors.textSecondary,
    "--color-text-muted": theme.colors.textMuted,
    "--color-primary": theme.colors.primary,
    "--color-primary-hover": theme.colors.primaryHover,
    "--color-primary-light": theme.colors.primaryLight,
    "--color-secondary": theme.colors.secondary,
    "--color-secondary-hover": theme.colors.secondaryHover,
    "--color-accent": theme.colors.accent,
    "--color-accent-hover": theme.colors.accentHover,
    "--color-success": theme.colors.success,
    "--color-warning": theme.colors.warning,
    "--color-error": theme.colors.error,
    "--color-border": theme.colors.border,
    "--color-border-light": theme.colors.borderLight,
    "--color-shadow": theme.colors.shadow,
    "--color-overlay": theme.colors.overlay,

    // Typography
    "--font-family": theme.fontFamily,
    "--line-height": theme.lineHeight.toString(),
    "--font-size-xs": theme.fontSizes.xs,
    "--font-size-sm": theme.fontSizes.sm,
    "--font-size-base": theme.fontSizes.base,
    "--font-size-lg": theme.fontSizes.lg,
    "--font-size-xl": theme.fontSizes.xl,
    "--font-size-2xl": theme.fontSizes["2xl"],
    "--font-size-3xl": theme.fontSizes["3xl"],
    "--font-size-4xl": theme.fontSizes["4xl"],
    "--font-size-5xl": theme.fontSizes["5xl"],
    "--font-weight-light": theme.fontWeights.light.toString(),
    "--font-weight-regular": theme.fontWeights.regular.toString(),
    "--font-weight-medium": theme.fontWeights.medium.toString(),
    "--font-weight-semibold": theme.fontWeights.semibold.toString(),
    "--font-weight-bold": theme.fontWeights.bold.toString(),

    // Spacing
    "--spacing-xs": theme.spacing.xs,
    "--spacing-sm": theme.spacing.sm,
    "--spacing-md": theme.spacing.md,
    "--spacing-lg": theme.spacing.lg,
    "--spacing-xl": theme.spacing.xl,
    "--spacing-2xl": theme.spacing["2xl"],
    "--spacing-3xl": theme.spacing["3xl"],
    "--spacing-4xl": theme.spacing["4xl"],
    "--spacing-5xl": theme.spacing["5xl"],

    // Border radius
    "--border-radius-sm": theme.borderRadius.sm,
    "--border-radius-md": theme.borderRadius.md,
    "--border-radius-lg": theme.borderRadius.lg,
    "--border-radius-xl": theme.borderRadius.xl,
    "--border-radius-full": theme.borderRadius.full,

    // Shadows
    "--shadow-sm": theme.shadows.sm,
    "--shadow-md": theme.shadows.md,
    "--shadow-lg": theme.shadows.lg,
    "--shadow-xl": theme.shadows.xl,

    // Transitions
    "--transition-fast": theme.transitions.fast,
    "--transition-normal": theme.transitions.normal,
    "--transition-slow": theme.transitions.slow,
  };
};

// Accessibility helpers
// Parse hex (#RRGGBB or #RGB) to linearized luminance
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  if (!hex) return null;
  const normalized = hex.trim().replace("#", "");
  if (![3, 6].includes(normalized.length)) return null;
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const int = parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const channelToLinear = (value: number) => {
  const srgb = value / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
};

const relativeLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const { r, g, b } = rgb;
  const R = channelToLinear(r);
  const G = channelToLinear(g);
  const B = channelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

export const getContrastRatio = (color1: string, color2: string): number => {
  const L1 = relativeLuminance(color1);
  const L2 = relativeLuminance(color2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const isHighContrast = (
  foreground: string,
  background: string
): boolean => {
  return getContrastRatio(foreground, background) >= 4.5;
};

// Font scaling for accessibility
export const getFontScalePreference = (): number => {
  if (typeof window === "undefined") return 1;

  // Check for user's font size preference
  const testElement = document.createElement("div");
  testElement.style.fontSize = "16px";
  testElement.style.position = "absolute";
  testElement.style.visibility = "hidden";
  document.body.appendChild(testElement);

  const computedSize = window.getComputedStyle(testElement).fontSize;
  document.body.removeChild(testElement);

  const actualSize = parseFloat(computedSize);
  return actualSize / 16; // Scale factor relative to default 16px
};

// Reduced motion preference
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Theme Manager for dentistry application
export class DentistryThemeManager {
  private static instance: DentistryThemeManager;
  private currentTheme: ThemeMode = "light";
  private listeners: Array<(theme: ThemeMode) => void> = [];

  static getInstance(): DentistryThemeManager {
    if (!DentistryThemeManager.instance) {
      DentistryThemeManager.instance = new DentistryThemeManager();
    }
    return DentistryThemeManager.instance;
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.loadPersistedTheme();
      this.applyTheme(this.currentTheme, false);
    }
  }

  // Load theme preference from localStorage
  private loadPersistedTheme(): void {
    try {
      const saved = localStorage.getItem("dentistry-theme");
      if (saved === "light" || saved === "dark" || saved === "system") {
        this.currentTheme = saved;
      }
    } catch (error) {
      console.warn("Failed to load theme preference:", error);
    }
  }

  // Persist theme preference to localStorage
  private persistTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem("dentistry-theme", theme);
    } catch (error) {
      console.warn("Failed to persist theme preference:", error);
    }
  }

  // Apply theme with smooth transition
  public applyTheme(theme: ThemeMode, animate: boolean = true): void {
    const resolvedTheme = getResolvedTheme(theme);
    const themeConfig = getThemeConfig(theme);
    const root = document.documentElement;

    // Add transition class for smooth color changes
    if (animate && !prefersReducedMotion()) {
      root.style.transition = "all 300ms ease-in-out";
      setTimeout(() => {
        root.style.transition = "";
      }, 300);
    }

    // Apply CSS custom properties
    const cssProps = generateCSSCustomProperties(themeConfig);
    Object.entries(cssProps).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Update data attribute for CSS selectors
    root.setAttribute("data-theme", resolvedTheme);
    root.classList.toggle("dark", resolvedTheme === "dark");

    // Update dentistry-specific button styles
    this.applyButtonStyles(themeConfig.colors);

    this.currentTheme = theme;
    this.persistTheme(theme);
    this.notifyListeners(theme);
  }

  // Apply dentistry-specific button styles
  private applyButtonStyles(colors: ThemeColors): void {
    const root = document.documentElement;

    // Primary buttons
    root.style.setProperty("--btn-primary-bg", colors.buttonPrimary);
    root.style.setProperty("--btn-primary-hover", colors.buttonPrimaryHover);
    root.style.setProperty("--btn-primary-text", colors.buttonPrimaryText);

    // Secondary buttons
    root.style.setProperty("--btn-secondary-bg", colors.buttonSecondary);
    root.style.setProperty(
      "--btn-secondary-hover",
      colors.buttonSecondaryHover
    );
    root.style.setProperty("--btn-secondary-text", colors.buttonSecondaryText);

    // Dental industry accent colors
    root.style.setProperty("--dental-accent", colors.accent);
    root.style.setProperty("--dental-accent-hover", colors.accentHover);
  }

  // Toggle between light and dark themes
  public toggleTheme(): void {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
  }

  // Set specific theme
  public setTheme(theme: ThemeMode): void {
    this.applyTheme(theme);
  }

  // Get current theme
  public getCurrentTheme(): ThemeMode {
    return this.currentTheme;
  }

  // Subscribe to theme changes
  public subscribe(listener: (theme: ThemeMode) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners of theme change
  private notifyListeners(theme: ThemeMode): void {
    this.listeners.forEach((listener) => listener(theme));
  }

  // Initialize theme system
  public static initialize(): DentistryThemeManager {
    const manager = DentistryThemeManager.getInstance();

    // Listen for system theme changes
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", () => {
        if (manager.currentTheme === "system") {
          manager.applyTheme("system");
        }
      });
    }

    return manager;
  }
}

// Utility functions for theme management
export const initializeDentistryTheme = (): DentistryThemeManager => {
  return DentistryThemeManager.initialize();
};

export const useDentistryTheme = () => {
  const manager = DentistryThemeManager.getInstance();
  return {
    currentTheme: manager.getCurrentTheme(),
    setTheme: (theme: ThemeMode) => manager.setTheme(theme),
    toggleTheme: () => manager.toggleTheme(),
    subscribe: (listener: (theme: ThemeMode) => void) =>
      manager.subscribe(listener),
  };
};
