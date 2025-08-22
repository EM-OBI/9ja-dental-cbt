"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import MobileMenu from "./MobileMenu";
import clsx from "clsx";
import Link from "next/link";

const navLinks = [
  { href: "#aboutUs", label: "About Us" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Testimonials" },
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
      <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 glass-effect rounded-full">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <a
            href="#"
            className={clsx(
              "text-lg font-medium tracking-tight heading-font gradient-text transition ml-2",
              menuOpen && "text-white !bg-none"
            )}
          >
            CBT-logo
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-xs text-gray-300 ml-8">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={clsx(
                  "hover:text-white transition-colors fade-in",
                  `fade-in-delay-${i + 1}`
                )}
              >
                {link.label}
              </a>
            ))}
            <Link

              href="/dashboard"
              className="bg-[#3ab286] hover:bg-amber-600 text-gray-900 px-4 py-2 rounded-full font-medium text-sm hover:bg-opacity-90 transition-all"
            >
              Dashboard
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-3 ml-8 relative">
            {/* Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={clsx(
                "flex items-center text-sm tracking-wide font-medium uppercase transition fade-in md:hidden",
                menuOpen ? "text-white" : "hover:opacity-80"
              )}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
