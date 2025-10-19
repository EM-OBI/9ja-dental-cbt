"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import MobileMenu from "./MobileMenu";
import Link from "next/link";

const navLinks = [
  { href: "#aboutUs", label: "About" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

const headerVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
};

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
      <motion.header
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-sm rounded-full"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          transition: { duration: 0.2 },
        }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <motion.div className="flex items-center" variants={itemVariants}>
            <motion.div
              variants={logoVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/welcome"
                className="text-2xl font-bold dark:bg-gray-50 bg-gray-900 bg-clip-text text-transparent flex items-center"
              >
                DentalCBT
              </Link>
            </motion.div>
          </motion.div>

          {/* Desktop Nav */}
          <motion.nav
            className="hidden md:flex items-center space-x-1 ml-12"
            variants={itemVariants}
          >
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 rounded-md transition-colors relative overflow-hidden group"
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">{link.label}</span>
                <motion.span
                  className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-md opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.a>
            ))}
          </motion.nav>

          {/* Right side */}
          <motion.div
            className="flex items-center space-x-3"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/overview"
                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-600/70 text-white rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
            </motion.div>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
          >
            <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
