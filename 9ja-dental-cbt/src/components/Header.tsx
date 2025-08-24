"use client";

import { useState, useEffect } from "react";
import { Menu, X, LogIn } from "lucide-react";
import MobileMenu from "./MobileMenu";
import clsx from "clsx";
import Link from "next/link";

const navLinks = [
  { href: "#aboutUs", label: "About" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const anchors = document.querySelectorAll('a[href^="#"]');
    const handler = (e: Event) => {
      e.preventDefault();
      const target = document.querySelector(
        (e.currentTarget as HTMLAnchorElement).getAttribute("href")!
      );
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    anchors.forEach((a) => a.addEventListener("click", handler));
    return () =>
      anchors.forEach((a) => a.removeEventListener("click", handler));
  }, []);

  return (
    <>
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm rounded-full">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent flex items-center"
            >
              9jaDentalCBT
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 ml-12">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all",
                  "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400",
                  "hover:bg-gray-100 dark:hover:bg-gray-800",
                  `fade-in-delay-${i + 1}`
                )}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/dashboard"
              className="ml-4 flex items-center px-5 py-2.5 text-sm font-medium rounded-full transition-all bg-gradient-to-r from-blue-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-blue-500/20 hover:from-blue-700 hover:to-emerald-600 transform"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="md:hidden ml-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
