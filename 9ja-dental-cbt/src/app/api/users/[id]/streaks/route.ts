import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getUserStreaks } from "@/services/serverData";
import { getDb } from "@/db";
import { dailyActivity } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

type ActivityType = "quiz" | "study" | "review" | "login" | "streak";

interface ActivityFeedEntry {
  type?: ActivityType | string;
  metadata?: Record<string, unknown>;
}

const MAX_CALENDAR_DAYS = 30;

const normalizeActivityType = (type?: string | null): ActivityType | null => {
  if (!type) return null;

  switch (type.toLowerCase()) {
    case "quiz":
    case "quiz_completed":
      return "quiz";
    case "study":
    case "study_session":
      return "study";
    case "review":
      return "review";
    case "login":
      return "login";
    case "streak":
    case "streak_milestone":
    case "achievement":
    case "achievement_unlocked":
    case "progress":
      return "streak";
    default:
      return "streak";
  }
};

const parseActivities = (raw?: string | null): ActivityFeedEntry[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ActivityFeedEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("[streaks] Failed to parse activity feed", error);
    return [];
  }
};

const buildCalendarFromDailyActivity = (
  rows: Array<typeof dailyActivity.$inferSelect>
) => {
  const activityByDate = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    activityByDate.set(row.activityDate, row);
  }

  const today = new Date();
  const calendar = [] as Array<{
    date: string;
    active: boolean;
    activityTypes: ActivityType[];
    activityCount: number;
    streakMaintained: boolean;
  }>;

  for (let offset = MAX_CALENDAR_DAYS - 1; offset >= 0; offset--) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const dateKey = day.toISOString().split("T")[0];

    const daily = activityByDate.get(dateKey);

    if (!daily) {
      calendar.push({
        date: dateKey,
        active: false,
        activityTypes: [],
        activityCount: 0,
        streakMaintained: false,
      });
      continue;
    }

    const activityFeed = parseActivities(daily.activities);
    const activityTypes = new Set<ActivityType>();

    for (const entry of activityFeed) {
      const normalizedType = normalizeActivityType(entry?.type ?? undefined);
      if (normalizedType) {
        activityTypes.add(normalizedType);
      }
    }

    if ((daily.quizzesCompleted ?? 0) > 0) activityTypes.add("quiz");
    if ((daily.studyMinutes ?? 0) > 0) activityTypes.add("study");
    if ((daily.loginCount ?? 0) > 0) activityTypes.add("login");

    const streakMaintained = Boolean(daily.streakMaintained);
    const active = streakMaintained || activityTypes.size > 0;
    const activityCount = activityFeed.length
      ? activityFeed.length
      : activityTypes.size;

    calendar.push({
      date: dateKey,
      active,
      activityTypes: Array.from(activityTypes),
      activityCount: active ? Math.max(activityCount, 1) : activityCount,
      streakMaintained,
    });
  }

  return calendar;
};

// GET /api/users/[id]/streaks - Get user streak data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is accessing their own data
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch streaks and daily activity from database
    const [streaks, db] = await Promise.all([getUserStreaks(id), getDb()]);

    const recentActivity = await db
      .select()
      .from(dailyActivity)
      .where(eq(dailyActivity.userId, id))
      .orderBy(desc(dailyActivity.activityDate))
      .limit(MAX_CALENDAR_DAYS * 2);

    const streakCalendar = buildCalendarFromDailyActivity(recentActivity);

    // Calculate streak statistics
    const dailyQuizStreak = streaks.find((s) => s.streakType === "daily_quiz");
    const studyStreak = streaks.find((s) => s.streakType === "study_session");
    const loginStreak = streaks.find((s) => s.streakType === "login");

    const streakData = {
      currentStreak: dailyQuizStreak?.currentCount || 0,
      longestStreak: dailyQuizStreak?.bestCount || 0,
      lastActivityDate: dailyQuizStreak?.lastActivityDate || null,
      streaks: {
        dailyQuiz: dailyQuizStreak,
        study: studyStreak,
        login: loginStreak,
      },
      allStreaks: streaks,
      streakCalendar,
    };

    return NextResponse.json({
      success: true,
      data: streakData,
    });
  } catch (error) {
    console.error("Error fetching user streaks:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
