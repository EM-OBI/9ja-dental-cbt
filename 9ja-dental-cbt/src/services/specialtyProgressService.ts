/**
 * Helper functions for managing user specialty progress
 */

import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import type { getDb } from "@/db";
import { userSpecialtyProgress } from "@/db/schema";

/**
 * Get or create specialty progress record for a user
 */
export async function getOrCreateSpecialtyProgress(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  specialtyId: string
) {
  // Try to find existing record
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
    return existing;
  }

  // Create new record
  const newProgress = {
    id: nanoid(),
    userId,
    specialtyId,
    quizzesCompleted: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    studyMinutes: 0,
    materialsCompleted: 0,
    notesCount: 0,
    lastActivityAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(userSpecialtyProgress).values(newProgress);
  return newProgress;
}

/**
 * Update quiz stats after completing a quiz in a specialty
 */
export async function updateQuizStats(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  specialtyId: string,
  stats: {
    questionsAnswered: number;
    correctAnswers: number;
    score: number;
    timeSpent: number;
  }
) {
  const progress = await getOrCreateSpecialtyProgress(db, userId, specialtyId);

  const newQuizzesCompleted = progress.quizzesCompleted + 1;
  const newQuestionsAnswered =
    progress.questionsAnswered + stats.questionsAnswered;
  const newCorrectAnswers = progress.correctAnswers + stats.correctAnswers;
  const newTotalTimeSpent = progress.totalTimeSpent + stats.timeSpent;

  // Calculate new average score
  const oldTotalScore = progress.averageScore * progress.quizzesCompleted;
  const newAverageScore = (oldTotalScore + stats.score) / newQuizzesCompleted;

  // Update best score if needed
  const newBestScore = Math.max(progress.bestScore, stats.score);

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
    .where(eq(userSpecialtyProgress.id, progress.id));

  return {
    ...progress,
    quizzesCompleted: newQuizzesCompleted,
    questionsAnswered: newQuestionsAnswered,
    correctAnswers: newCorrectAnswers,
    averageScore: newAverageScore,
    bestScore: newBestScore,
    totalTimeSpent: newTotalTimeSpent,
  };
}

/**
 * Update study stats after studying materials in a specialty
 */
export async function updateStudyStats(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  specialtyId: string,
  stats: {
    studyMinutes?: number;
    materialsCompleted?: number;
    notesCreated?: number;
  }
) {
  const progress = await getOrCreateSpecialtyProgress(db, userId, specialtyId);

  await db
    .update(userSpecialtyProgress)
    .set({
      studyMinutes: progress.studyMinutes + (stats.studyMinutes || 0),
      materialsCompleted:
        progress.materialsCompleted + (stats.materialsCompleted || 0),
      notesCount: progress.notesCount + (stats.notesCreated || 0),
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userSpecialtyProgress.id, progress.id));
}

/**
 * Get all specialty progress for a user
 */
export async function getUserSpecialtyProgress(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string
) {
  return await db
    .select()
    .from(userSpecialtyProgress)
    .where(eq(userSpecialtyProgress.userId, userId));
}

/**
 * Get progress for specific specialty
 */
export async function getSpecialtyProgress(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  specialtyId: string
) {
  const [progress] = await db
    .select()
    .from(userSpecialtyProgress)
    .where(
      and(
        eq(userSpecialtyProgress.userId, userId),
        eq(userSpecialtyProgress.specialtyId, specialtyId)
      )
    )
    .limit(1);

  return progress || null;
}
