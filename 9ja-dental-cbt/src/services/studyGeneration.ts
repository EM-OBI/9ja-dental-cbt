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

  const coerceArray = (value: unknown): T[] | null => {
    if (Array.isArray(value)) {
      return value as T[];
    }

    if (value && typeof value === "object") {
      const container = value as Record<string, unknown>;
      const possibleKeys = ["questions", "items", "data", "results"];
      for (const key of possibleKeys) {
        const nested = container[key];
        if (Array.isArray(nested)) {
          return nested as T[];
        }
      }
    }

    return null;
  };

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate) as unknown;
      const array = coerceArray(parsed);
      if (array) {
        return array;
      }
    } catch (error) {
      try {
        const repaired = JSON.parse(jsonrepair(candidate)) as unknown;
        const array = coerceArray(repaired);
        if (array) {
          return array;
        }
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

interface NormalizedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface NormalizedFlashcard {
  front: string;
  back: string;
  hint?: string;
}

type RawFlashcard = {
  question?: string;
  prompt?: string;
  front?: string;
  cardFront?: string;
  term?: string;
  concept?: string;
  topic?: string;
  answer?: string;
  response?: string;
  back?: string;
  cardBack?: string;
  definition?: string;
  explanation?: string;
  details?: string;
  summary?: string;
  mnemonic?: string;
  hint?: string;
  keyPoint?: string;
};

type RawQuizQuestion = {
  question?: string;
  prompt?: string;
  stem?: string;
  statement?: string;
  options?: string[];
  choices?: string[];
  answerChoices?: string[];
  correctOption?: number | string;
  correctAnswer?: number | string | string[];
  answer?: number | string | boolean | string[];
  explanation?: string;
  rationale?: string;
  reasoning?: string;
};

const extractQuestionText = (raw: RawQuizQuestion) =>
  (raw.question || raw.prompt || raw.stem || raw.statement || "").trim();

const normalizeOptions = (raw: RawQuizQuestion): string[] => {
  const candidates = [raw.options, raw.choices, raw.answerChoices];
  for (const optionSet of candidates) {
    if (Array.isArray(optionSet) && optionSet.length > 0) {
      return optionSet.map((option) => String(option).trim()).filter(Boolean);
    }
  }
  return [];
};

const interpretCorrectIndex = (
  raw: RawQuizQuestion,
  options: string[]
): number | null => {
  const answerValue = raw.correctAnswer ?? raw.correctOption ?? raw.answer;

  if (typeof answerValue === "number") {
    return Number.isFinite(answerValue) ? answerValue : null;
  }

  if (Array.isArray(answerValue) && answerValue.length > 0) {
    const [first] = answerValue;
    if (typeof first === "number") {
      return Number.isFinite(first) ? first : null;
    }
    if (typeof first === "string") {
      const normalized = first.trim().toLowerCase();
      const index = options.findIndex(
        (option) => option.trim().toLowerCase() === normalized
      );
      return index >= 0 ? index : null;
    }
  }

  if (typeof answerValue === "string") {
    const normalized = answerValue.trim().toLowerCase();
    const numericMatch = normalized.match(/^(?:option\s*)?([a-d]|[0-9]+)/);
    if (numericMatch) {
      const token = numericMatch[1];
      if (/[a-d]/.test(token)) {
        return token.charCodeAt(0) - 97; // a -> 0, b -> 1 ...
      }
      const parsed = Number(token);
      if (!Number.isNaN(parsed)) {
        return parsed - (parsed > 0 && parsed <= options.length ? 1 : 0);
      }
    }

    const optionIndex = options.findIndex(
      (option) => option.trim().toLowerCase() === normalized
    );
    if (optionIndex >= 0) {
      return optionIndex;
    }
  }

  if (typeof answerValue === "boolean") {
    return answerValue ? 0 : 1;
  }

  return null;
};

const normalizeMultipleChoiceQuestions = (
  rawQuestions: RawQuizQuestion[],
  desiredCount: number
): NormalizedQuizQuestion[] => {
  const normalized = rawQuestions
    .map((raw) => {
      const question = extractQuestionText(raw);
      const options = normalizeOptions(raw);
      const explanation = (
        raw.explanation ||
        raw.rationale ||
        raw.reasoning ||
        ""
      ).trim();
      const correctIndex = interpretCorrectIndex(raw, options);

      if (!question || options.length < 2 || correctIndex === null) {
        return null;
      }

      const boundedIndex = Math.max(
        0,
        Math.min(correctIndex, options.length - 1)
      );

      return {
        question,
        options,
        correctAnswer: boundedIndex,
        explanation,
      } satisfies NormalizedQuizQuestion;
    })
    .filter((item): item is NormalizedQuizQuestion => Boolean(item));

  return normalized.slice(0, desiredCount);
};

const normalizeTrueFalseQuestions = (
  rawQuestions: RawQuizQuestion[],
  desiredCount: number
): NormalizedQuizQuestion[] => {
  const normalized = rawQuestions
    .map((raw) => {
      const question = extractQuestionText(raw);
      if (!question) return null;

      const answerValue = raw.answer ?? raw.correctAnswer ?? raw.correctOption;
      let isTrue: boolean | null = null;

      if (typeof answerValue === "boolean") {
        isTrue = answerValue;
      } else if (typeof answerValue === "string") {
        const normalizedAnswer = answerValue.trim().toLowerCase();
        if (["true", "t", "yes"].includes(normalizedAnswer)) {
          isTrue = true;
        } else if (["false", "f", "no"].includes(normalizedAnswer)) {
          isTrue = false;
        }
      }

      if (isTrue === null) return null;

      const explanation = (
        raw.explanation ||
        raw.rationale ||
        raw.reasoning ||
        ""
      ).trim();

      return {
        question,
        options: ["True", "False"],
        correctAnswer: isTrue ? 0 : 1,
        explanation,
      } satisfies NormalizedQuizQuestion;
    })
    .filter((item): item is NormalizedQuizQuestion => Boolean(item));

  return normalized.slice(0, desiredCount);
};

const normalizeFlashcards = (
  rawCards: RawFlashcard[],
  desiredCount: number
): NormalizedFlashcard[] => {
  const normalized = rawCards
    .map((raw) => {
      const frontCandidate =
        raw.question ||
        raw.prompt ||
        raw.front ||
        raw.cardFront ||
        raw.term ||
        raw.concept ||
        raw.topic ||
        "";
      const backCandidate =
        raw.answer ||
        raw.response ||
        raw.back ||
        raw.cardBack ||
        raw.definition ||
        raw.explanation ||
        raw.details ||
        raw.summary ||
        "";
      const hintCandidate = raw.hint || raw.mnemonic || raw.keyPoint || "";

      const front = frontCandidate.trim();
      const back = backCandidate.trim();
      const hint = hintCandidate.trim();

      if (!front || !back) {
        return null;
      }

      const card: NormalizedFlashcard = hint
        ? { front, back, hint }
        : { front, back };

      return card;
    })
    .filter((card): card is NormalizedFlashcard => Boolean(card));

  return normalized.slice(0, desiredCount);
};

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
    ? `You are preparing a full-length study summary for dental students about "${topic}" using the provided source material. Incorporate every major concept, short definitions, clinical applications, communication tips, and exam strategies. Ensure the summary contains:

1. An engaging introduction setting the context.
2. A numbered outline of core sections with <h2> headings and nested <h3> subsections where appropriate.
3. Bulleted key takeaways, clinical pearls, and patient communication notes under each section.
4. A table-style presentation (use semantic HTML such as <table> / <thead> / <tbody>) when listing classification or comparison data.
5. A "Checklist for Revision" section using an ordered list and a concise conclusion summarizing action points.
6. Proper sentence case, medical accuracy, and no truncated thoughts.

Return ONLY valid semantic HTML markup (no code fences) ready for rendering inside a <div>. The content should be at least 600 words long, richly formatted, and free of placeholder text.

Source material (truncate if longer than 12k characters):\n\n${source.content.substring(
        0,
        12000
      )}`
    : `Create a comprehensive, fully formatted HTML study summary for dental students covering "${topic}". Follow these requirements:

1. Begin with an introduction that frames why the topic matters clinically.
2. Provide numbered <h2> sections for pathophysiology, diagnosis, management, patient communication, clinical decision-making, and exam preparation tips.
3. Within each section include bulleted lists, short highlighted definitions, and practical examples in full sentences.
4. Add an evidence or guidelines callout, a risk-factor matrix (use a semantic table), and a revision checklist.
5. Conclude with a succinct recap and suggested next steps.
6. Output must be valid HTML (no Markdown or code fences) and at least 600 words.`;

  console.log("[StudyGen] Summary prompt length:", summaryPrompt.length);

  const summaryResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      {
        role: "system",
        content:
          "You are an expert dental educator. Produce comprehensive, fully formatted HTML summaries using semantic tags (<h2>, <h3>, <p>, <ol>, <ul>, <li>, <strong>, <em>, <table>, <thead>, <tbody>, <tr>, <td>). Ensure content is complete, well structured, and never wrap the HTML in code fences.",
      },
      { role: "user", content: summaryPrompt },
    ],
    max_tokens: 2048,
  });

  console.log("[StudyGen] AI summary response type:", typeof summaryResponse);
  console.log(
    "[StudyGen] AI summary response keys:",
    Object.keys(summaryResponse || {})
  );

  let summaryContent =
    summaryResponse.response || "<p>Summary not available.</p>";

  if (summaryContent.length < 1500) {
    console.log(
      "[StudyGen] Summary under length threshold, requesting expansion"
    );
    const expansionResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
      messages: [
        {
          role: "system",
          content:
            "You are an expert dental educator. Produce comprehensive, fully formatted HTML summaries using semantic tags (<h2>, <h3>, <p>, <ol>, <ul>, <li>, <strong>, <em>, <table>, <thead>, <tbody>, <tr>, <td>). Ensure content is complete, well structured, and never wrap the HTML in code fences.",
        },
        {
          role: "user",
          content: `${summaryPrompt}\n\nThe previous attempt was shorter than required. Expand the content with additional clinically relevant sections, ensuring at least 900 words and no truncation.`,
        },
      ],
      max_tokens: 3072,
    });

    if (expansionResponse.response) {
      summaryContent = expansionResponse.response;
    }
  }

  console.log(
    "[StudyGen] Summary content preview:",
    summaryContent.substring(0, 200)
  );

  const summaryId = nanoid();
  const summaryPath = `study/${userId}/packages/${packageId}/summary-${summaryId}.html`;
  const summaryHash = await computeContentHash(summaryContent);

  console.log("[StudyGen] Uploading summary to R2:", summaryPath);

  await bucket.put(summaryPath, summaryContent, {
    httpMetadata: { contentType: "text/html" },
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

  // Step 3: Generate Flashcards
  console.log("[StudyGen] Generating flashcards, count:", flashcardCount);

  const flashcardTarget = Math.max(10, flashcardCount || 0);

  const flashcardsPrompt = source?.content
    ? `Create ${flashcardTarget} high-yield flashcards for dental students studying "${topic}". Each item must include:
- "front": a prompt, clinical question, or scenario
- "back": a complete answer referencing the rationale
- Optional "hint" value with mnemonic or memory aid

Use the trimmed source below:

${source.content.substring(0, 8000)}

Respond ONLY with valid JSON array matching [{"front": "...", "back": "...", "hint": "..."}] and ensure there are exactly ${flashcardTarget} cards.`
    : `Create ${flashcardTarget} high-yield flashcards for dental students on "${topic}". Each card must include "front" and "back" fields with an optional "hint". Respond ONLY with JSON array matching [{"front": "...", "back": "...", "hint": "..."}] and ensure the array length equals ${flashcardTarget}.`;

  const flashcardsResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      {
        role: "system",
        content:
          "You are an expert dental educator. Respond strictly with valid JSON adhering to the requested flashcard schema.",
      },
      { role: "user", content: flashcardsPrompt },
    ],
  });

  console.log("[StudyGen] Flashcards AI response received");

  const rawFlashcards = parseModelJsonArray<RawFlashcard>(
    flashcardsResponse.response || "[]",
    [],
    "flashcards"
  );

  const flashcards = normalizeFlashcards(rawFlashcards, flashcardTarget);

  console.log(
    `[StudyGen] Normalized flashcards: ${flashcards.length}/${flashcardTarget}`
  );

  const flashcardsId = nanoid();
  const flashcardsPath = `study/${userId}/packages/${packageId}/flashcards-${flashcardsId}.json`;

  await bucket.put(flashcardsPath, JSON.stringify(flashcards), {
    httpMetadata: { contentType: "application/json" },
  });

  await db.insert(studyFlashcards).values({
    id: flashcardsId,
    packageId,
    userId,
    r2Path: flashcardsPath,
    count: flashcards.length,
    model: "llama-3-8b-instruct",
    createdAt: new Date(),
  });

  console.log("[StudyGen] Flashcards created with ID:", flashcardsId);

  await notify({
    status: "GENERATING_QUIZ",
    progress: 85,
    message: "Creating quiz questions...",
  });

  // Step 4: Generate Quiz Pools
  const baseQuizTarget = Math.max(6, questionCount || 12);
  let mcTarget = Math.max(4, Math.ceil(baseQuizTarget * 0.65));
  const tfTarget = Math.max(2, baseQuizTarget - mcTarget);
  if (mcTarget + tfTarget < baseQuizTarget) {
    mcTarget += baseQuizTarget - (mcTarget + tfTarget);
  }

  console.log(
    "[StudyGen] Quiz generation targets:",
    JSON.stringify({ mcTarget, tfTarget, baseQuizTarget })
  );

  const generateMultipleChoiceSet = async () => {
    const maxAttempts = 3;
    let lastSet: NormalizedQuizQuestion[] = [];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const mcPrompt = source?.content
        ? `Create ${mcTarget} high-quality multiple-choice questions for dental students based on the content below about "${topic}". Each item must include:
- A clear question stem in full sentences.
- Four answer options labeled implicitly A-D.
- The zero-indexed correctAnswer pointing to the correct option.
- A concise explanation referencing the source material.

Return ONLY valid JSON in the shape [{"question": "...", "options": ["..."], "correctAnswer": 0, "explanation": "..."}]. Ensure the array length matches ${mcTarget} exactly.

Source (trimmed to 8k chars):

${source.content.substring(0, 8000)}`
        : `Create ${mcTarget} detailed multiple-choice questions for dental students studying "${topic}". For each include a question, exactly four answer options, the zero-indexed correctAnswer value, and a short explanation. Respond ONLY with valid JSON array matching the schema [{"question": "...", "options": ["..."], "correctAnswer": 0, "explanation": "..."}] and ensure there are ${mcTarget} items.`;

      const mcResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
        messages: [
          {
            role: "system",
            content:
              "You are an expert dental educator. Respond strictly with valid JSON adhering to the requested schema.",
          },
          { role: "user", content: mcPrompt },
        ],
      });

      console.log(`[StudyGen] MC quiz response received (attempt ${attempt})`);

      const rawQuestions = parseModelJsonArray<RawQuizQuestion>(
        mcResponse.response || "[]",
        [],
        "quiz-mc"
      );

      const normalized = normalizeMultipleChoiceQuestions(
        rawQuestions,
        mcTarget
      );

      console.log(
        `[StudyGen] Normalized MC questions: ${normalized.length}/${mcTarget}`
      );

      if (normalized.length >= mcTarget) {
        return normalized;
      }

      lastSet = normalized;
    }

    return lastSet;
  };

  const generateTrueFalseSet = async () => {
    const maxAttempts = 2;
    let lastSet: NormalizedQuizQuestion[] = [];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const tfPrompt = source?.content
        ? `Generate ${tfTarget} clinically accurate true/false statements for dental students covering "${topic}" based on the content below. Each item must include:
- A full-sentence statement under the key "question".
- A boolean "answer" value indicating if the statement is true.
- A short "explanation" referencing the rationale.

Respond ONLY with valid JSON array in the schema [{"question": "...", "answer": true, "explanation": "..."}] and ensure exactly ${tfTarget} items.

Source (trimmed to 8k chars):

${source.content.substring(0, 8000)}`
        : `Generate ${tfTarget} true/false questions for dental students on "${topic}". Each object should have "question", boolean "answer", and an "explanation". Respond ONLY with a JSON array containing exactly ${tfTarget} items.`;

      const tfResponse = await ai.run("@cf/meta/llama-3-8b-instruct", {
        messages: [
          {
            role: "system",
            content:
              "You are an expert dental educator. Respond strictly with valid JSON adhering to the requested schema.",
          },
          { role: "user", content: tfPrompt },
        ],
      });

      console.log(
        `[StudyGen] True/False response received (attempt ${attempt})`
      );

      const rawQuestions = parseModelJsonArray<RawQuizQuestion>(
        tfResponse.response || "[]",
        [],
        "quiz-tf"
      );

      const normalized = normalizeTrueFalseQuestions(rawQuestions, tfTarget);

      console.log(
        `[StudyGen] Normalized TF questions: ${normalized.length}/${tfTarget}`
      );

      if (normalized.length >= Math.min(tfTarget, baseQuizTarget)) {
        return normalized;
      }

      lastSet = normalized;
    }

    return lastSet;
  };

  const [multipleChoiceQuestions, trueFalseQuestions] = await Promise.all([
    generateMultipleChoiceSet(),
    generateTrueFalseSet(),
  ]);

  console.log(
    `[StudyGen] Final quiz pools -> MC: ${multipleChoiceQuestions.length}, TF: ${trueFalseQuestions.length}`
  );

  const quizId = nanoid();
  const quizPath = `study/${userId}/packages/${packageId}/quiz-${quizId}.json`;

  await bucket.put(
    quizPath,
    JSON.stringify({
      questions: multipleChoiceQuestions,
      multipleChoice: multipleChoiceQuestions,
      trueFalse: trueFalseQuestions,
    }),
    {
      httpMetadata: { contentType: "application/json" },
    }
  );

  await db.insert(studyQuizzes).values({
    id: quizId,
    packageId,
    userId,
    r2Path: quizPath,
    numQuestions: multipleChoiceQuestions.length + trueFalseQuestions.length,
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
