"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, TowerControl, Plus } from "lucide-react";
import NavLinks from "./nav-links";
import Link from "next/link";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        title="Mobile menu Button"
        aria-label="Toggle mobile menu"
        type="button"
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/80 backdrop-blur-lg rounded-lg border border-white/10"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out flex flex-col gap-6 border-r border-white/10 bg-slate-900/50 backdrop-blur-lg p-6 h-full ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } overflow-y-auto lg:overflow-visible`}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg grid place-content-center">
            <TowerControl className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            <Link href="/">DENTAL QUIZ</Link>
          </span>
        </div>
        <NavLinks />
        <div className="mt-auto bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-4 rounded-xl">
          <p className="text-sm leading-snug">
            Upgrade to Premium for{" "}
            <span className="font-semibold text-cyan-400">AI Insights</span> and
            full question bank access!
          </p>
          <div className="flex items-center justify-between mt-4 text-sm">
            <button className="hover:underline text-white/70">
              Maybe Later
            </button>
            <button className="bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-md font-medium">
              Go Premium
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={toggleMobileMenu}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        ></div>
      )}
    </>
  );
}
