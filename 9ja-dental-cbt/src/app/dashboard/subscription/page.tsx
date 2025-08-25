"use client";

import { useState } from "react";
import DashboardHeader from "@/app/dashboard/components/Header";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DashboardHeader
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
    </div>
  );
}
