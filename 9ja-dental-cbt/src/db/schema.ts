import {
  integer,
  sqliteTable,
  text,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================
// AUTH TABLES (Better Auth)
// ============================================

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  bio: text("bio"), // User biography/description
  role: text("role", { enum: ["user", "admin"] })
    .default("user")
    .notNull(), // Role for access control
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  subscription: text("subscription", {
    enum: ["free", "premium", "enterprise"],
  })
    .default("free")
    .notNull(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  preferences: text("preferences").default("{}").notNull(),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

// ============================================
// CORE TABLES
// ============================================

export const specialties = sqliteTable("specialties", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category", {
    enum: ["quiz", "study", "streak", "social", "milestone"],
  }).notNull(),
  difficulty: text("difficulty", {
    enum: ["bronze", "silver", "gold", "platinum"],
  }).notNull(),
  icon: text("icon"),
  criteria: text("criteria").notNull(), // JSON
  pointsReward: integer("points_reward").default(0),
  xpReward: integer("xp_reward").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  specialtyId: text("specialty_id")
    .notNull()
    .references(() => specialties.id),
  text: text("text").notNull(),
  options: text("options").notNull(), // JSON array
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty", {
    enum: ["easy", "medium", "hard"],
  }).notNull(),
  type: text("type", { enum: ["mcq", "true-false", "image-based"] }).default(
    "mcq"
  ),
  timeEstimate: integer("time_estimate").default(60),
  tags: text("tags"), // JSON array
  imageUrl: text("image_url"),
  reference: text("reference"),
  points: integer("points").default(10),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdBy: text("created_by").references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const quizzes = sqliteTable("quizzes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  specialtyId: text("specialty_id").references(() => specialties.id),
  difficulty: text("difficulty", {
    enum: ["easy", "medium", "hard"],
  }).notNull(),
  totalQuestions: integer("total_questions").notNull().default(20),
  timeLimit: integer("time_limit"), // minutes
  quizType: text("quiz_type", {
    enum: ["practice", "challenge", "exam"],
  }).default("practice"),
  passingScore: integer("passing_score").default(70),
  tags: text("tags"), // JSON array
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdBy: text("created_by").references(() => user.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const quizQuestions = sqliteTable("quiz_questions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const quizSessions = sqliteTable("quiz_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  quizId: text("quiz_id").references(() => quizzes.id),
  quizType: text("quiz_type", {
    enum: ["practice", "challenge", "exam"],
  }).notNull(),
  specialtyId: text("specialty_id").references(() => specialties.id),
  currentQuestion: integer("current_question").default(0),
  totalQuestions: integer("total_questions").notNull(),
  questionsData: text("questions_data").notNull(), // JSON
  startTime: integer("start_time", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  timeLimit: integer("time_limit"), // seconds
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  isPaused: integer("is_paused", { mode: "boolean" }).default(false),
  pauseTime: integer("pause_time", { mode: "timestamp" }),
  resumeTime: integer("resume_time", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const quizResults = sqliteTable("quiz_results", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => quizSessions.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  quizId: text("quiz_id").references(() => quizzes.id),
  quizType: text("quiz_type", {
    enum: ["practice", "challenge", "exam"],
  }).notNull(),
  specialtyId: text("specialty_id").references(() => specialties.id),
  score: integer("score").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeTaken: integer("time_taken").notNull(), // seconds
  answersData: text("answers_data").notNull(), // JSON
  passed: integer("passed", { mode: "boolean" }).notNull(),
  pointsEarned: integer("points_earned").default(0),
  xpEarned: integer("xp_earned").default(0),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const userProgress = sqliteTable(
  "user_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    totalQuizzes: integer("total_quizzes").default(0),
    completedQuizzes: integer("completed_quizzes").default(0),
    averageScore: real("average_score").default(0),
    bestScore: integer("best_score").default(0),
    totalQuestionsAnswered: integer("total_questions_answered").default(0),
    correctAnswers: integer("correct_answers").default(0),
    totalTimeSpent: integer("total_time_spent").default(0),
    totalStudyMinutes: integer("total_study_minutes").default(0),
    materialsCompleted: integer("materials_completed").default(0),
    notesCreated: integer("notes_created").default(0),
    focusSessions: integer("focus_sessions").default(0),
    averageFocusTime: integer("average_focus_time").default(0),
    specialtyStats: text("specialty_stats").default("{}"),
    recentActivity: text("recent_activity").default("[]"),
    lastActivityDate: text("last_activity_date"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("user_progress_user_idx").on(table.userId)]
);

// User progress per specialty - tracks detailed stats for each specialty
export const userSpecialtyProgress = sqliteTable(
  "user_specialty_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    specialtyId: text("specialty_id")
      .notNull()
      .references(() => specialties.id, { onDelete: "cascade" }),

    // Quiz stats for this specialty
    quizzesCompleted: integer("quizzes_completed").default(0).notNull(),
    questionsAnswered: integer("questions_answered").default(0).notNull(),
    correctAnswers: integer("correct_answers").default(0).notNull(),
    averageScore: real("average_score").default(0).notNull(),
    bestScore: integer("best_score").default(0).notNull(),
    totalTimeSpent: integer("total_time_spent").default(0).notNull(), // seconds

    // Study stats for this specialty
    studyMinutes: integer("study_minutes").default(0).notNull(),
    materialsCompleted: integer("materials_completed").default(0).notNull(),
    notesCount: integer("notes_count").default(0).notNull(),

    lastActivityAt: integer("last_activity_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_specialty_progress_user_specialty_idx").on(
      table.userId,
      table.specialtyId
    ),
    index("user_specialty_progress_user_idx").on(table.userId),
    index("user_specialty_progress_specialty_idx").on(table.specialtyId),
  ]
);

export const studySessions = sqliteTable("study_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sessionType: text("session_type", {
    enum: ["focused", "review", "practice", "exam_prep"],
  }).notNull(),
  specialtyId: text("specialty_id").references(() => specialties.id),
  duration: integer("duration").notNull(), // minutes
  topicsCovered: text("topics_covered"), // JSON array
  questionsReviewed: integer("questions_reviewed").default(0),
  notes: text("notes"),
  goalsSet: text("goals_set"), // JSON
  goalsAchieved: text("goals_achieved"), // JSON
  qualityRating: integer("quality_rating"), // 1-5
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// NEW SCHEMA: Study Packages - Main container for all study materials
export const studyPackages = sqliteTable(
  "study_packages",
  {
    id: text("id").primaryKey(), // Unique package ID (nanoid)
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(), // User-provided topic name
    topicSlug: text("topic_slug").notNull(), // Slugified topic
    sourceType: text("source_type").notNull(), // "pdf" | "text" | "ai"
    sourcePath: text("source_path"), // R2 path to source PDF if applicable
    status: text("status").default("completed").notNull(), // "generating" | "completed" | "failed"
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("study_packages_user_idx").on(table.userId),
    index("study_packages_created_idx").on(table.createdAt),
  ]
);

// Study Summaries - Linked to packages
export const studySummaries = sqliteTable(
  "study_summaries",
  {
    id: text("id").primaryKey(), // Unique summary ID (nanoid)
    packageId: text("package_id")
      .notNull()
      .references(() => studyPackages.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    r2Path: text("r2_path").notNull(), // Path in R2 bucket
    model: text("model").default("llama-3-8b-instruct").notNull(),
    contentHash: text("content_hash"), // SHA-256 hash for deduplication
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("study_summaries_package_idx").on(table.packageId),
    index("study_summaries_user_idx").on(table.userId),
  ]
);

// Study Flashcards - Linked to packages
export const studyFlashcards = sqliteTable(
  "study_flashcards",
  {
    id: text("id").primaryKey(), // Unique flashcard set ID (nanoid)
    packageId: text("package_id")
      .notNull()
      .references(() => studyPackages.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    r2Path: text("r2_path").notNull(), // Path in R2 bucket (JSON file)
    count: integer("count").default(0).notNull(), // Number of flashcards
    model: text("model").default("llama-3-8b-instruct").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("study_flashcards_package_idx").on(table.packageId),
    index("study_flashcards_user_idx").on(table.userId),
  ]
);

// Study Quizzes - Linked to packages
export const studyQuizzes = sqliteTable(
  "study_quizzes",
  {
    id: text("id").primaryKey(), // Unique quiz ID (nanoid)
    packageId: text("package_id")
      .notNull()
      .references(() => studyPackages.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    r2Path: text("r2_path").notNull(), // Path in R2 bucket (JSON file)
    numQuestions: integer("num_questions").default(0).notNull(),
    model: text("model").default("llama-3-8b-instruct").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("study_quizzes_package_idx").on(table.packageId),
    index("study_quizzes_user_idx").on(table.userId),
  ]
);

// Study Progress - Track user progress on packages
export const studyProgress = sqliteTable(
  "study_progress",
  {
    id: text("id").primaryKey(),
    packageId: text("package_id")
      .notNull()
      .references(() => studyPackages.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    summaryViewed: integer("summary_viewed", { mode: "boolean" })
      .default(false)
      .notNull(),
    flashcardsCompleted: integer("flashcards_completed", { mode: "boolean" })
      .default(false)
      .notNull(),
    quizScore: integer("quiz_score"),
    quizAttempts: integer("quiz_attempts").default(0).notNull(),
    lastAccessedAt: integer("last_accessed_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("study_progress_package_user_idx").on(
      table.packageId,
      table.userId
    ),
    index("study_progress_user_idx").on(table.userId),
  ]
);

export const dailyActivity = sqliteTable(
  "daily_activity",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    activityDate: text("activity_date").notNull(), // DATE format
    questionsAnswered: integer("questions_answered").default(0),
    correctAnswers: integer("correct_answers").default(0),
    studyMinutes: integer("study_minutes").default(0),
    quizzesCompleted: integer("quizzes_completed").default(0),
    loginCount: integer("login_count").default(0),
    streakMaintained: integer("streak_maintained", { mode: "boolean" }).default(
      false
    ),
    pointsEarned: integer("points_earned").default(0),
    xpEarned: integer("xp_earned").default(0),
    activities: text("activities").default("[]"), // JSON array
    createdAt: integer("created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("daily_activity_user_day_idx").on(
      table.userId,
      table.activityDate
    ),
  ]
);

export const userStreaks = sqliteTable("user_streaks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  streakType: text("streak_type", {
    enum: ["daily_quiz", "study_session", "login", "weekly_goal"],
  }).notNull(),
  currentCount: integer("current_count").default(0),
  bestCount: integer("best_count").default(0),
  lastActivityDate: text("last_activity_date"), // DATE format
  streakStartDate: text("streak_start_date"), // DATE format
  streakData: text("streak_data").default("{}"), // JSON
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const userAchievements = sqliteTable("user_achievements", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  achievementId: text("achievement_id")
    .notNull()
    .references(() => achievements.id, { onDelete: "cascade" }),
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress").notNull(),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  pointsEarned: integer("points_earned").default(0),
  xpEarned: integer("xp_earned").default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const bookmarks = sqliteTable("bookmarks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  itemType: text("item_type", {
    enum: ["question", "quiz", "topic"],
  }).notNull(),
  itemId: text("item_id").notNull(),
  notes: text("notes"),
  tags: text("tags"), // JSON array
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const systemSettings = sqliteTable("system_settings", {
  id: text("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(), // JSON
  description: text("description"),
  category: text("category").default("general"),
  isPublic: integer("is_public", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date())
    .notNull(),
});

// ============================================
// RELATIONS
// ============================================

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  profile: one(userProfiles, {
    fields: [user.id],
    references: [userProfiles.userId],
  }),
  quizSessions: many(quizSessions),
  quizResults: many(quizResults),
  userProgress: many(userProgress),
  userSpecialtyProgress: many(userSpecialtyProgress),
  studySessions: many(studySessions),
  dailyActivity: many(dailyActivity),
  userStreaks: many(userStreaks),
  userAchievements: many(userAchievements),
  bookmarks: many(bookmarks),
  createdQuizzes: many(quizzes),
  createdQuestions: many(questions),
}));

export const specialtiesRelations = relations(specialties, ({ many }) => ({
  questions: many(questions),
  quizzes: many(quizzes),
  quizSessions: many(quizSessions),
  quizResults: many(quizResults),
  userSpecialtyProgress: many(userSpecialtyProgress),
  studySessions: many(studySessions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  specialty: one(specialties, {
    fields: [questions.specialtyId],
    references: [specialties.id],
  }),
  creator: one(user, {
    fields: [questions.createdBy],
    references: [user.id],
  }),
  quizQuestions: many(quizQuestions),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  specialty: one(specialties, {
    fields: [quizzes.specialtyId],
    references: [specialties.id],
  }),
  creator: one(user, {
    fields: [quizzes.createdBy],
    references: [user.id],
  }),
  quizQuestions: many(quizQuestions),
  quizSessions: many(quizSessions),
  quizResults: many(quizResults),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
  question: one(questions, {
    fields: [quizQuestions.questionId],
    references: [questions.id],
  }),
}));

export const quizSessionsRelations = relations(
  quizSessions,
  ({ one, many }) => ({
    user: one(user, {
      fields: [quizSessions.userId],
      references: [user.id],
    }),
    quiz: one(quizzes, {
      fields: [quizSessions.quizId],
      references: [quizzes.id],
    }),
    specialty: one(specialties, {
      fields: [quizSessions.specialtyId],
      references: [specialties.id],
    }),
    results: many(quizResults),
  })
);

export const quizResultsRelations = relations(quizResults, ({ one }) => ({
  session: one(quizSessions, {
    fields: [quizResults.sessionId],
    references: [quizSessions.id],
  }),
  user: one(user, {
    fields: [quizResults.userId],
    references: [user.id],
  }),
  quiz: one(quizzes, {
    fields: [quizResults.quizId],
    references: [quizzes.id],
  }),
  specialty: one(specialties, {
    fields: [quizResults.specialtyId],
    references: [specialties.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(
  userAchievements,
  ({ one }) => ({
    user: one(user, {
      fields: [userAchievements.userId],
      references: [user.id],
    }),
    achievement: one(achievements, {
      fields: [userAchievements.achievementId],
      references: [achievements.id],
    }),
  })
);

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(user, {
    fields: [userProgress.userId],
    references: [user.id],
  }),
}));

export const userSpecialtyProgressRelations = relations(
  userSpecialtyProgress,
  ({ one }) => ({
    user: one(user, {
      fields: [userSpecialtyProgress.userId],
      references: [user.id],
    }),
    specialty: one(specialties, {
      fields: [userSpecialtyProgress.specialtyId],
      references: [specialties.id],
    }),
  })
);

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(user, {
    fields: [studySessions.userId],
    references: [user.id],
  }),
  specialty: one(specialties, {
    fields: [studySessions.specialtyId],
    references: [specialties.id],
  }),
}));

export const dailyActivityRelations = relations(dailyActivity, ({ one }) => ({
  user: one(user, {
    fields: [dailyActivity.userId],
    references: [user.id],
  }),
}));

export const userStreaksRelations = relations(userStreaks, ({ one }) => ({
  user: one(user, {
    fields: [userStreaks.userId],
    references: [user.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(user, {
    fields: [bookmarks.userId],
    references: [user.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(user, {
    fields: [userProfiles.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
