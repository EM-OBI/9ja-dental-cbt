"use client";

import { ReactNode } from "react";
import { AppStateProvider } from "@/store/AppStateProvider";

interface ClientLayoutProps {
  children: ReactNode;
}

import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AppStateProvider>
      {children}
      <Toaster />
    </AppStateProvider>
  );
}
