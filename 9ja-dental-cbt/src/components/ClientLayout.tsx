"use client";

import { ReactNode } from "react";
import { AppStateProvider } from "@/store/AppStateProvider";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return <AppStateProvider>{children}</AppStateProvider>;
}
