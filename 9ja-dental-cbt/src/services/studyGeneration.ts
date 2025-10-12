import { nanoid } from "nanoid";
import { jsonrepair } from "jsonrepair";
import { eq } from "drizzle-orm";
import type { JobStatusPayload } from "@/types/studyJob";
import type { getDb } from "@/db";
import {
  studyPackages,
  studySummaries,
  studyFlashcards,
  studyQuizzes,
  studyProgress,
} from "@/db/schema";

export interface GenerateStudyParams {
  env: Cloudflare.Env;
  db: Awaited<ReturnType<typeof getDb>>;
  userId: string;
  topic: string;
  topicSlug: string;
  questionCount: number;
  flashcardCount: number;
  source?: { type: string; content?: string; path?: string };
}

export type StatusReporter = (update: JobStatusPayload) => Promise<void> | void;

const sanitizeModelJson = (raw: string) => {
  let cleaned = raw.trim();

  cleaned = cleaned.replace(/```json|```/gi, "");
  cleaned = cleaned.replace(/\u00A0/g, " ");
  cleaned = cleaned.replace(/[""]/g, '"');
  cleaned = cleaned.replace(/['']/g, "'");

  // Replace single-quoted keys and string literals with double quotes
  cleaned = cleaned.replace(/'([\w-]+)'\s*:/g, '"$1":');
  cleaned = cleaned.replace(/:'([^']*)'/g, ':"$1"');

  // Ensure property names are followed by a colon
  cleaned = cleaned.replace(
    /"([\w-]+)"\s*(\{|\[|"|'|-?\d)/g,
    (_match, key, following) => {
      return `"${key}": ${following}`;
    }
  );

  // Collapse repeated whitespace
  cleaned = cleaned.replace(/\s+/g, (segment) => {
    return segment.includes("\n") ? "\n" : " ";
  });

  cleaned = cleaned.replace(/,\s*([\]\}])/g, "$1");

  return cleaned;
};

function parseModelJsonArray<T>(
  raw: string,
  fallback: T[],
  label: string
): T[] {
  const candidates: string[] = [];
  const trimmed = raw.trim();
  const match = trimmed.match(/\[[\s\S]*\]/);
  const extracted = match ? match[0] : trimmed;

  const sanitized = sanitizeModelJson(extracted);
  const normalizedQuotes = sanitized.replace(/'/g, '"');

  candidates.push(extracted, sanitized, normalizedQuotes);

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate) as T[];
    } catch (error) {
      try {
        return JSON.parse(jsonrepair(candidate)) as T[];
      } catch (repairError) {
        console.warn(`Model JSON parse attempt failed for ${label}`, {
          length: candidate.length,
          error,
          repairError,
        });
        console.warn(`[${label} preview] ${candidate.slice(0, 320)}`);
      }
    }
  }

  return fallback;
}

async function computeContentHash(content: string) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(content);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(digest));
  const base64 = btoa(String.fromCharCode(...hashArray));
  return base64;
}

export async function generateStudyMaterials(
  {
    env,
    db,
    userId,
    topic,
    topicSlug,
    questionCount,
    flashcardCount,
    source,
  }: GenerateStudyParams,
  reportStatus?: StatusReporter
) {
  if (!env.AI) {
    throw new Error("AI binding not available");
  }
  if (!env.MY_BUCKET) {
    throw new Error("MY_BUCKET binding not available");
  }

  const ai = env.AI;
  const bucket = env.MY_BUCKET;

  const notify = async (update: JobStatusPayload) => {
    if (reportStatus) {
      await reportStatus(update);
    }
  };

  // Step 1: Create the main package
  const packageId = nanoid();
  console.log("[StudyGen] Creating package:", packageId, "for topic:", topic);

  await db.insert(studyPackages).values({
    id: packageId,
    userId,
    topic,
    topicSlug,
    sourceType: source?.type || "ai",
    sourcePath: source?.path || null,
    status: "generating",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await notify({
    status: "SUMMARIZING",
    progress: 45,
    message: "Generating summary with Workers AI...",
  });

  console.log("[StudyGen] Generating summary for topic:", topic);

  // Step 2: Generate Summary
  const summaryPrompt = source?.content
    ? `Provide a comprehensive summary of the following content about "${topic}":\n\n${source.content.substring(
        0,
        10000
      )}`
    : `Provide a comprehensive summary suitable for dental students studying "${topic}". Include key concepts, definitions, and important facts.`;

  console.log("[StudyGen] Summary prompt length:", summaryPrompt.length);

  const summaryResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      { role: "system", content: "You are an expert dental educator." },
      { role: "user", content: summaryPrompt },
    ],
  });

  console.log("[StudyGen] AI summary response type:", typeof summaryResponse);
  console.log(
    "[StudyGen] AI summary response keys:",
    Object.keys(summaryResponse || {})
  );

  const summaryContent = summaryResponse.response || "Summary not available.";

  console.log("[StudyGen] Summary content:", summaryContent.substring(0, 200));

  const summaryId = nanoid();
  const summaryPath = `study/${userId}/packages/${packageId}/summary-${summaryId}.md`;
  const summaryHash = await computeContentHash(summaryContent);

  console.log("[StudyGen] Uploading summary to R2:", summaryPath);

  await bucket.put(summaryPath, summaryContent, {
    httpMetadata: { contentType: "text/markdown" },
  });

  await db.insert(studySummaries).values({
    id: summaryId,
    packageId,
    userId,
    r2Path: summaryPath,
    model: "llama-3-8b-instruct",
    contentHash: summaryHash,
    createdAt: new Date(),
  });

  console.log("[StudyGen] Summary created with ID:", summaryId);

  await notify({
    status: "GENERATING_FLASHCARDS",
    progress: 65,
    message: "Creating flashcards from summary...",
  });

  // Step 3: Generate Flashcards
  console.log("[StudyGen] Generating flashcards, count:", flashcardCount);

  const flashcardsPrompt = source?.content
    ? `Generate exactly ${flashcardCount} flashcards for dental students based on the following content about "${topic}":\n\n${source.content.substring(
        0,
        8000
      )}\n\nFormat as JSON array: [{"question": "...", "answer": "...", "topic": "${topic}"}]\nFocus on key terms, definitions, and important concepts from the provided content.`
    : `Generate exactly ${flashcardCount} flashcards for dental students studying "${topic}". \nFormat as JSON array: [{"question": "...", "answer": "...", "topic": "${topic}"}]\nFocus on key terms, definitions, and important concepts.`;

  const flashcardsResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      {
        role: "system",
        content:
          "You are an expert dental educator. Respond only with valid JSON.",
      },
      { role: "user", content: flashcardsPrompt },
    ],
  });

  console.log("[StudyGen] Flashcards AI response received");

  const flashcardsData = parseModelJsonArray(
    flashcardsResponse.response || "[]",
    [] as Array<{ question: string; answer: string; topic?: string }>,
    "flashcards"
  ).map((card) => ({
    ...card,
    topic: card.topic ?? topic,
  }));

  console.log("[StudyGen] Parsed flashcards count:", flashcardsData.length);

  const flashcardsId = nanoid();
  const flashcardsPath = `study/${userId}/packages/${packageId}/flashcards-${flashcardsId}.json`;

  await bucket.put(flashcardsPath, JSON.stringify(flashcardsData), {
    httpMetadata: { contentType: "application/json" },
  });

  await db.insert(studyFlashcards).values({
    id: flashcardsId,
    packageId,
    userId,
    r2Path: flashcardsPath,
    count: flashcardsData.length,
    model: "llama-3-8b-instruct",
    createdAt: new Date(),
  });

  console.log("[StudyGen] Flashcards created with ID:", flashcardsId);

  await notify({
    status: "GENERATING_QUIZ",
    progress: 85,
    message: "Creating quiz questions...",
  });

  // Step 4: Generate Quiz
  console.log("[StudyGen] Generating quiz, count:", questionCount);

  const quizPrompt = source?.content
    ? `Generate exactly ${questionCount} multiple-choice quiz questions for dental students based on the following content about "${topic}":\n\n${source.content.substring(
        0,
        8000
      )}\n\nFormat as JSON array: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]`
    : `Generate exactly ${questionCount} multiple-choice quiz questions for dental students studying "${topic}".\nFormat as JSON array: [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]`;

  const quizResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      {
        role: "system",
        content:
          "You are an expert dental educator. Respond only with valid JSON.",
      },
      { role: "user", content: quizPrompt },
    ],
  });

  console.log("[StudyGen] Quiz AI response received");

  const quizData = parseModelJsonArray(
    quizResponse.response || "[]",
    [] as Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }>,
    "quiz"
  );

  console.log("[StudyGen] Parsed quiz questions count:", quizData.length);

  const quizId = nanoid();
  const quizPath = `study/${userId}/packages/${packageId}/quiz-${quizId}.json`;

  await bucket.put(quizPath, JSON.stringify({ questions: quizData }), {
    httpMetadata: { contentType: "application/json" },
  });

  await db.insert(studyQuizzes).values({
    id: quizId,
    packageId,
    userId,
    r2Path: quizPath,
    numQuestions: quizData.length,
    model: "llama-3-8b-instruct",
    createdAt: new Date(),
  });

  console.log("[StudyGen] Quiz created with ID:", quizId);

  // Step 5: Update package status and create progress tracker
  await db
    .update(studyPackages)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(studyPackages.id, packageId));

  await db.insert(studyProgress).values({
    id: nanoid(),
    packageId,
    userId,
    summaryViewed: false,
    flashcardsCompleted: false,
    quizScore: null,
    quizAttempts: 0,
    lastAccessedAt: null,
    updatedAt: new Date(),
  });

  await notify({
    status: "COMPLETED",
    progress: 100,
    message: "Study materials generated successfully!",
    resultId: packageId,
  });

  console.log("[StudyGen] Package generation complete:", packageId);

  return {
    packageId,
    summaryId,
    flashcardsId,
    quizId,
  };
}
