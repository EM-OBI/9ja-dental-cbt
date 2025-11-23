import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { dailyActivity, userStreaks } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const MAX_ACTIVITY_EVENTS = 25;

type ActivityType = "quiz" | "study" | "login" | "review" | "streak";
type StreakType = "daily_quiz" | "study_session" | "login" | "weekly_goal";

interface TrackActivityBody {
  activityType?: ActivityType;
  activityDate?: string;
  questionsAnswered?: number;
  correctAnswers?: number;
  studyMinutes?: number;
  quizzesCompleted?: number;
  loginCount?: number;
  pointsEarned?: number;
  xpEarned?: number;
  durationSeconds?: number;
  quizId?: string;
  streakType?: StreakType;
  metadata?: Record<string, unknown>;
}

interface ActivityFeedEntry {
  type: ActivityType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const toDateString = (input?: string): string => {
  if (!input) {
    return new Date().toISOString().split("T")[0];
  }

  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return input;
};

const diffInDays = (
  previous?: string | null,
  current?: string | null
): number | null => {
  if (!previous || !current) {
    return null;
  }

  const prevDate = new Date(`${previous}T00:00:00Z`);
  const currDate = new Date(`${current}T00:00:00Z`);

  if (Number.isNaN(prevDate.getTime()) || Number.isNaN(currDate.getTime())) {
    return null;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((currDate.getTime() - prevDate.getTime()) / msPerDay);
};

const parseActivities = (raw?: string | null): ActivityFeedEntry[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ActivityFeedEntry[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn("Failed to parse stored activities", error);
    return [];
  }
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;

    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as TrackActivityBody;
    const activityType: ActivityType = body.activityType ?? "quiz";
    const streakType: StreakType =
      body.streakType ??
      (activityType === "study"
        ? "study_session"
        : activityType === "login"
        ? "login"
        : "daily_quiz");
    const activityDate = toDateString(body.activityDate);

    const questionsAnsweredDelta = body.questionsAnswered ?? 0;
    const correctAnswersDelta = body.correctAnswers ?? 0;
    const studyMinutesDelta = body.studyMinutes ?? 0;
    const quizzesCompletedDelta =
      body.quizzesCompleted ?? (activityType === "quiz" ? 1 : 0);
    const loginCountDelta = body.loginCount ?? 0;
    const pointsDelta = body.pointsEarned ?? 0;
    const xpDelta = body.xpEarned ?? pointsDelta;

    const db = await getDb();

    const [existingActivity] = await db
      .select()
      .from(dailyActivity)
      .where(
        and(
          eq(dailyActivity.userId, userId),
          eq(dailyActivity.activityDate, activityDate)
        )
      )
      .limit(1);

    const [existingStreak] = await db
      .select()
      .from(userStreaks)
      .where(
        and(
          eq(userStreaks.userId, userId),
          eq(userStreaks.streakType, streakType)
        )
      )
      .limit(1);

    const activityFeed = parseActivities(existingActivity?.activities);
    activityFeed.push({
      type: activityType,
      timestamp: new Date().toISOString(),
      metadata: {
        quizId: body.quizId,
        questionsAnswered: questionsAnsweredDelta,
        correctAnswers: correctAnswersDelta,
        pointsEarned: pointsDelta,
        durationSeconds: body.durationSeconds,
        ...body.metadata,
      },
    });

    const trimmedActivityFeed = activityFeed.slice(-MAX_ACTIVITY_EVENTS);

    const updateTimestamp = new Date();

    const activityUpdate = {
      questionsAnswered:
        (existingActivity?.questionsAnswered ?? 0) + questionsAnsweredDelta,
      correctAnswers:
        (existingActivity?.correctAnswers ?? 0) + correctAnswersDelta,
      studyMinutes: (existingActivity?.studyMinutes ?? 0) + studyMinutesDelta,
      quizzesCompleted:
        (existingActivity?.quizzesCompleted ?? 0) + quizzesCompletedDelta,
      loginCount: (existingActivity?.loginCount ?? 0) + loginCountDelta,
      pointsEarned: (existingActivity?.pointsEarned ?? 0) + pointsDelta,
      xpEarned: (existingActivity?.xpEarned ?? 0) + xpDelta,
      activities: JSON.stringify(trimmedActivityFeed),
      updatedAt: updateTimestamp,
    };

    let persistedActivity = existingActivity
      ? { ...existingActivity, ...activityUpdate }
      : {
          id: nanoid(),
          userId,
          activityDate,
          ...activityUpdate,
          streakMaintained: false,
          createdAt: updateTimestamp,
        };

    if (existingActivity) {
      await db
        .update(dailyActivity)
        .set(activityUpdate)
        .where(eq(dailyActivity.id, existingActivity.id));
    } else {
      await db.insert(dailyActivity).values(persistedActivity);
    }

    const dayDiff = diffInDays(existingStreak?.lastActivityDate, activityDate);
    let currentCount = 1;
    let bestCount = 1;
    let streakStartDate = activityDate;

    if (existingStreak) {
      currentCount = existingStreak.currentCount ?? 0;
      bestCount = existingStreak.bestCount ?? 0;
      streakStartDate = existingStreak.streakStartDate ?? activityDate;

      if (dayDiff === 0) {
        // Activity already logged today – keep counts as-is
        currentCount = Math.max(currentCount, 1);
        bestCount = Math.max(bestCount, currentCount);
      } else if (dayDiff === 1) {
        currentCount = currentCount + 1;
        bestCount = Math.max(bestCount, currentCount);
      } else {
        currentCount = 1;
        streakStartDate = activityDate;
        bestCount = Math.max(bestCount, currentCount);
      }

      await db
        .update(userStreaks)
        .set({
          currentCount,
          bestCount,
          lastActivityDate: activityDate,
          streakStartDate,
          updatedAt: new Date(),
        })
        .where(eq(userStreaks.id, existingStreak.id));
    } else {
      await db.insert(userStreaks).values({
        id: nanoid(),
        userId,
        streakType,
        currentCount,
        bestCount,
        lastActivityDate: activityDate,
        streakStartDate: activityDate,
        streakData: JSON.stringify({ history: [] }),
      });
    }

    const streakMaintained = dayDiff === null || dayDiff <= 1;

    const streakUpdateTimestamp = new Date();

    await db
      .update(dailyActivity)
      .set({
        streakMaintained,
        updatedAt: streakUpdateTimestamp,
      })
      .where(
        and(
          eq(dailyActivity.userId, userId),
          eq(dailyActivity.activityDate, activityDate)
        )
      );

    persistedActivity = {
      ...persistedActivity,
      streakMaintained,
      activities: JSON.stringify(trimmedActivityFeed),
      updatedAt: streakUpdateTimestamp,
    };

    const responsePayload = {
      activity: {
        ...persistedActivity,
        activities: trimmedActivityFeed,
      },
      streak: {
        streakType,
        currentCount,
        bestCount,
        lastActivityDate: activityDate,
        streakStartDate,
        streakMaintained,
      },
    };

    return NextResponse.json({ success: true, data: responsePayload });
  } catch (error) {
    console.error("Error tracking daily activity:", error);
    return NextResponse.json(
      { error: "Failed to track daily activity" },
      { status: 500 }
    );
  }
}
