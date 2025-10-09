"use client";

import { useState } from "react";
import { Menu, TowerControl, PanelLeft, LogOut } from "lucide-react";
import NavLinks from "./nav-links";
import Link from "next/link";
import LogoutButton from "@/modules/auth/components/logout-button";

interface SidebarProps {
  isDesktopCollapsed?: boolean;
  setIsDesktopCollapsed?: (collapsed: boolean) => void;
}

export default function Sidebar({
  isDesktopCollapsed = false,
  setIsDesktopCollapsed,
}: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed?.(!isDesktopCollapsed);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Mobile and desktop expanded state
  const showFullSidebar = isMobileMenuOpen || !isDesktopCollapsed;

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        title="Mobile menu"
        aria-label="Toggle mobile menu"
        type="button"
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Main Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          flex flex-col h-full
          border-r border-slate-200 dark:border-slate-800
          bg-white dark:bg-slate-900
          transition-all duration-300 ease-in-out
          overflow-y-auto
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          ${isDesktopCollapsed ? "lg:w-20" : "lg:w-64"}
          w-64
        `}
      >
        {/* Logo/Header Section */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
          {showFullSidebar ? (
            /* Expanded Header */
            <>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-slate-900 dark:bg-white rounded-lg grid place-content-center flex-shrink-0">
                  <TowerControl className="h-5 w-5 text-white dark:text-slate-900" />
                </div>
                <span className="text-base font-semibold text-slate-900 dark:text-white lg:block hidden">
                  9ja Dental
                </span>
                <span className="text-base font-semibold text-slate-900 dark:text-white lg:hidden">
                  9ja Dental
                </span>
              </div>
              <button
                title="Toggle sidebar"
                aria-label="Toggle desktop sidebar"
                type="button"
                onClick={toggleDesktopSidebar}
                className="hidden lg:block p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            </>
          ) : (
            /* Collapsed Header (Desktop Only) */
            <button
              title="Expand sidebar"
              aria-label="Expand desktop sidebar"
              type="button"
              onClick={toggleDesktopSidebar}
              className="w-full flex justify-center p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
            >
              <div className="h-9 w-9 bg-slate-900 dark:bg-white rounded-lg grid place-content-center">
                <TowerControl className="h-5 w-5 text-white dark:text-slate-900" />
              </div>
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3">
          <NavLinks
            isCollapsed={isDesktopCollapsed}
            onLinkClick={closeMobileMenu}
          />
        </nav>

        {/* Footer - Logout Section */}
        {showFullSidebar ? (
          /* Expanded Footer - Show on Mobile and Desktop Expanded */
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <LogoutButton />
          </div>
        ) : (
          /* Collapsed Footer - Desktop Only */
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-center">
            <button
              title="Logout"
              aria-label="Logout"
              type="button"
              onClick={() => {
                // Add your logout logic here
                // You might want to use the logout function from your auth
              }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-45 lg:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
}
