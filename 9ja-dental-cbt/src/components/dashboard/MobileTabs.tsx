"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Activity } from "lucide-react";
import QuizResults from "./QuizResults";
import ActivityFeed from "./ActivityFeed";
import type { QuizAttempt, RecentActivity } from "@/types/dashboard";

interface MobileTabsProps {
  quizAttempts: QuizAttempt[];
  activities: RecentActivity[];
  maxItems?: number;
}

const tabVariants = {
  inactive: {
    backgroundColor: "transparent",
    color: "rgb(107, 114, 128)",
    transition: { duration: 0.2 },
  },
  active: {
    backgroundColor: "rgb(59, 130, 246)",
    color: "rgb(255, 255, 255)",
    transition: { duration: 0.2 },
  },
};

const contentVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 20,
  },
};

export default function MobileTabs({
  quizAttempts,
  activities,
  maxItems = 4,
}: MobileTabsProps) {
  const [activeTab, setActiveTab] = useState<"quiz" | "activity">("quiz");

  const tabs = [
    {
      id: "quiz",
      label: "Recent Quiz Results",
      icon: TrendingUp,
      component: (
        <QuizResults quizAttempts={quizAttempts} maxItems={maxItems} />
      ),
    },
    {
      id: "activity",
      label: "Recent Activity",
      icon: Activity,
      component: (
        <ActivityFeed
          activities={activities}
          maxItems={maxItems}
          showTimestamp={true}
        />
      ),
    },
  ];

  return (
    <div className="lg:hidden">
      {/* Tab Headers */}
      <div className="flex bg-gray-100 dark:bg-gray-800/50 rounded-xl p-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "quiz" | "activity")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 relative overflow-hidden"
              variants={tabVariants}
              animate={activeTab === tab.id ? "active" : "inactive"}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.1 },
              }}
              whileTap={{
                scale: 0.98,
                transition: { duration: 0.1 },
              }}
            >
              <motion.div
                initial={{ scale: 1 }}
                animate={{
                  scale: activeTab === tab.id ? 1.1 : 1,
                  rotate: activeTab === tab.id ? 5 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="w-4 h-4" />
              </motion.div>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">
                {tab.id === "quiz" ? "Quiz" : "Activity"}
              </span>

              {/* Active indicator */}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute inset-0 bg-blue-500 rounded-lg -z-10"
                  layoutId="activeTab"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="min-h-[400px]"
        >
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
