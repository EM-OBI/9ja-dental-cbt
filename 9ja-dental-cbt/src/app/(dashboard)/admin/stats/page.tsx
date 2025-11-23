"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  RefreshCw,
  Database,
  FileText,
  Users,
  Trophy,
} from "lucide-react";
import Link from "next/link";

interface DatabaseStats {
  totalQuestions: number;
  totalSpecialties: number;
  questionsBySpecialty: Array<{ name: string; count: number }>;
  questionsByDifficulty: { easy: number; medium: number; hard: number };
  activeQuestions: number;
  inactiveQuestions: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/stats");
      const result = (await response.json()) as {
        success: boolean;
        data?: DatabaseStats;
      };
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Failed to load statistics</p>
          <Button className="mt-4" onClick={loadStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Database Statistics</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your question bank
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="text-3xl font-bold mt-1">{stats.totalQuestions}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Specialties</p>
              <p className="text-3xl font-bold mt-1">
                {stats.totalSpecialties}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Database className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-3xl font-bold mt-1">{stats.activeQuestions}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-3xl font-bold mt-1">
                {stats.inactiveQuestions}
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </Card>
      </div>

      {/* Questions by Specialty */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Questions by Specialty</h2>
        <div className="space-y-3">
          {stats.questionsBySpecialty.map((item) => {
            const percentage = (item.count / stats.totalQuestions) * 100;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <span className="font-medium">{item.name}</span>
                <div className="flex items-center gap-4">
                  <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    {/* Dynamic width for progress bar - inline style is appropriate here */}
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Questions by Difficulty */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Questions by Difficulty</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-muted-foreground">Easy</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {stats.questionsByDifficulty.easy}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                (stats.questionsByDifficulty.easy / stats.totalQuestions) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <p className="text-sm text-muted-foreground">Medium</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
              {stats.questionsByDifficulty.medium}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                (stats.questionsByDifficulty.medium / stats.totalQuestions) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <p className="text-sm text-muted-foreground">Hard</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {stats.questionsByDifficulty.hard}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                (stats.questionsByDifficulty.hard / stats.totalQuestions) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

