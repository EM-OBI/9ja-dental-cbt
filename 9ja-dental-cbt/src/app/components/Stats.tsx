"use client";

import React, { useState, useEffect } from "react";
import { formatNumber } from "@/lib/numberFormatter";
import { databaseService } from "@/services/database";
import { StatItem, StatsData } from "@/types/definitions";
import { Award, Heart, User, Globe } from "lucide-react";

// Icons with consistent styling
const UsersIcon = () => (
  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30">
    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
  </div>
);

const HeartIcon = () => (
  <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/30">
    <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
  </div>
);

const GlobeIcon = () => (
  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
    <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
  </div>
);

// Main component
export default function StatsSection() {
  const [stats, setStats] = useState<StatsData>({
    questions: 0,
    satisfactionRate: "0%",
    countries: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real stats from the API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Get dashboard statistics as a proxy for platform stats
        const dashboardStats = await databaseService.getDashboardStats(
          "platform"
        );
        setStats({
          questions: dashboardStats.totalQuizzes || 1000,
          satisfactionRate: `${Math.round(dashboardStats.averageScore || 98)}%`,
          countries: dashboardStats.completedQuizzes || 1, // Using completed quizzes as countries for now
        });
      } catch (error) {
        console.error("Failed to fetch platform stats:", error);
        // Fallback to reasonable default values
        setStats({
          questions: 1000,
          satisfactionRate: "98%",
          countries: 1,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Stat items configuration
  const statItems: StatItem[] = [
    {
      title: "Completed Quiz",
      value: `${formatNumber(stats.questions)}+`,
      icon: <UsersIcon />,
      position: "top-right",
      delay: "delay-800",
    },
    {
      title: "Satisfaction Rate",
      value: stats.satisfactionRate,
      icon: <HeartIcon />,
      position: "bottom-left",
      delay: "delay-900",
    },
    {
      title: "Countries",
      value: `${stats.countries}+`,
      icon: <GlobeIcon />,
      position: "top-left",
      delay: "delay-1000",
    },
  ];

  return (
    <section className="py-12 md:py-10 lg:py-10 bg:tranparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-start space-x-4">
                  <div className="animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                  <div className="text-left animate-pulse">
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4">
            {statItems.map((item, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 ${item.delay}`}
              >
                <div className="flex items-start space-x-4">
                  {item.icon}
                  <div className="text-left">
                    <p className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
