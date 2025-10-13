/**
 * Quiz Start API
 * POST /api/quiz/start
 *
 * Creates a new quiz session and returns questions
 * Handles question selection and session initialization
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getDb } from "@/db";
import { questions, quizSessions, specialties } from "@/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import {
  createKVCacheFromContext,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/services/kvCache";

// Removed: export const runtime = "edge";
// OpenNext for Cloudflare requires edge runtime routes to be in separate files

interface StartQuizRequest {
  specialtyId?: string;
  quizType: "practice" | "challenge" | "exam";
  questionCount?: number;
  timeLimit?: number; // seconds
}

interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Will be populated after quiz submission
  explanation: string; // Will be populated after quiz submission
  specialty: string; // Specialty name
  difficulty: "easy" | "medium" | "hard";
  imageUrl?: string;
  timeLimit?: number;
  type: "mcq" | "true-false" | "image-based";
  timeEstimate: number;
}

interface StartQuizResponse {
  sessionId: string;
  questions: QuizQuestion[];
  quizType: "practice" | "challenge" | "exam";
  totalQuestions: number;
  timeLimit?: number;
  specialtyName?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get user session using Better-Auth
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      console.error("[api/quiz/start] Unauthorized - No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`[api/quiz/start] Starting quiz for user: ${userId}`);

    // Parse request body
    const body = (await request.json()) as StartQuizRequest;
    const {
      specialtyId,
      quizType = "practice",
      questionCount = 10,
      timeLimit,
    } = body;

    console.log(`[api/quiz/start] Request params:`, {
      specialtyId,
      quizType,
      questionCount,
      timeLimit,
    });

    // Validate quiz type
    if (!["practice", "challenge", "exam"].includes(quizType)) {
      return NextResponse.json({ error: "Invalid quiz type" }, { status: 400 });
    }

    const db = await getDb();

    // Debug: Check total questions in database
    const totalQuestions = await db
      .select({ count: sql`COUNT(*)` })
      .from(questions)
      .where(eq(questions.isActive, true))
      .get();

    console.log(
      `[api/quiz/start] Total active questions in DB: ${
        totalQuestions?.count || 0
      }`
    );

    // Debug: Show questions by specialty
    if (specialtyId) {
      const questionsInSpecialty = await db
        .select({ count: sql`COUNT(*)` })
        .from(questions)
        .where(
          and(
            eq(questions.isActive, true),
            eq(questions.specialtyId, specialtyId)
          )
        )
        .get();

      console.log(
        `[api/quiz/start] Questions in specialty ${specialtyId}: ${
          questionsInSpecialty?.count || 0
        }`
      );
    }

    // Build query for questions
    const questionConditions = [eq(questions.isActive, true)];

    if (specialtyId) {
      questionConditions.push(eq(questions.specialtyId, specialtyId));
    }

    // Fetch available questions
    const availableQuestions = await db
      .select()
      .from(questions)
      .where(and(...questionConditions))
      .limit(questionCount * 2) // Fetch more for randomization
      .all();

    console.log(
      `[api/quiz/start] Found ${
        availableQuestions.length
      } questions for specialty: ${specialtyId || "all"}`
    );

    // Debug: Log first question to see structure
    if (availableQuestions.length > 0) {
      console.log(
        "[api/quiz/start] Sample question from DB:",
        JSON.stringify({
          id: availableQuestions[0].id,
          text: availableQuestions[0].text?.substring(0, 50),
          hasOptions: !!availableQuestions[0].options,
          optionsType: typeof availableQuestions[0].options,
          correctAnswer: availableQuestions[0].correctAnswer,
          hasExplanation: !!availableQuestions[0].explanation,
        })
      );
    }

    if (availableQuestions.length === 0) {
      console.error(
        `[api/quiz/start] No questions found for specialty: ${
          specialtyId || "all"
        }`
      );
      return NextResponse.json(
        {
          error: specialtyId
            ? "No questions available for this specialty"
            : "No questions available",
        },
        { status: 404 }
      );
    }

    // Randomly select questions
    const shuffled = availableQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(
      0,
      Math.min(questionCount, shuffled.length)
    );

    console.log(
      `[api/quiz/start] Selected ${selectedQuestions.length} questions after shuffle`
    );

    // Prepare specialty lookup so each question gets its proper display name
    let specialtyName = "General";
    const specialtyNameById = new Map<string, string>();

    if (specialtyId) {
      const specialty = await db
        .select({ id: specialties.id, name: specialties.name })
        .from(specialties)
        .where(eq(specialties.id, specialtyId))
        .get();

      if (specialty) {
        specialtyName = specialty.name;
        specialtyNameById.set(specialty.id, specialty.name);
      }
    }

    const questionSpecialtyIds = Array.from(
      new Set(
        selectedQuestions
          .map((q) => q.specialtyId)
          .filter((id): id is string => Boolean(id))
      )
    );

    if (questionSpecialtyIds.length > 0) {
      const specialtyRecords = await db
        .select({ id: specialties.id, name: specialties.name })
        .from(specialties)
        .where(inArray(specialties.id, questionSpecialtyIds))
        .all();

      specialtyRecords.forEach((record) => {
        specialtyNameById.set(record.id, record.name ?? "General");
      });
    }

    // Format questions (hide correct answer from client initially)
    const formattedQuestions: QuizQuestion[] = selectedQuestions.map((q) => {
      // Parse options from JSON string
      const options: string[] = JSON.parse(q.options);

      return {
        id: q.id,
        text: q.text,
        options,
        correctAnswer:
          typeof q.correctAnswer === "number"
            ? q.correctAnswer
            : Number(q.correctAnswer ?? -1),
        explanation: q.explanation || "",
        specialty:
          (q.specialtyId && specialtyNameById.get(q.specialtyId)) ||
          specialtyName ||
          q.specialtyId ||
          "General",
        difficulty: q.difficulty as "easy" | "medium" | "hard",
        imageUrl: q.imageUrl || undefined,
        timeLimit: q.timeEstimate || undefined,
        type: (q.type || "mcq") as "mcq" | "true-false" | "image-based",
        timeEstimate: q.timeEstimate || 60,
      };
    });

    // Debug: Log first formatted question
    if (formattedQuestions.length > 0) {
      console.log(
        "[api/quiz/start] Sample formatted question:",
        JSON.stringify({
          id: formattedQuestions[0].id,
          text: formattedQuestions[0].text?.substring(0, 50),
          optionsCount: formattedQuestions[0].options?.length,
          firstOption: formattedQuestions[0].options?.[0]?.substring(0, 30),
        })
      );
    }

    // Create session ID
    const sessionId = `quiz_${Date.now()}_${userId.substring(0, 8)}`;

    // Store questions data with correct answers (for validation later)
    const questionsData = JSON.stringify(
      selectedQuestions.map((q) => ({
        id: q.id,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }))
    );

    // Calculate time limit if not provided
    const calculatedTimeLimit =
      timeLimit || (quizType === "exam" ? questionCount * 90 : undefined);

    // Create quiz session in database
    await db.insert(quizSessions).values({
      id: sessionId,
      userId,
      quizType,
      specialtyId: specialtyId || null,
      totalQuestions: selectedQuestions.length,
      questionsData,
      currentQuestion: 0,
      timeLimit: calculatedTimeLimit,
      isCompleted: false,
      isPaused: false,
    });

    console.log(`[api/quiz/start] Quiz session created: ${sessionId}`);

    const response: StartQuizResponse = {
      sessionId,
      questions: formattedQuestions,
      quizType,
      totalQuestions: selectedQuestions.length,
      timeLimit: calculatedTimeLimit,
      specialtyName,
    };

    // Cache the quiz session for faster access
    const cache = await createKVCacheFromContext();
    await cache.set(
      CACHE_KEYS.QUIZ_SESSION(sessionId),
      {
        sessionId,
        userId,
        questionsData,
        totalQuestions: selectedQuestions.length,
        startedAt: new Date().toISOString(),
      },
      CACHE_TTL.QUIZ_SESSION
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Quiz Start API] Error:", error);
    return NextResponse.json(
      { error: "Failed to start quiz" },
      { status: 500 }
    );
  }
}
