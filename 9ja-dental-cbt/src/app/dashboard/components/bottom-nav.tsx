"use client";
import {
  LayoutDashboard,
  Brain,
  Trophy,
  BarChart3,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import useScrollingEffect from "@/hooks/use-scroll";

const links = [
  {
    name: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Quiz",
    href: "/dashboard/quiz",
    icon: Brain,
  },
  {
    name: "Study",
    href: "/dashboard/study",
    icon: BookOpen,
  },
  {
    name: "Progress",
    href: "/dashboard/progress",
    icon: BarChart3,
  },
  {
    name: "Leaderboard",
    href: "/dashboard/leaderboard",
    icon: Trophy,
  },
];

const tabVariants = {
  inactive: {
    scale: 1,
    transition: { duration: 0.2 },
  },
  active: {
    scale: 1.1,
    transition: { duration: 0.2 },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.15 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

const iconVariants = {
  inactive: {
    color: "rgb(107, 114, 128)",
    transition: { duration: 0.2 },
  },
  active: {
    color: "rgb(59, 130, 246)",
    transition: { duration: 0.2 },
  },
};

export default function BottomNav() {
  const pathname = usePathname();
  const scrollDirection = useScrollingEffect();

  // Function to check if a link is active
  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 sm:hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{
        y: scrollDirection === "up" ? 0 : 100,
        opacity: scrollDirection === "up" ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg rounded-full px-3 py-1"
        whileHover={{
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          transition: { duration: 0.2 },
        }}
      >
        <div className="flex items-center justify-center space-x-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = isActiveLink(link.href);

            return (
              <motion.div
                key={link.name}
                variants={tabVariants}
                initial="inactive"
                animate={isActive ? "active" : "inactive"}
                whileHover="hover"
                whileTap="tap"
                className="relative"
              >
                <Link
                  href={link.href}
                  className="flex items-center justify-center p-2 rounded-full relative overflow-hidden group"
                >
                  <motion.div
                    variants={iconVariants}
                    animate={isActive ? "active" : "inactive"}
                    className="relative z-10"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>

                  {/* Active indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Hover effect */}
                  <motion.span
                    className="absolute inset-0 bg-gray-100 dark:bg-gray-800/30 rounded-full opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
