// Type definitions
export interface StatItem {
  title: string;
  value: string;
  icon: React.ReactNode;
  position: "top-right" | "bottom-left" | "top-left" | "bottom-right";
  delay: string;
}

export interface StatsData {
  questions: number;
  satisfactionRate: string;
  countries: number;
}
