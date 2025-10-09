import { getDb } from "@/db";
import {
  user,
  userProgress,
  userProfiles,
  userStreaks,
  quizzes,
  questions,
  quizSessions,
  quizResults,
  quizQuestions,
  studySessions,
  dailyActivity,
  bookmarks,
  specialties,
} from "@/db/schema";
import { eq, desc, sql, and, like } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { UserPreferences as PreferenceShape } from "@/store/types";

// Helper function for error handling
function handleDatabaseError(error: Error | unknown, context: string): never {
  console.error(`Database Error (${context}):`, error);
  const message = error instanceof Error ? error.message : "Unknown error";
  throw new Error(`Failed to ${context}: ${message}`);
}

const DEFAULT_USER_PREFERENCES: PreferenceShape = {
  theme: "system",
  notifications: {
    studyReminders: true,
    streakAlerts: true,
    progressReports: true,
    achievements: true,
  },
  quiz: {
    defaultMode: "study",
    showExplanations: true,
    timePerQuestion: 60,
    autoSubmit: false,
  },
  study: {
    defaultFocusTime: 25,
    breakTime: 5,
    soundEffects: true,
  },
};

type PreferenceUpdate = Partial<PreferenceShape> & {
  notifications?: Partial<PreferenceShape["notifications"]>;
  quiz?: Partial<PreferenceShape["quiz"]>;
  study?: Partial<PreferenceShape["study"]>;
};

const serializePreferences = (prefs: PreferenceShape): string =>
  JSON.stringify(prefs);

const parsePreferences = (raw: string | null | undefined): PreferenceShape => {
  if (!raw) {
    return { ...DEFAULT_USER_PREFERENCES };
  }

  try {
    const parsed = JSON.parse(raw) as PreferenceShape;
    return {
      ...DEFAULT_USER_PREFERENCES,
      ...parsed,
      notifications: {
        ...DEFAULT_USER_PREFERENCES.notifications,
        ...(parsed?.notifications ?? {}),
      },
      quiz: {
        ...DEFAULT_USER_PREFERENCES.quiz,
        ...(parsed?.quiz ?? {}),
      },
      study: {
        ...DEFAULT_USER_PREFERENCES.study,
        ...(parsed?.study ?? {}),
      },
    };
  } catch (error) {
    console.warn(
      "Failed to parse user preferences, falling back to defaults",
      error
    );
    return { ...DEFAULT_USER_PREFERENCES };
  }
};

const mergePreferences = (
  current: PreferenceShape,
  updates: PreferenceUpdate
): PreferenceShape => ({
  ...current,
  ...updates,
  notifications: {
    ...current.notifications,
    ...(updates.notifications ?? {}),
  },
  quiz: {
    ...current.quiz,
    ...(updates.quiz ?? {}),
  },
  study: {
    ...current.study,
    ...(updates.study ?? {}),
  },
});

async function ensureUserProfile(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string
) {
  const existing = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const [created] = await db
    .insert(userProfiles)
    .values({
      userId,
      preferences: serializePreferences(DEFAULT_USER_PREFERENCES),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return created;
}

// ============================================
// USER OPERATIONS
// ============================================

export async function getUserById(id: string) {
  try {
    const db = await getDb();
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!userData.length) {
      throw new Error("User not found");
    }

    const profile = await ensureUserProfile(db, id);

    return {
      ...userData[0],
      profile,
      preferences: parsePreferences(profile.preferences),
    };
  } catch (error) {
    return handleDatabaseError(error, "fetch user");
  }
}

export async function updateUser(
  id: string,
  updates: Partial<typeof user.$inferInsert>
) {
  try {
    const db = await getDb();
    const updatedUser = await db
      .update(user)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(user.id, id))
      .returning();

    if (!updatedUser.length) {
      throw new Error("User not found");
    }

    return updatedUser[0];
  } catch (error) {
    return handleDatabaseError(error, "update user");
  }
}

export async function findUserByEmail(email: string) {
  try {
    const db = await getDb();
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return userData.length > 0 ? userData[0] : null;
  } catch (error) {
    console.error(`Failed to find user by email: ${email}`, error);
    return null;
  }
}

// ============================================
// USER PROGRESS OPERATIONS
// ============================================

export async function getUserProgress(userId: string) {
  try {
    const db = await getDb();

    // Aggregate progress metrics from daily activity snapshots
    const [activitySummary] = await db
      .select({
        totalQuizzes: sql<number>`coalesce(sum(${dailyActivity.quizzesCompleted}), 0)`,
        totalQuestionsAnswered: sql<number>`coalesce(sum(${dailyActivity.questionsAnswered}), 0)`,
        correctAnswers: sql<number>`coalesce(sum(${dailyActivity.correctAnswers}), 0)`,
        totalStudyMinutes: sql<number>`coalesce(sum(${dailyActivity.studyMinutes}), 0)`,
        loginCount: sql<number>`coalesce(sum(${dailyActivity.loginCount}), 0)`,
        pointsEarned: sql<number>`coalesce(sum(${dailyActivity.pointsEarned}), 0)`,
        xpEarned: sql<number>`coalesce(sum(${dailyActivity.xpEarned}), 0)`,
        streakDaysMaintained: sql<number>`coalesce(sum(${dailyActivity.streakMaintained}), 0)`,
        lastActivityDate: sql<
          string | null
        >`max(${dailyActivity.activityDate})`,
        activeDays: sql<number>`count(distinct ${dailyActivity.activityDate})`,
      })
      .from(dailyActivity)
      .where(eq(dailyActivity.userId, userId));

    // Get quiz results statistics
    const quizStats = await db
      .select({
        totalQuizzes: sql<number>`count(*)`,
        averageScore: sql<number>`avg(${quizResults.score})`,
        totalCorrect: sql<number>`sum(${quizResults.correctAnswers})`,
        totalQuestions: sql<number>`sum(${quizResults.totalQuestions})`,
      })
      .from(quizResults)
      .where(eq(quizResults.userId, userId));

    // Get current streak
    const currentStreak = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);

    // Get recent activity (last 7 days)
    const recentActivity = await db
      .select()
      .from(dailyActivity)
      .where(eq(dailyActivity.userId, userId))
      .orderBy(desc(dailyActivity.activityDate))
      .limit(7);

    const aggregatedMetrics = {
      totalQuizzes: Number(activitySummary?.totalQuizzes ?? 0),
      totalQuestionsAnswered: Number(
        activitySummary?.totalQuestionsAnswered ?? 0
      ),
      correctAnswers: Number(activitySummary?.correctAnswers ?? 0),
      totalStudyMinutes: Number(activitySummary?.totalStudyMinutes ?? 0),
      loginCount: Number(activitySummary?.loginCount ?? 0),
      pointsEarned: Number(activitySummary?.pointsEarned ?? 0),
      xpEarned: Number(activitySummary?.xpEarned ?? 0),
      streakDaysMaintained: Number(activitySummary?.streakDaysMaintained ?? 0),
      activeDays: Number(activitySummary?.activeDays ?? 0),
      lastActivityDate: activitySummary?.lastActivityDate ?? null,
    };

    const totalQuestions = aggregatedMetrics.totalQuestionsAnswered;
    const correctAnswers = aggregatedMetrics.correctAnswers;
    const averageScore =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    const focusSessions = aggregatedMetrics.activeDays;
    const totalStudyMinutes = aggregatedMetrics.totalStudyMinutes;

    const progressSummary = {
      id: `daily-aggregate-${userId}`,
      userId,
      totalQuizzes: aggregatedMetrics.totalQuizzes,
      completedQuizzes: aggregatedMetrics.totalQuizzes,
      averageScore,
      bestScore: averageScore,
      totalQuestionsAnswered: aggregatedMetrics.totalQuestionsAnswered,
      correctAnswers: aggregatedMetrics.correctAnswers,
      totalTimeSpent: totalStudyMinutes,
      totalStudyMinutes,
      materialsCompleted: 0,
      notesCreated: 0,
      focusSessions,
      averageFocusTime:
        focusSessions > 0 ? Math.round(totalStudyMinutes / focusSessions) : 0,
      specialtyStats: "{}",
      recentActivity: JSON.stringify(recentActivity),
      lastActivityDate: aggregatedMetrics.lastActivityDate,
      pointsEarned: aggregatedMetrics.pointsEarned,
      xpEarned: aggregatedMetrics.xpEarned,
      loginCount: aggregatedMetrics.loginCount,
      streakDaysMaintained: aggregatedMetrics.streakDaysMaintained,
      activeDays: aggregatedMetrics.activeDays,
    };

    return {
      progressData: progressSummary,
      quizStats: quizStats[0] || null,
      currentStreak: currentStreak[0] || null,
      recentActivity,
    };
  } catch (error) {
    return handleDatabaseError(error, "fetch user progress");
  }
}

export async function updateUserProgress(
  userId: string,
  updates: Partial<typeof userProgress.$inferInsert>
) {
  try {
    const db = await getDb();

    const existing = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return await db
        .update(userProgress)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(userProgress.userId, userId))
        .returning();
    }

    return await db
      .insert(userProgress)
      .values({
        id: nanoid(),
        userId,
        ...updates,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
  } catch (error) {
    return handleDatabaseError(error, "update user progress");
  }
}

// ============================================
// USER PREFERENCES OPERATIONS
// ============================================

export async function getUserPreferences(userId: string) {
  try {
    const db = await getDb();
    const profile = await ensureUserProfile(db, userId);
    return parsePreferences(profile.preferences);
  } catch (error) {
    return handleDatabaseError(error, "fetch user preferences");
  }
}

export async function updateUserPreferences(
  userId: string,
  updates: PreferenceUpdate
) {
  try {
    const db = await getDb();
    const profile = await ensureUserProfile(db, userId);
    const currentPreferences = parsePreferences(profile.preferences);
    const mergedPreferences = mergePreferences(currentPreferences, updates);

    await db
      .update(userProfiles)
      .set({
        preferences: serializePreferences(mergedPreferences),
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId));

    return mergedPreferences;
  } catch (error) {
    return handleDatabaseError(error, "update user preferences");
  }
}

// ============================================
// USER STREAKS OPERATIONS
// ============================================

export async function getUserStreaks(userId: string) {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId));
  } catch (error) {
    return handleDatabaseError(error, "fetch user streaks");
  }
}

export async function updateUserStreak(
  userId: string,
  streakType: "daily_quiz" | "study_session" | "login" | "weekly_goal",
  updates: Partial<typeof userStreaks.$inferInsert>
) {
  try {
    const db = await getDb();

    const existing = await db
      .select()
      .from(userStreaks)
      .where(
        and(
          eq(userStreaks.userId, userId),
          eq(userStreaks.streakType, streakType)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return await db
        .update(userStreaks)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userStreaks.userId, userId),
            eq(userStreaks.streakType, streakType)
          )
        )
        .returning();
    } else {
      return await db
        .insert(userStreaks)
        .values({
          id: nanoid(),
          userId,
          streakType,
          ...updates,
        })
        .returning();
    }
  } catch (error) {
    return handleDatabaseError(error, "update user streak");
  }
}

// ============================================
// QUIZ OPERATIONS
// ============================================

export async function getQuizzes(
  options: {
    specialty?: string;
    difficulty?: "easy" | "medium" | "hard";
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    const db = await getDb();
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Build conditions array
    const conditions = [eq(quizzes.isActive, true)];

    if (options.specialty) {
      conditions.push(like(specialties.slug, `%${options.specialty}%`));
    }

    if (options.difficulty) {
      conditions.push(eq(quizzes.difficulty, options.difficulty));
    }

    const results = await db
      .select({
        quiz: quizzes,
        specialty: specialties,
      })
      .from(quizzes)
      .leftJoin(specialties, eq(quizzes.specialtyId, specialties.id))
      .where(and(...conditions))
      .orderBy(desc(quizzes.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizzes)
      .where(eq(quizzes.isActive, true));

    return {
      quizzes: results.map((r) => ({
        ...r.quiz,
        specialty: r.specialty,
      })),
      total: Number(totalCount[0]?.count || 0),
    };
  } catch (error) {
    return handleDatabaseError(error, "fetch quizzes");
  }
}

export async function getQuizById(id: string) {
  try {
    const db = await getDb();

    const quiz = await db
      .select({
        quiz: quizzes,
        specialty: specialties,
      })
      .from(quizzes)
      .leftJoin(specialties, eq(quizzes.specialtyId, specialties.id))
      .where(eq(quizzes.id, id))
      .limit(1);

    if (!quiz.length) {
      throw new Error("Quiz not found");
    }

    // Get quiz questions
    const quizQuestionsData = await db
      .select({
        question: questions,
        sortOrder: quizQuestions.sortOrder,
      })
      .from(quizQuestions)
      .innerJoin(questions, eq(quizQuestions.questionId, questions.id))
      .where(eq(quizQuestions.quizId, id))
      .orderBy(quizQuestions.sortOrder);

    return {
      ...quiz[0].quiz,
      specialty: quiz[0].specialty,
      questions: quizQuestionsData.map((q) => ({
        ...q.question,
        options: JSON.parse(q.question.options),
        tags: q.question.tags ? JSON.parse(q.question.tags) : [],
        sortOrder: q.sortOrder,
      })),
    };
  } catch (error) {
    return handleDatabaseError(error, "fetch quiz");
  }
}

// ============================================
// QUIZ SESSION OPERATIONS
// ============================================

export async function createQuizSession(
  sessionData: typeof quizSessions.$inferInsert
) {
  try {
    const db = await getDb();
    return await db
      .insert(quizSessions)
      .values({
        ...sessionData,
        id: sessionData.id || nanoid(),
      })
      .returning();
  } catch (error) {
    return handleDatabaseError(error, "create quiz session");
  }
}

export async function getQuizSession(id: string) {
  try {
    const db = await getDb();
    const session = await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.id, id))
      .limit(1);

    return session[0] || null;
  } catch (error) {
    return handleDatabaseError(error, "fetch quiz session");
  }
}

export async function getUserQuizSessions(
  userId: string,
  options: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    const db = await getDb();
    const { page = 1, limit = 10, status } = options;
    const offset = (page - 1) * limit;

    const conditions = [eq(quizSessions.userId, userId)];

    if (status === "completed") {
      conditions.push(eq(quizSessions.isCompleted, true));
    } else if (status === "active") {
      conditions.push(eq(quizSessions.isCompleted, false));
    }

    const results = await db
      .select({
        session: quizSessions,
        quiz: quizzes,
      })
      .from(quizSessions)
      .leftJoin(quizzes, eq(quizSessions.quizId, quizzes.id))
      .where(and(...conditions))
      .orderBy(desc(quizSessions.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((r) => ({
      ...r.session,
      quiz: r.quiz,
    }));
  } catch (error) {
    return handleDatabaseError(error, "fetch user quiz sessions");
  }
}

// ============================================
// QUIZ RESULTS OPERATIONS
// ============================================

export async function createQuizResult(
  resultData: typeof quizResults.$inferInsert
) {
  try {
    const db = await getDb();
    return await db
      .insert(quizResults)
      .values({
        ...resultData,
        id: resultData.id || nanoid(),
      })
      .returning();
  } catch (error) {
    return handleDatabaseError(error, "create quiz result");
  }
}

export async function getUserQuizResults(
  userId: string,
  options: {
    quizId?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    const db = await getDb();
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Build conditions array
    const conditions = [eq(quizResults.userId, userId)];

    if (options.quizId) {
      conditions.push(eq(quizResults.quizId, options.quizId));
    }

    const results = await db
      .select({
        result: quizResults,
        quiz: quizzes,
      })
      .from(quizResults)
      .leftJoin(quizzes, eq(quizResults.quizId, quizzes.id))
      .where(and(...conditions))
      .orderBy(desc(quizResults.completedAt))
      .limit(limit)
      .offset(offset);

    return results.map((r) => ({
      ...r.result,
      quiz: r.quiz,
    }));
  } catch (error) {
    return handleDatabaseError(error, "fetch user quiz results");
  }
}

// ============================================
// STUDY SESSIONS OPERATIONS
// ============================================

export async function createStudySession(
  sessionData: typeof studySessions.$inferInsert
) {
  try {
    const db = await getDb();
    return await db
      .insert(studySessions)
      .values({
        ...sessionData,
        id: sessionData.id || nanoid(),
      })
      .returning();
  } catch (error) {
    return handleDatabaseError(error, "create study session");
  }
}

export async function getUserStudySessions(
  userId: string,
  options: {
    status?: string;
    topic?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    const db = await getDb();
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Build conditions array
    const conditions = [eq(studySessions.userId, userId)];

    if (options.topic) {
      conditions.push(like(specialties.name, `%${options.topic}%`));
    }

    const results = await db
      .select({
        session: studySessions,
        specialty: specialties,
      })
      .from(studySessions)
      .leftJoin(specialties, eq(studySessions.specialtyId, specialties.id))
      .where(and(...conditions))
      .orderBy(desc(studySessions.startedAt))
      .limit(limit)
      .offset(offset);

    return results.map((r) => ({
      ...r.session,
      specialty: r.specialty,
    }));
  } catch (error) {
    return handleDatabaseError(error, "fetch user study sessions");
  }
}

// ============================================
// BOOKMARKS OPERATIONS
// ============================================

export async function createBookmark(
  bookmarkData: typeof bookmarks.$inferInsert
) {
  try {
    const db = await getDb();

    // Check if bookmark already exists
    const existing = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, bookmarkData.userId),
          eq(bookmarks.itemType, bookmarkData.itemType),
          eq(bookmarks.itemId, bookmarkData.itemId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Item already bookmarked");
    }

    return await db
      .insert(bookmarks)
      .values({
        ...bookmarkData,
        id: bookmarkData.id || nanoid(),
      })
      .returning();
  } catch (error) {
    return handleDatabaseError(error, "create bookmark");
  }
}

export async function getUserBookmarks(
  userId: string,
  options: {
    itemType?: "quiz" | "question" | "topic";
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    const db = await getDb();
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    // Build conditions array
    const conditions = [eq(bookmarks.userId, userId)];

    if (options.itemType) {
      conditions.push(eq(bookmarks.itemType, options.itemType));
    }

    const results = await db
      .select({
        bookmark: bookmarks,
        question: questions,
      })
      .from(bookmarks)
      .leftJoin(
        questions,
        and(
          eq(bookmarks.itemType, "question"),
          eq(bookmarks.itemId, questions.id)
        )
      )
      .where(and(...conditions))
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((r) => ({
      ...r.bookmark,
      question: r.question
        ? {
            ...r.question,
            options: JSON.parse(r.question.options),
            tags: r.question.tags ? JSON.parse(r.question.tags) : [],
          }
        : null,
    }));
  } catch (error) {
    return handleDatabaseError(error, "fetch user bookmarks");
  }
}

export async function deleteBookmark(id: string, userId: string) {
  try {
    const db = await getDb();
    return await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))
      .returning();
  } catch (error) {
    return handleDatabaseError(error, "delete bookmark");
  }
}

// ============================================
// SPECIALTIES OPERATIONS
// ============================================

export async function getSpecialties() {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(specialties)
      .where(eq(specialties.isActive, true))
      .orderBy(specialties.sortOrder);
  } catch (error) {
    return handleDatabaseError(error, "fetch specialties");
  }
}

export async function getSpecialtyById(id: string) {
  try {
    const db = await getDb();
    const specialty = await db
      .select()
      .from(specialties)
      .where(eq(specialties.id, id))
      .limit(1);

    return specialty[0] || null;
  } catch (error) {
    return handleDatabaseError(error, "fetch specialty");
  }
}

// ============================================
// QUESTIONS OPERATIONS
// ============================================

export async function getQuestions(
  options: {
    specialtyId?: string;
    difficulty?: "easy" | "medium" | "hard";
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  try {
    const db = await getDb();
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Build conditions array
    const conditions = [eq(questions.isActive, true)];

    if (options.specialtyId) {
      conditions.push(eq(questions.specialtyId, options.specialtyId));
    }

    if (options.difficulty) {
      conditions.push(eq(questions.difficulty, options.difficulty));
    }

    if (options.search) {
      conditions.push(like(questions.text, `%${options.search}%`));
    }

    const results = await db
      .select({
        question: questions,
        specialty: specialties,
      })
      .from(questions)
      .leftJoin(specialties, eq(questions.specialtyId, specialties.id))
      .where(and(...conditions))
      .orderBy(desc(questions.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((r) => ({
      ...r.question,
      options: JSON.parse(r.question.options),
      tags: r.question.tags ? JSON.parse(r.question.tags) : [],
      specialty: r.specialty,
    }));
  } catch (error) {
    return handleDatabaseError(error, "fetch questions");
  }
}

export async function getQuestionById(id: string) {
  try {
    const db = await getDb();
    const question = await db
      .select({
        question: questions,
        specialty: specialties,
      })
      .from(questions)
      .leftJoin(specialties, eq(questions.specialtyId, specialties.id))
      .where(eq(questions.id, id))
      .limit(1);

    if (!question.length) {
      throw new Error("Question not found");
    }

    return {
      ...question[0].question,
      options: JSON.parse(question[0].question.options),
      tags: question[0].question.tags
        ? JSON.parse(question[0].question.tags)
        : [],
      specialty: question[0].specialty,
    };
  } catch (error) {
    return handleDatabaseError(error, "fetch question");
  }
}

// ============================================
// DAILY ACTIVITY OPERATIONS
// ============================================

export async function updateDailyActivity(
  userId: string,
  date: string,
  updates: Partial<typeof dailyActivity.$inferInsert>
) {
  try {
    const db = await getDb();

    const existing = await db
      .select()
      .from(dailyActivity)
      .where(
        and(
          eq(dailyActivity.userId, userId),
          eq(dailyActivity.activityDate, date)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return await db
        .update(dailyActivity)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(dailyActivity.userId, userId),
            eq(dailyActivity.activityDate, date)
          )
        )
        .returning();
    } else {
      return await db
        .insert(dailyActivity)
        .values({
          id: nanoid(),
          userId,
          activityDate: date,
          ...updates,
        })
        .returning();
    }
  } catch (error) {
    return handleDatabaseError(error, "update daily activity");
  }
}

export async function getUserDailyActivity(userId: string, days: number = 30) {
  try {
    const db = await getDb();
    return await db
      .select()
      .from(dailyActivity)
      .where(eq(dailyActivity.userId, userId))
      .orderBy(desc(dailyActivity.activityDate))
      .limit(days);
  } catch (error) {
    return handleDatabaseError(error, "fetch user daily activity");
  }
}
