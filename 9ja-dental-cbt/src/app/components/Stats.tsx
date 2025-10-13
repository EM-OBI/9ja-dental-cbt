"use client";

import React, { useState, useEffect } from "react";
import { formatNumber } from "@/lib/numberFormatter";
import { databaseService } from "@/services/database";
import { StatItem, StatsData } from "@/types/definitions";

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
          countries: dashboardStats.completedQuizzes || 1,
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
      position: "top-right",
      delay: "delay-800",
    },
    {
      title: "Satisfaction Rate",
      value: stats.satisfactionRate,
      position: "bottom-left",
      delay: "delay-900",
    },
    {
      title: "Countries",
      value: `${stats.countries}+`,
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
                className="bg-transparent p-3 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="text-center animate-pulse">
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 mx-auto"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4">
            {statItems.map((item, index) => (
              <div
                key={index}
                className={`bg-transparent p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 ${item.delay}`}
              >
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.value}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
