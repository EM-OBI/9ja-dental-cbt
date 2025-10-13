"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/store/userStore";
import { databaseService } from "@/services/database";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { User as DashboardUser } from "@/types/dashboard";

type TestResult = {
  time: string;
  message: string;
  type: "success" | "error" | "info";
};

// Extended user type that may have additional fields
type ExtendedUser = DashboardUser & {
  level?: number;
  xp?: number;
  subscription?: "free" | "premium" | "enterprise";
};

export default function DatabaseTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const user = useUserStore((state) => state.user);

  const addResult = (message: string, type: TestResult["type"] = "info") => {
    setResults((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        message,
        type,
      },
    ]);
  };

  const testUserData = async () => {
    if (!user?.id) {
      addResult("No user logged in", "error");
      return;
    }

    addResult("Testing user data from database...", "info");
    try {
      const dbUser = (await databaseService.getUserById(
        user.id
      )) as ExtendedUser | null;
      if (dbUser) {
        addResult(`User fetched: ${dbUser.name || dbUser.email}`, "success");
        addResult(
          `   Level: ${dbUser.level ?? user.level ?? "Not set"}`,
          "info"
        );
        addResult(`   XP: ${dbUser.xp ?? user.xp ?? "Not set"}`, "info");
        addResult(
          `   Subscription: ${
            dbUser.subscription ?? user.subscription ?? "Not set"
          }`,
          "info"
        );
      } else {
        addResult("User not found in database", "error");
      }
    } catch (error) {
      addResult(`Error fetching user: ${error}`, "error");
    }
  };

  const testQuizzes = async () => {
    addResult("Testing quizzes from database...", "info");
    try {
      const response = await databaseService.getQuizzes({ limit: 5 });
      if (response.data && response.data.length > 0) {
        addResult(`Loaded ${response.data.length} quizzes`, "success");
        response.data.forEach((quiz, i) => {
          addResult(
            `   ${i + 1}. ${quiz.title} (${quiz.totalQuestions} questions)`,
            "info"
          );
        });
      } else {
        addResult("No quizzes found in database", "error");
      }
    } catch (error) {
      addResult(`Error fetching quizzes: ${error}`, "error");
    }
  };

  const testLeaderboard = async () => {
    addResult("Testing leaderboard from database...", "info");
    try {
      const leaderboard = await databaseService.getLeaderboard(5, "weekly");
      if (leaderboard && leaderboard.length > 0) {
        addResult(
          `Loaded ${leaderboard.length} leaderboard entries`,
          "success"
        );
        leaderboard.forEach((entry, i) => {
          addResult(
            `   ${i + 1}. ${entry.userName} - ${entry.totalScore} points`,
            "info"
          );
        });
      } else {
        addResult("No leaderboard data found", "error");
      }
    } catch (error) {
      addResult(`Error fetching leaderboard: ${error}`, "error");
    }
  };

  const testAPI = async (endpoint: string, name: string) => {
    addResult(`Testing ${name}...`, "info");
    try {
      const response = await fetch(endpoint);
      const data = (await response.json()) as {
        success: boolean;
        data?: unknown;
        error?: string;
      };

      if (data.success) {
        addResult(`${name}: Success`, "success");
        const preview =
          typeof data.data === "object"
            ? JSON.stringify(data.data).substring(0, 100)
            : data.data;
        addResult(`   Preview: ${preview}...`, "info");
      } else {
        addResult(`${name}: ${data.error}`, "error");
      }
    } catch (error) {
      addResult(`${name}: ${error}`, "error");
    }
  };

  const testPreferences = async () => {
    if (!user?.id) {
      addResult("No user logged in", "error");
      return;
    }
    await testAPI(`/api/users/${user.id}/preferences`, "User Preferences API");
  };

  const testStreaks = async () => {
    if (!user?.id) {
      addResult("No user logged in", "error");
      return;
    }
    await testAPI(`/api/users/${user.id}/streaks`, "User Streaks API");
  };

  const testBookmarks = async () => {
    if (!user?.id) {
      addResult("No user logged in", "error");
      return;
    }
    await testAPI(`/api/users/${user.id}/bookmarks`, "User Bookmarks API");
  };

  const testStudySessions = async () => {
    if (!user?.id) {
      addResult("No user logged in", "error");
      return;
    }
    await testAPI(
      `/api/users/${user.id}/study-sessions`,
      "User Study Sessions API"
    );
  };

  const testProgress = async () => {
    if (!user?.id) {
      addResult("No user logged in", "error");
      return;
    }
    await testAPI(`/api/users/${user.id}/progress`, "User Progress API");
  };

  const testUserAPI = async () => {
    if (!user?.id) {
      addResult("No user logged in", "error");
      return;
    }
    await testAPI(`/api/users/${user.id}`, "User API");
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    addResult("Starting comprehensive database tests...", "info");
    addResult("═".repeat(50), "info");

    // Store Tests
    addResult("STORE TESTS", "info");
    await testUserData();
    await testQuizzes();
    await testLeaderboard();

    addResult("═".repeat(50), "info");

    // API Tests
    addResult("API ROUTE TESTS", "info");
    await testUserAPI();
    await testPreferences();
    await testStreaks();
    await testBookmarks();
    await testStudySessions();
    await testProgress();

    addResult("═".repeat(50), "info");
    addResult("All tests complete!", "success");

    setIsRunning(false);
  };

  const getIcon = (type: TestResult["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Integration Test Suite</CardTitle>
          <p className="text-sm text-slate-500">
            Test all database connections, API routes, and store integrations
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-slate-50 dark:bg-[#1D1D20] rounded-lg">
            <h3 className="font-medium mb-2">Current User</h3>
            {user ? (
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">ID:</span> {user.id}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {user.name || "Not set"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Not logged in</p>
            )}
          </div>

          {/* Store Tests */}
          <div className="space-y-3">
            <h3 className="font-medium">Database Service Tests</h3>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={testUserData} size="sm" disabled={isRunning}>
                Test User Data
              </Button>
              <Button onClick={testQuizzes} size="sm" disabled={isRunning}>
                Test Quizzes
              </Button>
              <Button onClick={testLeaderboard} size="sm" disabled={isRunning}>
                Test Leaderboard
              </Button>
            </div>
          </div>

          {/* API Tests */}
          <div className="space-y-3">
            <h3 className="font-medium">API Route Tests</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={testUserAPI}
                size="sm"
                disabled={isRunning || !user}
              >
                /api/users/[id]
              </Button>
              <Button
                onClick={testPreferences}
                size="sm"
                disabled={isRunning || !user}
              >
                Preferences
              </Button>
              <Button
                onClick={testStreaks}
                size="sm"
                disabled={isRunning || !user}
              >
                Streaks
              </Button>
              <Button
                onClick={testBookmarks}
                size="sm"
                disabled={isRunning || !user}
              >
                Bookmarks
              </Button>
              <Button
                onClick={testStudySessions}
                size="sm"
                disabled={isRunning || !user}
              >
                Study Sessions
              </Button>
              <Button
                onClick={testProgress}
                size="sm"
                disabled={isRunning || !user}
              >
                Progress
              </Button>
            </div>
          </div>

          {/* Run All */}
          <div className="pt-4 border-t space-y-3">
            <Button
              onClick={runAllTests}
              disabled={isRunning || !user}
              className="w-full"
            >
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </Button>
            <Button
              onClick={() => setResults([])}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-950 text-slate-50 p-4 rounded font-mono text-xs max-h-[500px] overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-slate-400">
                No tests run yet. Click a button above to start testing.
              </p>
            ) : (
              <div className="space-y-1">
                {results.map((result, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {getIcon(result.type)}
                    <span className="text-slate-400">[{result.time}]</span>
                    <span
                      className={
                        result.type === "success"
                          ? "text-green-400"
                          : result.type === "error"
                          ? "text-red-400"
                          : "text-slate-300"
                      }
                    >
                      {result.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <ol className="space-y-2">
            <li>
              <strong>Open Browser DevTools</strong> - Press F12 and go to the
              Network tab
            </li>
            <li>
              <strong>Filter by &quot;api&quot;</strong> - To see only API
              requests to your backend
            </li>
            <li>
              <strong>Run Tests</strong> - Click individual test buttons or
              &quot;Run All Tests&quot;
            </li>
            <li>
              <strong>Check Results</strong> - Green ✓ = success, Red ✗ = error
            </li>
            <li>
              <strong>Inspect Network</strong> - Verify each API call returns
              real data from D1
            </li>
          </ol>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded">
            <h4 className="font-medium mb-2">What to Look For:</h4>
            <ul className="space-y-1 text-sm">
              <li>✅ HTTP 200 status codes</li>
              <li>✅ Response includes `success: true`</li>
              <li>✅ Data matches your D1 database</li>
              <li>❌ HTTP 500 errors = server-side issue</li>
              <li>❌ HTTP 401/403 = authentication issue</li>
              <li>❌ Empty data arrays = no data in database</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
