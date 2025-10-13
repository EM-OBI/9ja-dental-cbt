/**
 * Quiz Submit API
 * POST /api/quiz/submit
 *
 * Submits quiz answers, calculates score, saves results
 * Updates user stats and invalidates relevant caches
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import {
  quizSessions,
  quizResults,
  userProgress,
  userSpecialtyProgress,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createKVCacheFromContext, CACHE_KEYS } from "@/services/kvCache";

// Removed: export const runtime = "edge";
// OpenNext for Cloudflare requires edge runtime routes to be in separate files

interface SubmitQuizRequest {
  sessionId: string;
  answers: Record<string, number>; // questionId -> answer index (0-based)
  timeTaken: number; // Total time in seconds
}

interface QuestionResult {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
}

interface SubmitQuizResponse {
  sessionId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  timeTaken: number;
  results: QuestionResult[];
  pointsEarned: number;
  xpEarned: number;
}

export async function POST(request: NextRequest) {
  try {
    // Get user session using Better-Auth
    const auth = await getAuth();
    const authSession = await auth.api.getSession({ headers: request.headers });

    if (!authSession?.user?.id) {
      console.error("[api/quiz/submit] Unauthorized - No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authSession.user.id;
    console.log(`[api/quiz/submit] Submitting quiz for user: ${userId}`);

    // Parse request body
    const body = (await request.json()) as SubmitQuizRequest;
    const { sessionId, answers, timeTaken } = body;

    if (!sessionId || !answers) {
      return NextResponse.json(
        { error: "Session ID and answers are required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Get quiz session from database
    const session = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.id, sessionId))
      .get();

    if (!session) {
      return NextResponse.json(
        { error: "Quiz session not found" },
        { status: 404 }
      );
    }

    // Verify session belongs to user
    if (session.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access to quiz session" },
        { status: 403 }
      );
    }

    // Check if already completed
    if (session.isCompleted) {
      return NextResponse.json(
        { error: "Quiz already submitted" },
        { status: 400 }
      );
    }

    // Parse questions data (contains correct answers)
    const questionsData = JSON.parse(session.questionsData) as Array<{
      id: string;
      correctAnswer: number;
      explanation?: string;
    }>;

    // Calculate results
    let correctCount = 0;
    const results: QuestionResult[] = [];

    questionsData.forEach((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId: question.id,
        userAnswer: userAnswer ?? -1,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      });
    });

    const totalQuestions = questionsData.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 60; // 60% passing grade

    // Calculate points and XP
    const basePoints = correctCount * 10;
    const timeBonus = timeTaken < totalQuestions * 60 ? 20 : 0; // Bonus for completing quickly
    const perfectBonus = score === 100 ? 50 : 0;
    const pointsEarned = basePoints + timeBonus + perfectBonus;

    const xpEarned = Math.round(pointsEarned * 1.5); // XP is 1.5x points

    // Update session as completed
    await db
      .update(quizSessions)
      .set({
        isCompleted: true,
        endTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(quizSessions.id, sessionId));

    // Create quiz result record
    const resultId = `result_${Date.now()}_${userId.substring(0, 8)}`;
    await db.insert(quizResults).values({
      id: resultId,
      sessionId,
      userId,
      quizType: session.quizType,
      specialtyId: session.specialtyId,
      score,
      correctAnswers: correctCount,
      totalQuestions,
      timeTaken,
      answersData: JSON.stringify(answers),
      passed,
      pointsEarned,
      xpEarned,
      completedAt: new Date(),
    });

    // Update user progress
    const userProgressRecord = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .get();

    if (userProgressRecord) {
      const newTotalQuizzes = (userProgressRecord.totalQuizzes || 0) + 1;
      const newCompletedQuizzes =
        (userProgressRecord.completedQuizzes || 0) + 1;
      const newAverageScore =
        ((userProgressRecord.averageScore || 0) * (newCompletedQuizzes - 1) +
          score) /
        newCompletedQuizzes;

      await db
        .update(userProgress)
        .set({
          totalQuizzes: newTotalQuizzes,
          completedQuizzes: newCompletedQuizzes,
          averageScore: newAverageScore,
          updatedAt: new Date(),
        })
        .where(eq(userProgress.userId, userId));
    }

    // Update specialty progress if applicable
    if (session.specialtyId) {
      const specialtyProgress = await db
        .select()
        .from(userSpecialtyProgress)
        .where(
          and(
            eq(userSpecialtyProgress.userId, userId),
            eq(userSpecialtyProgress.specialtyId, session.specialtyId)
          )
        )
        .get();

      if (specialtyProgress) {
        const newQuizzesCompleted =
          (specialtyProgress.quizzesCompleted || 0) + 1;
        const newQuestionsAnswered =
          (specialtyProgress.questionsAnswered || 0) + totalQuestions;
        const newCorrectAnswers =
          (specialtyProgress.correctAnswers || 0) + correctCount;
        const newAverageScore =
          ((specialtyProgress.averageScore || 0) * (newQuizzesCompleted - 1) +
            score) /
          newQuizzesCompleted;
        const newBestScore = Math.max(specialtyProgress.bestScore || 0, score);
        const newTotalTimeSpent =
          (specialtyProgress.totalTimeSpent || 0) + timeTaken;

        await db
          .update(userSpecialtyProgress)
          .set({
            quizzesCompleted: newQuizzesCompleted,
            questionsAnswered: newQuestionsAnswered,
            correctAnswers: newCorrectAnswers,
            averageScore: newAverageScore,
            bestScore: newBestScore,
            totalTimeSpent: newTotalTimeSpent,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userSpecialtyProgress.userId, userId),
              eq(userSpecialtyProgress.specialtyId, session.specialtyId)
            )
          );
      } else {
        // Create new specialty progress record
        await db.insert(userSpecialtyProgress).values({
          id: `sp_${Date.now()}_${userId.substring(0, 8)}`,
          userId,
          specialtyId: session.specialtyId,
          quizzesCompleted: 1,
          questionsAnswered: totalQuestions,
          correctAnswers: correctCount,
          averageScore: score,
          bestScore: score,
          totalTimeSpent: timeTaken,
          studyMinutes: 0,
          materialsCompleted: 0,
          notesCount: 0,
        });
      }
    }

    console.log(`[api/quiz/submit] Quiz submitted successfully: ${sessionId}`);

    const response: SubmitQuizResponse = {
      sessionId,
      score,
      correctAnswers: correctCount,
      totalQuestions,
      passed,
      timeTaken,
      results,
      pointsEarned,
      xpEarned,
    };

    // Invalidate relevant caches
    const cache = await createKVCacheFromContext();
    await Promise.all([
      // Invalidate user-specific caches
      cache.invalidateUserCache(userId),
      // Delete the quiz session cache
      cache.delete(CACHE_KEYS.QUIZ_SESSION(sessionId)),
    ]);

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Quiz Submit API] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
