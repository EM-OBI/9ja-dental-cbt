"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StudyConfig } from "./StudySetup";
import {
  StudyMaterialLauncher,
  type StudyMaterialType,
} from "./StudyMaterialLauncher";
import { StudySummaryView } from "./StudySummaryView";
import { StudyFlashcardDeck } from "./StudyFlashcardDeck";
import { StudyQuizPractice } from "./StudyQuizPractice";

interface StudyEngineProps {
  config: StudyConfig;
  onComplete?: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

type RawQuizItem = {
  question?: string;
  options?: unknown;
  correctAnswer?: unknown;
  correctIndex?: unknown;
  answer?: unknown;
  explanation?: unknown;
};

type RawQuizContent =
  | RawQuizItem[]
  | {
    questions?: RawQuizItem[];
    multipleChoice?: RawQuizItem[];
    trueFalse?: RawQuizItem[];
  };

interface StudyMaterial {
  summary?: string;
  flashcards?: Array<{ front: string; back: string; hint?: string }>;
  quiz?: {
    multipleChoice: QuizQuestion[];
    trueFalse: QuizQuestion[];
  };
}

interface StudyProgressState {
  summaryViewed: boolean;
  flashcardsCompleted: boolean;
  quizScore: number | null;
  quizAttempts?: number;
  lastAccessedAt?: string | null;
}

type MaterialsApiResponse = {
  success: boolean;
  package: {
    id: string;
    topic: string;
    createdAt: string;
  };
  materials: {
    summary?: {
      id: string;
      type: string;
      content: string;
      generatedAt: string;
      model: string;
    };
    flashcards?: {
      id: string;
      type: string;
      content: Array<{ front: string; back: string; hint?: string }>;
      generatedAt: string;
      model: string;
    };
    quiz?: {
      id: string;
      type: string;
      content: {
        questions?: Array<{
          question: string;
          options: string[];
          correctAnswer?: number;
          correctIndex?: number;
          answer?: number | string | boolean;
          explanation?: string;
        }>;
        multipleChoice?: Array<{
          question: string;
          options: string[];
          correctAnswer?: number;
          correctIndex?: number;
          answer?: number | string | boolean;
          explanation?: string;
        }>;
        trueFalse?: Array<{
          question: string;
          options?: string[];
          correctAnswer?: number;
          correctIndex?: number;
          answer?: number | string | boolean;
          explanation?: string;
        }>;
      };
      generatedAt: string;
      model: string;
    };
  };
  progress?: {
    summaryViewed: boolean;
    flashcardsCompleted: boolean;
    quizScore: number | null;
    quizAttempts?: number;
    lastAccessedAt?: string | null;
  } | null;
};

type JobState =
  | "PENDING"
  | "UPLOADED"
  | "PARSING"
  | "SUMMARIZING"
  | "GENERATING_FLASHCARDS"
  | "GENERATING_QUIZ"
  | "COMPLETED"
  | "FAILED";

interface JobStatus {
  jobId: string;
  status: JobState;
  progress: number;
  message: string;
  packageId?: string;
  resultId?: string;
  error?: string;
}

export function StudyEngine({ config }: StudyEngineProps) {
  const router = useRouter();
  const isViewMode = config.mode === "view";
  const [isGenerating, setIsGenerating] = useState(!isViewMode);
  const [isLoadingExisting, setIsLoadingExisting] = useState(isViewMode);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("Initializing");
  const [materials, setMaterials] = useState<StudyMaterial | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<StudyMaterialType | null>(null);
  const [packageProgress, setPackageProgress] =
    useState<StudyProgressState | null>(null);
  const [packageDetails, setPackageDetails] = useState<
    MaterialsApiResponse["package"] | null
  >(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [loadedPackageId, setLoadedPackageId] = useState<string | null>(null);

  const formattedCreatedAt = useMemo(() => {
    if (!packageDetails?.createdAt) {
      return null;
    }

    const date = new Date(packageDetails.createdAt);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleDateString();
  }, [packageDetails?.createdAt]);

  const headerTitle =
    packageDetails?.topic || config.courseName || "Study Materials";
  const headerSubtitle =
    config.specialty ||
    (formattedCreatedAt ? `Generated ${formattedCreatedAt}` : "");

  const unpackMaterialsResponse = useCallback((data: MaterialsApiResponse) => {
    const transformedMaterials: StudyMaterial = {
      summary: data.materials.summary?.content,
      flashcards: data.materials.flashcards?.content,
      quiz: normalizeQuizContent(data.materials.quiz?.content),
    };

    const progressState = data.progress
      ? {
        summaryViewed: Boolean(data.progress.summaryViewed),
        flashcardsCompleted: Boolean(data.progress.flashcardsCompleted),
        quizScore:
          typeof data.progress.quizScore === "number"
            ? data.progress.quizScore
            : null,
        quizAttempts: data.progress.quizAttempts,
        lastAccessedAt: data.progress.lastAccessedAt ?? null,
      }
      : null;

    return {
      materials: transformedMaterials,
      progress: progressState,
      details: {
        id: data.package.id,
        topic: data.package.topic,
        createdAt: data.package.createdAt,
      },
    };
  }, []);

  const loadMaterialsById = useCallback(
    async (packageId: string) => {
      setIsLoadingExisting(true);
      setError(null);
      setPackageDetails(null);

      try {
        const response = await fetch(`/api/study/materials/${packageId}`);
        if (!response.ok) {
          throw new Error("Failed to load study materials");
        }

        const payload = (await response.json()) as MaterialsApiResponse;

        if (!payload.success) {
          throw new Error("Study materials unavailable");
        }

        const normalized = unpackMaterialsResponse(payload);
        setMaterials(normalized.materials);
        setPackageProgress(normalized.progress);
        setPackageDetails(normalized.details);
        setIsLoadingExisting(false);
        return normalized;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load study materials";
        setError(message);
        setIsLoadingExisting(false);
        throw err;
      }
    },
    [unpackMaterialsResponse]
  );

  const pollJobStatus = useCallback(
    async (jobId: string): Promise<string | null> => {
      const maxAttempts = 60; // 5 minutes max (5s interval)
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          const response = await fetch(`/api/study/jobs/${jobId}/status`);
          if (!response.ok) {
            throw new Error("Failed to fetch job status");
          }

          const status = (await response.json()) as JobStatus;

          setProgress(status.progress);
          setCurrentPhase(status.message);

          if (status.status === "COMPLETED") {
            return status.packageId || status.resultId || null;
          }

          if (status.status === "FAILED") {
            throw new Error(status.error || "Generation failed");
          }

          // Wait 5 seconds before next poll
          await new Promise((resolve) => setTimeout(resolve, 5000));
          attempts++;
        } catch (err) {
          console.error("Poll error:", err);
          throw err;
        }
      }

      throw new Error("Generation timeout - please try again");
    },
    []
  );

  const generateMaterials = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setPackageDetails(null);
    setMaterials(null);
    setProgress(0);
    setCurrentPhase("Initializing");

    try {
      let jobId: string;
      let resultPackageId: string;

      // Handle PDF upload workflow
      if (config.source === "pdf" && config.file) {
        // Step 1: Initialize upload
        const initResponse = await fetch("/api/study/upload/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: config.fileName,
            topic: config.courseName,
            questionCount: config.materialTypes.includes("quiz") ? 10 : 0,
            flashcardCount: config.materialTypes.includes("flashcards")
              ? 15
              : 0,
          }),
        });

        if (!initResponse.ok) {
          throw new Error("Failed to initialize upload");
        }

        const initData = (await initResponse.json()) as {
          jobId: string;
          documentId: string;
          uploadUrl: string;
          uploadHeaders: Record<string, string>;
        };

        jobId = initData.jobId;
        setCurrentPhase("Uploading PDF...");
        setProgress(10);

        // Step 2: Upload file
        const uploadResponse = await fetch(initData.uploadUrl, {
          method: "PUT",
          headers: initData.uploadHeaders,
          body: config.file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file");
        }

        setCurrentPhase("Processing PDF...");
        setProgress(20);

        // Step 3: Poll for completion
        const pkgId = await pollJobStatus(jobId);
        if (!pkgId) {
          throw new Error("No package ID returned");
        }
        resultPackageId = pkgId;
      } else {
        // Handle topic/notes workflow
        const sourceContent =
          config.source === "topic" || config.source === "notes"
            ? config.content
            : "";

        const generateResponse = await fetch("/api/study/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: config.courseName,
            questionCount: config.materialTypes.includes("quiz") ? 10 : 0,
            flashcardCount: config.materialTypes.includes("flashcards")
              ? 15
              : 0,
            source: {
              type: config.source,
              content: sourceContent,
            },
          }),
        });

        if (!generateResponse.ok) {
          throw new Error("Failed to start generation");
        }

        const generateData = (await generateResponse.json()) as {
          jobId: string;
          id: string;
        };

        jobId = generateData.jobId;
        setCurrentPhase("Starting generation...");
        setProgress(10);

        // Poll for completion
        const pkgId = await pollJobStatus(jobId);
        if (!pkgId) {
          throw new Error("No package ID returned");
        }
        resultPackageId = pkgId;
      }

      // Fetch the generated materials using the shared loader
      setCurrentPhase("Loading materials...");
      setProgress(95);

      await loadMaterialsById(resultPackageId);
      setProgress(100);
      setIsGenerating(false);
      setCurrentPhase("Complete!");

      // Redirect to library after successful generation
      setTimeout(() => {
        router.push("/study/library");
      }, 1500);
    } catch (err) {
      console.error("Generation error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate materials"
      );
      setIsGenerating(false);
    }
  }, [config, loadMaterialsById, pollJobStatus, router]);

  const handleRetry = useCallback(() => {
    if (isViewMode) {
      if (!config.packageId) {
        return;
      }
      setError(null);
      setCurrentPhase("Loading saved materials...");
      setProgress(25);
      setMaterials(null);
      setIsLoadingExisting(true);
      void loadMaterialsById(config.packageId);
    } else {
      void generateMaterials();
    }
  }, [config.packageId, generateMaterials, isViewMode, loadMaterialsById]);

  useEffect(() => {
    if (isViewMode || hasStarted) {
      return;
    }

    setHasStarted(true);
    void generateMaterials();
  }, [generateMaterials, hasStarted, isViewMode]);

  // Auto-start generation on mount without useEffect
  if (!hasStarted && isGenerating) {
    setHasStarted(true);
    generateMaterials();
  }

  useEffect(() => {
    if (!isViewMode) {
      return;
    }

    const targetId = config.packageId;

    if (!targetId) {
      setError("No saved study package was provided");
      setIsLoadingExisting(false);
      return;
    }

    if (loadedPackageId === targetId) {
      return;
    }

    setIsLoadingExisting(true);
    setCurrentPhase("Loading saved materials...");
    setProgress(25);
    setMaterials(null);
    setLoadedPackageId(targetId);

    loadMaterialsById(targetId)
      .then(() => {
        setProgress(100);
        setCurrentPhase("Ready");
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Failed to load study materials";
        setError(message);
      });
  }, [config.packageId, isViewMode, loadMaterialsById, loadedPackageId]);

  useEffect(() => {
    if (!materials) return;

    const options: StudyMaterialType[] = [];
    if (materials.summary && config.materialTypes.includes("summary")) {
      options.push("summary");
    }
    if (
      materials.flashcards?.length &&
      config.materialTypes.includes("flashcards")
    ) {
      options.push("flashcards");
    }
    const hasQuiz =
      (materials.quiz?.multipleChoice.length || 0) +
      (materials.quiz?.trueFalse.length || 0) >
      0;
    if (hasQuiz && config.materialTypes.includes("quiz")) {
      options.push("quiz");
    }

    if (!options.length) {
      setActiveView(null);
      return;
    }

    setActiveView((prev) => prev ?? options[0] ?? null);
  }, [materials, config.materialTypes]);

  const allQuizQuestions = useMemo(() => {
    if (!materials?.quiz) {
      return [] as Array<{
        question: string;
        options: string[];
        correctIndex: number;
        explanation?: string;
      }>;
    }

    return [
      ...(materials.quiz.multipleChoice ?? []),
      ...(materials.quiz.trueFalse ?? []),
    ].map((item) => ({
      question: item.question,
      options: item.options,
      correctIndex: item.correctAnswer,
      explanation: item.explanation,
    }));
  }, [materials?.quiz]);

  if (isViewMode && isLoadingExisting) {
    return (
      <div className="min-h-full bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Brain className="w-8 h-8 text-white dark:text-slate-900" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground mb-2">
                Loading Saved Materials
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {currentPhase}
              </p>
            </div>
            <div className="space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="text-center text-sm font-medium text-slate-900 dark:text-foreground">
                {progress}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="min-h-full bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Brain className="w-8 h-8 text-white dark:text-slate-900" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground mb-2">
                Generating Study Materials
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {currentPhase}
              </p>
            </div>

            <div className="space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="text-center text-sm font-medium text-slate-900 dark:text-foreground">
                {progress}%
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {[
                { label: "Initializing", done: progress >= 10 },
                { label: "Processing content", done: progress >= 30 },
                { label: "Generating materials", done: progress >= 60 },
                { label: "Finalizing", done: progress >= 95 },
              ].map((step, index) => (
                <div key={index} className="flex items-center text-sm">
                  {step.done ? (
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded-full mr-2" />
                  )}
                  <span
                    className={
                      step.done
                        ? "text-slate-900 dark:text-foreground"
                        : "text-slate-500 dark:text-slate-400"
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-card rounded-2xl border border-red-200 dark:border-red-800 shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground mb-2">
              Generation Failed
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
            <Button onClick={handleRetry} className="w-full">
              {isViewMode ? "Retry loading" : "Try Again"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-transparent p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-foreground">
                {headerTitle}
              </h1>
              {headerSubtitle && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {headerSubtitle}
                </p>
              )}
              {packageProgress && (
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    Summary{" "}
                    {packageProgress.summaryViewed ? "viewed" : "not viewed"}
                  </span>
                  <span>
                    Flashcards{" "}
                    {packageProgress.flashcardsCompleted
                      ? "completed"
                      : "pending"}
                  </span>
                  {typeof packageProgress.quizScore === "number" && (
                    <span>Best quiz {packageProgress.quizScore}%</span>
                  )}
                  {typeof packageProgress.quizAttempts === "number" &&
                    packageProgress.quizAttempts > 0 && (
                      <span>
                        {packageProgress.quizAttempts} quiz attempt(s)
                      </span>
                    )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                AI Generated
              </span>
            </div>
          </div>
        </div>

        {materials && (
          <div className="mb-8">
            <StudyMaterialLauncher
              topic={config.courseName}
              available={{
                summary: materials.summary,
                flashcards: materials.flashcards,
                quiz: materials.quiz,
              }}
              onSelect={setActiveView}
            />
          </div>
        )}

        {activeView && (
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border shadow-xl p-6 md:p-8">
            {activeView === "summary" && materials?.summary && (
              <StudySummaryView html={materials.summary} />
            )}

            {activeView === "flashcards" && materials?.flashcards && (
              <StudyFlashcardDeck cards={materials.flashcards} />
            )}

            {activeView === "quiz" && allQuizQuestions.length > 0 && (
              <StudyQuizPractice questions={allQuizQuestions} />
            )}

            {activeView === "quiz" && allQuizQuestions.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Quiz questions are not available for this study package.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeQuizContent(
  content: RawQuizContent | undefined
): StudyMaterial["quiz"] | undefined {
  if (!content) {
    return undefined;
  }

  if (Array.isArray(content)) {
    const multipleChoice = content
      .map((item) => mapRawQuizItem(item))
      .filter((item): item is QuizQuestion => Boolean(item));

    if (!multipleChoice.length) {
      return undefined;
    }

    return {
      multipleChoice,
      trueFalse: [],
    };
  }

  let multipleChoice = Array.isArray(content.multipleChoice)
    ? content.multipleChoice
      .map((item) => mapRawQuizItem(item))
      .filter((item): item is QuizQuestion => Boolean(item))
    : [];

  const trueFalse = Array.isArray(content.trueFalse)
    ? content.trueFalse
      .map((item) => mapRawQuizItem(item, { allowBoolean: true }))
      .filter((item): item is QuizQuestion => Boolean(item))
    : [];

  if (!multipleChoice.length && Array.isArray(content.questions)) {
    multipleChoice = content.questions
      .map((item) => mapRawQuizItem(item))
      .filter((item): item is QuizQuestion => Boolean(item));
  }

  if (!multipleChoice.length && !trueFalse.length) {
    return undefined;
  }

  return {
    multipleChoice,
    trueFalse,
  };
}

function mapRawQuizItem(
  item: RawQuizItem,
  options?: { allowBoolean?: boolean }
): QuizQuestion | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const question =
    typeof item.question === "string" ? item.question.trim() : "";

  let parsedOptions: string[] = Array.isArray(item.options)
    ? item.options.map((opt) => String(opt))
    : [];

  const explanation =
    typeof item.explanation === "string" ? item.explanation : undefined;

  const coerceBooleanOptions = () => {
    if (!parsedOptions.length && options?.allowBoolean) {
      parsedOptions = ["True", "False"];
    }
  };

  let answerIndex = -1;

  if (typeof item.correctAnswer === "number") {
    answerIndex = item.correctAnswer;
  } else if (typeof item.correctIndex === "number") {
    answerIndex = item.correctIndex;
  } else if (typeof item.answer === "number") {
    answerIndex = item.answer;
  } else if (typeof item.correctAnswer === "string") {
    answerIndex = matchOptionIndex(parsedOptions, item.correctAnswer);
  } else if (typeof item.answer === "string") {
    answerIndex = matchOptionIndex(parsedOptions, item.answer);
  } else if (typeof item.answer === "boolean") {
    coerceBooleanOptions();
    const booleanIndex = item.answer
      ? matchOptionIndex(parsedOptions, "true")
      : matchOptionIndex(parsedOptions, "false");
    if (booleanIndex >= 0) {
      answerIndex = booleanIndex;
    } else {
      answerIndex = item.answer ? 0 : Math.min(1, parsedOptions.length - 1);
    }
  }

  coerceBooleanOptions();

  if (!question || !parsedOptions.length) {
    return null;
  }

  if (answerIndex < 0 || answerIndex >= parsedOptions.length) {
    answerIndex = 0;
  }

  return {
    question,
    options: parsedOptions,
    correctAnswer: answerIndex,
    explanation,
  };
}

function matchOptionIndex(options: string[], answer: string) {
  const normalizedAnswer = answer.trim().toLowerCase();
  const directMatch = options.findIndex(
    (option) => option.trim().toLowerCase() === normalizedAnswer
  );

  if (directMatch >= 0) {
    return directMatch;
  }

  const numericValue = Number.parseInt(normalizedAnswer, 10);
  if (!Number.isNaN(numericValue)) {
    const zeroBased = numericValue > 0 ? numericValue - 1 : numericValue;
    if (zeroBased >= 0 && zeroBased < options.length) {
      return zeroBased;
    }
  }

  if (["a", "b", "c", "d", "e"].includes(normalizedAnswer)) {
    const derivedIndex = normalizedAnswer.charCodeAt(0) - "a".charCodeAt(0);
    if (derivedIndex >= 0 && derivedIndex < options.length) {
      return derivedIndex;
    }
  }

  return -1;
}
