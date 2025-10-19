/**
 * Progress Tracking Service
 *
 * Handles initialization and updates of user progress tracking tables:
 * - user_progress (overall stats)
 * - user_specialty_progress (per-specialty stats)
 * - daily_activity (daily snapshots for streaks and analytics)
 */

import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import type { getDb } from "@/db";
import {
  userProgress,
  userSpecialtyProgress,
  dailyActivity,
  userProfiles,
} from "@/db/schema";
import { calculateLevelFromXp } from "@/lib/leveling";

/**
 * Initialize user progress record when user first signs up or takes first quiz
 */
export async function initializeUserProgress(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string
) {
  try {
    // Check if already exists
    const existing = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new record
    const newProgress = {
      id: nanoid(),
      userId,
      totalQuizzes: 0,
      completedQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      totalTimeSpent: 0,
      totalStudyMinutes: 0,
      materialsCompleted: 0,
      notesCreated: 0,
      focusSessions: 0,
      averageFocusTime: 0,
      specialtyStats: "{}",
      recentActivity: "[]",
      lastActivityDate: new Date().toISOString().split("T")[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(userProgress).values(newProgress);
    console.log(`[ProgressTracking] Initialized progress for user: ${userId}`);
    return newProgress;
  } catch (error) {
    console.error(
      "[ProgressTracking] Error initializing user progress:",
      error
    );
    throw error;
  }
}

/**
 * Update user progress after completing a quiz
 */
export async function updateUserProgressAfterQuiz(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  quizData: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number;
    pointsEarned: number;
    xpEarned: number;
  }
) {
  try {
    // Ensure progress record exists
    await initializeUserProgress(db, userId);

    // Get current progress
    const [currentProgress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .limit(1);

    if (!currentProgress) {
      throw new Error("Failed to get user progress after initialization");
    }

    const newTotalQuizzes = (currentProgress.totalQuizzes || 0) + 1;
    const newCompletedQuizzes = (currentProgress.completedQuizzes || 0) + 1;
    const newTotalQuestionsAnswered =
      (currentProgress.totalQuestionsAnswered || 0) + quizData.totalQuestions;
    const newCorrectAnswers =
      (currentProgress.correctAnswers || 0) + quizData.correctAnswers;
    const newTotalTimeSpent =
      (currentProgress.totalTimeSpent || 0) + quizData.timeTaken;

    // Calculate new average score
    const oldTotalScore =
      (currentProgress.averageScore || 0) *
      (currentProgress.completedQuizzes || 0);
    const newAverageScore =
      (oldTotalScore + quizData.score) / newCompletedQuizzes;

    // Update best score
    const newBestScore = Math.max(
      currentProgress.bestScore || 0,
      quizData.score
    );

    // Update progress
    await db
      .update(userProgress)
      .set({
        totalQuizzes: newTotalQuizzes,
        completedQuizzes: newCompletedQuizzes,
        averageScore: newAverageScore,
        bestScore: newBestScore,
        totalQuestionsAnswered: newTotalQuestionsAnswered,
        correctAnswers: newCorrectAnswers,
        totalTimeSpent: newTotalTimeSpent,
        lastActivityDate: new Date().toISOString().split("T")[0],
        updatedAt: new Date(),
      })
      .where(eq(userProgress.userId, userId));

    console.log(`[ProgressTracking] Updated progress for user: ${userId}`);
  } catch (error) {
    console.error("[ProgressTracking] Error updating user progress:", error);
    throw error;
  }
}

/**
 * Update or create daily activity record
 */
export async function updateDailyActivity(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  activityData: {
    questionsAnswered: number;
    correctAnswers: number;
    quizzesCompleted?: number;
    studyMinutes?: number;
    pointsEarned: number;
    xpEarned: number;
  }
) {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Check if record exists for today
    const [existing] = await db
      .select()
      .from(dailyActivity)
      .where(
        and(
          eq(dailyActivity.userId, userId),
          eq(dailyActivity.activityDate, today)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing record
      await db
        .update(dailyActivity)
        .set({
          questionsAnswered:
            (existing.questionsAnswered || 0) + activityData.questionsAnswered,
          correctAnswers:
            (existing.correctAnswers || 0) + activityData.correctAnswers,
          quizzesCompleted:
            (existing.quizzesCompleted || 0) +
            (activityData.quizzesCompleted || 1),
          studyMinutes:
            (existing.studyMinutes || 0) + (activityData.studyMinutes || 0),
          pointsEarned:
            (existing.pointsEarned || 0) + activityData.pointsEarned,
          xpEarned: (existing.xpEarned || 0) + activityData.xpEarned,
          streakMaintained: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(dailyActivity.userId, userId),
            eq(dailyActivity.activityDate, today)
          )
        );

      console.log(
        `[ProgressTracking] Updated daily activity for user: ${userId}, date: ${today}`
      );
    } else {
      // Create new record
      await db.insert(dailyActivity).values({
        id: nanoid(),
        userId,
        activityDate: today,
        questionsAnswered: activityData.questionsAnswered,
        correctAnswers: activityData.correctAnswers,
        quizzesCompleted: activityData.quizzesCompleted || 1,
        studyMinutes: activityData.studyMinutes || 0,
        loginCount: 0, // Will be updated by login handler
        streakMaintained: true,
        pointsEarned: activityData.pointsEarned,
        xpEarned: activityData.xpEarned,
        activities: "[]",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(
        `[ProgressTracking] Created daily activity for user: ${userId}, date: ${today}`
      );
    }
  } catch (error) {
    console.error("[ProgressTracking] Error updating daily activity:", error);
    throw error;
  }
}

/**
 * Update specialty progress after completing a quiz
 */
export async function updateSpecialtyProgressAfterQuiz(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  specialtyId: string,
  quizData: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number;
  }
) {
  try {
    // Check if specialty progress exists
    const [existing] = await db
      .select()
      .from(userSpecialtyProgress)
      .where(
        and(
          eq(userSpecialtyProgress.userId, userId),
          eq(userSpecialtyProgress.specialtyId, specialtyId)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing record
      const newQuizzesCompleted = (existing.quizzesCompleted || 0) + 1;
      const newQuestionsAnswered =
        (existing.questionsAnswered || 0) + quizData.totalQuestions;
      const newCorrectAnswers =
        (existing.correctAnswers || 0) + quizData.correctAnswers;
      const newTotalTimeSpent =
        (existing.totalTimeSpent || 0) + quizData.timeTaken;

      // Calculate new average score
      const oldTotalScore =
        (existing.averageScore || 0) * (existing.quizzesCompleted || 0);
      const newAverageScore =
        (oldTotalScore + quizData.score) / newQuizzesCompleted;

      // Update best score
      const newBestScore = Math.max(existing.bestScore || 0, quizData.score);

      await db
        .update(userSpecialtyProgress)
        .set({
          quizzesCompleted: newQuizzesCompleted,
          questionsAnswered: newQuestionsAnswered,
          correctAnswers: newCorrectAnswers,
          averageScore: newAverageScore,
          bestScore: newBestScore,
          totalTimeSpent: newTotalTimeSpent,
          lastActivityAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userSpecialtyProgress.userId, userId),
            eq(userSpecialtyProgress.specialtyId, specialtyId)
          )
        );

      console.log(
        `[ProgressTracking] Updated specialty progress for user: ${userId}, specialty: ${specialtyId}`
      );
    } else {
      // Create new record
      await db.insert(userSpecialtyProgress).values({
        id: nanoid(),
        userId,
        specialtyId,
        quizzesCompleted: 1,
        questionsAnswered: quizData.totalQuestions,
        correctAnswers: quizData.correctAnswers,
        averageScore: quizData.score,
        bestScore: quizData.score,
        totalTimeSpent: quizData.timeTaken,
        studyMinutes: 0,
        materialsCompleted: 0,
        notesCount: 0,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(
        `[ProgressTracking] Created specialty progress for user: ${userId}, specialty: ${specialtyId}`
      );
    }
  } catch (error) {
    console.error(
      "[ProgressTracking] Error updating specialty progress:",
      error
    );
    throw error;
  }
}

async function updateUserProfileExperience(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  xpEarned: number
) {
  const increment = Math.max(0, Math.floor(xpEarned));
  if (increment <= 0) {
    return;
  }

  const [profile] = await db
    .select({ xp: userProfiles.xp })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  const now = new Date();

  if (profile) {
    const currentXp = Number.isFinite(profile.xp)
      ? Number(profile.xp)
      : 0;
    const newXp = currentXp + increment;
    await db
      .update(userProfiles)
      .set({
        xp: newXp,
        level: calculateLevelFromXp(newXp),
        updatedAt: now,
      })
      .where(eq(userProfiles.userId, userId));
    return;
  }

  await db.insert(userProfiles).values({
    userId,
    xp: increment,
    level: calculateLevelFromXp(increment),
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Comprehensive progress update after quiz completion
 * Updates all three tables: user_progress, user_specialty_progress, daily_activity
 */
export async function trackQuizCompletion(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  quizData: {
    specialtyId?: string | null;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeTaken: number;
    pointsEarned: number;
    xpEarned: number;
  }
) {
  try {
    // Update user_progress table
    await updateUserProgressAfterQuiz(db, userId, quizData);

    // Update daily_activity table
    await updateDailyActivity(db, userId, {
      questionsAnswered: quizData.totalQuestions,
      correctAnswers: quizData.correctAnswers,
      quizzesCompleted: 1,
      pointsEarned: quizData.pointsEarned,
      xpEarned: quizData.xpEarned,
    });

    // Update user profile XP for leveling and achievements
    await updateUserProfileExperience(db, userId, quizData.xpEarned);

    // Update specialty_progress if applicable
    if (quizData.specialtyId) {
      await updateSpecialtyProgressAfterQuiz(
        db,
        userId,
        quizData.specialtyId,
        quizData
      );
    }

    console.log(
      `[ProgressTracking] Comprehensive tracking completed for user: ${userId}`
    );
  } catch (error) {
    console.error("[ProgressTracking] Error in comprehensive tracking:", error);
    // Don't throw - we don't want progress tracking failures to break quiz submission
    console.error(
      "[ProgressTracking] Quiz completion tracking failed but continuing..."
    );
  }
}
