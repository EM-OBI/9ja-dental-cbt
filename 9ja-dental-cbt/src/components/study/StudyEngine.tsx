"use client";

import React, { useState } from "react";
import { BookOpen, FileText, Brain, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StudyConfig } from "./StudySetup";

interface StudyEngineProps {
  config: StudyConfig;
  onComplete?: () => void;
}

interface StudyMaterial {
  summary?: string;
  flashcards?: Array<{ front: string; back: string }>;
  quiz?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

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
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState("Initializing");
  const [materials, setMaterials] = useState<StudyMaterial | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "flashcards" | "quiz">(
    "summary"
  );
  const [hasStarted, setHasStarted] = useState(false);

  const pollJobStatus = async (jobId: string): Promise<string | null> => {
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
  };

  const generateMaterials = async () => {
    setIsGenerating(true);
    setError(null);

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

      // Fetch the generated materials
      setCurrentPhase("Loading materials...");
      setProgress(95);

      const materialsResponse = await fetch(
        `/api/study/materials/${resultPackageId}`
      );

      if (!materialsResponse.ok) {
        throw new Error("Failed to fetch materials");
      }

      const materialsData = (await materialsResponse.json()) as {
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
            content: Array<{ front: string; back: string }>;
            generatedAt: string;
            model: string;
          };
          quiz?: {
            id: string;
            type: string;
            content: Array<{
              question: string;
              options: string[];
              correctAnswer: number;
              explanation: string;
            }>;
            generatedAt: string;
            model: string;
          };
        };
      };

      if (!materialsData.success) {
        throw new Error("Materials fetch failed");
      }

      // Transform materials to our format
      const transformedMaterials: StudyMaterial = {
        summary: materialsData.materials.summary?.content,
        flashcards: materialsData.materials.flashcards?.content,
        quiz: materialsData.materials.quiz?.content,
      };

      setMaterials(transformedMaterials);
      setProgress(100);
      setIsGenerating(false);
      setCurrentPhase("Complete!");

      // Set active tab to first available material type
      if (
        config.materialTypes.includes("summary") &&
        transformedMaterials.summary
      ) {
        setActiveTab("summary");
      } else if (
        config.materialTypes.includes("flashcards") &&
        transformedMaterials.flashcards
      ) {
        setActiveTab("flashcards");
      } else if (
        config.materialTypes.includes("quiz") &&
        transformedMaterials.quiz
      ) {
        setActiveTab("quiz");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to generate materials"
      );
      setIsGenerating(false);
    }
  };

  // Auto-start generation on mount without useEffect
  if (!hasStarted && isGenerating) {
    setHasStarted(true);
    generateMaterials();
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-[#1D1D20] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8">
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
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-[#1D1D20] rounded-2xl border border-red-200 dark:border-red-800 shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground mb-2">
              Generation Failed
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
            <Button onClick={generateMaterials} className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-foreground">
                {config.courseName}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {config.specialty}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                AI Generated
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {config.materialTypes.includes("summary") && (
            <button
              onClick={() => setActiveTab("summary")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "summary"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Summary
            </button>
          )}
          {config.materialTypes.includes("flashcards") && (
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "flashcards"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Flashcards
            </button>
          )}
          {config.materialTypes.includes("quiz") && (
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === "quiz"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Brain className="w-4 h-4 inline mr-2" />
              Quiz
            </button>
          )}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-[#1D1D20] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
          {activeTab === "summary" && materials?.summary && (
            <div className="prose dark:prose-invert max-w-none">
              <div
                className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: materials.summary }}
              />
            </div>
          )}

          {activeTab === "flashcards" && materials?.flashcards && (
            <div className="space-y-4">
              {materials.flashcards.map((card, index) => (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                >
                  <div className="font-medium text-slate-900 dark:text-foreground mb-2">
                    {card.front}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {card.back}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "quiz" && materials?.quiz && (
            <div className="space-y-6">
              {materials.quiz.map((question, index) => (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                >
                  <div className="font-medium text-slate-900 dark:text-foreground mb-3">
                    {index + 1}. {question.question}
                  </div>
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg ${
                          optIndex === question.correctAnswer
                            ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                            : "bg-white dark:bg-[#1D1D20]"
                        }`}
                      >
                        <div className="flex items-center">
                          {optIndex === question.correctAnswer && (
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                          )}
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {option}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Explanation:
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {question.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
