"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Upload, Clock, BookOpen, FileText } from "lucide-react";
import { useStudyUpload } from "@/hooks/useStudyUpload";
import { useStudyStore } from "@/store/studyStore";
import type { AIGeneratedContent } from "@/store/types";

// Local types for API responses
interface FlashcardContent {
  cards: Array<{
    question: string;
    answer: string;
  }>;
}

interface QuizContent {
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
}

export default function StudyPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  // Use Zustand store for AI packages, UI state, and study history
  const {
    aiGeneratedPackages,
    addAIPackage,
    updateAIPackage,
    studyPageUI,
    updateStudyPageUI,
    studyHistory,
  } = useStudyStore();

  // Load study sessions on mount (data already loaded by layout)
  useEffect(() => {
    console.log(
      "[StudyPage] Study history loaded:",
      studyHistory.length,
      "sessions"
    );
  }, [studyHistory]);

  // Destructure UI state for easier access
  const { activeTab, topicInput, notesInput, materialTypes } = studyPageUI;

  const { startUpload, status, loading, error } = useStudyUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      if (activeTab === "pdf" && selectedFile) {
        // Create package in store before upload
        addAIPackage({
          topic: selectedFile.name.replace(".pdf", ""),
          source: "pdf",
          fileName: selectedFile.name,
          status: "generating",
          progress: 0,
        });

        await startUpload({
          file: selectedFile,
          materialTypes,
        });

        // Update will happen via updateJobStatus when upload completes
      } else {
        const input = activeTab === "topic" ? topicInput : notesInput;
        if (!input.trim()) return;

        // Create package in store
        const packageId = addAIPackage({
          topic: input.trim(),
          source: activeTab as "topic" | "notes",
          sourceContent: input.trim(),
          status: "generating",
          progress: 0,
        });

        const response = await fetch("/api/study/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: input.trim(),
            inputType: activeTab,
            materialTypes,
          }),
        });

        if (!response.ok) throw new Error("Generation failed");

        const data = (await response.json()) as {
          packageId: string;
          summary: string;
          flashcards: FlashcardContent;
          quiz: QuizContent;
        };

        // Update package with generated content
        const updates: Partial<(typeof aiGeneratedPackages)[0]> = {
          status: "completed" as const,
          progress: 100,
        };

        if (materialTypes.includes("summary")) {
          updates.summary = {
            id: `${data.packageId}-summary`,
            type: "summary",
            content: data.summary,
            generatedAt: new Date().toISOString(),
            model: "llama-3-8b-instruct",
          };
        }

        if (materialTypes.includes("flashcards")) {
          updates.flashcards = {
            id: `${data.packageId}-flashcards`,
            type: "flashcards",
            content: data.flashcards,
            generatedAt: new Date().toISOString(),
            model: "llama-3-8b-instruct",
          };
        }

        if (materialTypes.includes("quiz")) {
          updates.quiz = {
            id: `${data.packageId}-quiz`,
            type: "quiz",
            content: data.quiz,
            generatedAt: new Date().toISOString(),
            model: "llama-3-8b-instruct",
          };
        }

        updateAIPackage(packageId, updates);

        // Optionally clear inputs after successful generation
        // Uncomment if you want to reset form after each generation
        // updateStudyPageUI({ topicInput: "", notesInput: "" });
      }
    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const toggleMaterialType = (type: string) => {
    const newMaterialTypes = materialTypes.includes(type)
      ? materialTypes.filter((t) => t !== type)
      : [...materialTypes, type];
    updateStudyPageUI({ materialTypes: newMaterialTypes });
  };

  const renderMaterialContent = (material: AIGeneratedContent) => {
    switch (material.type) {
      case "summary":
        return (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                typeof material.content === "string" ? material.content : "",
            }}
          />
        );

      case "flashcards":
        return (
          <div className="grid gap-3">
            {typeof material.content !== "string" &&
              "cards" in material.content &&
              material.content.cards?.map((card, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card"
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-foreground mb-2">
                    {card.question}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {card.answer}
                  </div>
                </div>
              ))}
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-4">
            {typeof material.content !== "string" &&
              "questions" in material.content &&
              material.content.questions?.map((q, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card"
                >
                  <div className="text-sm font-medium text-slate-900 dark:text-foreground mb-3">
                    {q.question}
                  </div>
                  <div className="grid gap-2 text-sm">
                    {q.options?.map((option: string, i: number) => (
                      <div
                        key={i}
                        className={`p-2 rounded border ${
                          i === q.correctIndex
                            ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800 font-medium"
                            : "border-slate-200 dark:border-border bg-slate-50 dark:bg-slate-800/50"
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-border text-sm text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-foreground">
                        Explanation:
                      </strong>{" "}
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            AI Study Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Generate personalized study materials with AI
          </p>
        </div>

        {/* Upload Progress Header */}
        {(loading || status) && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-950 flex items-center justify-center">
                    <LoadingSpinner size="sm" className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-foreground">
                    {status?.message || "Processing..."}
                  </span>
                </div>
                <Badge
                  className={
                    status?.status === "COMPLETED"
                      ? "bg-green-500 text-white border-0"
                      : "bg-gray-950 text-white border-0"
                  }
                >
                  {status?.status || "PROCESSING"}
                </Badge>
              </div>
              <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gray-950 transition-all duration-300 rounded-full"
                  style={{ width: `${status?.progress || 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <ErrorAlert
            message={error}
            severity="error"
            onDismiss={() => {
              // Error will be cleared when user tries again
            }}
          />
        )}

        {/* Generation Interface */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              Create Study Materials
            </h2>
          </div>
          <div className="p-6">
            <Tabs
              defaultValue="topic"
              value={activeTab}
              onValueChange={(value) =>
                updateStudyPageUI({
                  activeTab: value as "topic" | "notes" | "pdf",
                })
              }
            >
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <TabsTrigger
                  value="topic"
                  className="data-[state=active]:bg-gray-950 data-[state=active]:text-white rounded-lg"
                >
                  Topic
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="data-[state=active]:bg-gray-950 data-[state=active]:text-white rounded-lg"
                >
                  Notes
                </TabsTrigger>
                <TabsTrigger
                  value="pdf"
                  className="data-[state=active]:bg-gray-950 data-[state=active]:text-white rounded-lg"
                >
                  PDF
                </TabsTrigger>
              </TabsList>

              <TabsContent value="topic" className="space-y-4 mt-6">
                <div>
                  <Label
                    htmlFor="topic"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Study Topic
                  </Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Periodontal Disease"
                    value={topicInput}
                    onChange={(e) =>
                      updateStudyPageUI({ topicInput: e.target.value })
                    }
                    className="mt-2 border-slate-300 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20"
                  />
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 mt-6">
                <div>
                  <Label
                    htmlFor="notes"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Study Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Paste your study notes here..."
                    rows={6}
                    value={notesInput}
                    onChange={(e) =>
                      updateStudyPageUI({ notesInput: e.target.value })
                    }
                    className="mt-2 border-slate-300 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20"
                  />
                </div>
              </TabsContent>

              <TabsContent value="pdf" className="space-y-4 mt-6">
                <div>
                  <Label
                    htmlFor="pdf"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Upload PDF
                  </Label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors bg-orange-50/30 dark:bg-orange-950/10">
                    <input
                      id="pdf"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="pdf" className="cursor-pointer">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-950 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {selectedFile
                          ? selectedFile.name
                          : "Click to upload PDF"}
                      </div>
                      {!selectedFile && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          PDF files only
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </TabsContent>

              {/* Material Type Selection */}
              <div className="space-y-3 mt-6">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Generate Materials
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      key: "summary",
                      label: "Summary",
                    },
                    {
                      key: "flashcards",
                      label: "Flashcards",
                    },
                    {
                      key: "quiz",
                      label: "Quiz",
                    },
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      variant={
                        materialTypes.includes(key) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => toggleMaterialType(key)}
                      className={
                        materialTypes.includes(key)
                          ? "bg-gray-950 text-white border-0 hover:bg-gray-500"
                          : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
                      }
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={
                  generating ||
                  loading ||
                  (activeTab === "topic" && !topicInput.trim()) ||
                  (activeTab === "notes" && !notesInput.trim()) ||
                  (activeTab === "pdf" && !selectedFile) ||
                  materialTypes.length === 0
                }
                className="w-full mt-6 bg-gray-950 hover:bg-gray-500 text-white border-0 shadow-lg h-11"
              >
                {generating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Study Materials"
                )}
              </Button>
            </Tabs>
          </div>
        </div>

        {/* Recent Study Sessions */}
        {studyHistory.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-900 dark:text-foreground flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-950 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                Recent Study Sessions
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {studyHistory.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-950 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                          {session.materialId || "Study Session"}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {new Date(session.startTime).toLocaleDateString()} •{" "}
                          {Math.floor(session.duration / 60)} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.notes.length > 0 && (
                        <Badge className="text-xs bg-gray-950 text-white border-0">
                          <FileText className="w-3 h-3 mr-1" />
                          {session.notes.length} notes
                        </Badge>
                      )}
                      <Badge
                        className={
                          session.isActive
                            ? "text-xs bg-green-500 text-white border-0"
                            : "text-xs border-slate-300 dark:border-slate-600"
                        }
                      >
                        {session.isActive ? "Active" : "Completed"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {studyHistory.length > 5 && (
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-3">
                    + {studyHistory.length - 5} more sessions
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generated Materials */}
        {aiGeneratedPackages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-950 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Generated Study Materials
            </h2>
            {aiGeneratedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden"
              >
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-foreground">
                      {pkg.topic}
                    </h3>
                    <Badge
                      className={
                        pkg.status === "completed"
                          ? "bg-green-500 text-white border-0"
                          : "bg-gray-950 text-white border-0"
                      }
                    >
                      {pkg.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <Tabs
                    defaultValue={
                      pkg.summary
                        ? "summary"
                        : pkg.flashcards
                        ? "flashcards"
                        : "quiz"
                    }
                  >
                    <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {pkg.summary && (
                        <TabsTrigger
                          value="summary"
                          className="data-[state=active]:bg-gray-950 data-[state=active]:text-white rounded-lg"
                        >
                          Summary
                        </TabsTrigger>
                      )}
                      {pkg.flashcards && (
                        <TabsTrigger
                          value="flashcards"
                          className="data-[state=active]:bg-gray-950 data-[state=active]:text-white rounded-lg"
                        >
                          Flashcards
                        </TabsTrigger>
                      )}
                      {pkg.quiz && (
                        <TabsTrigger
                          value="quiz"
                          className="data-[state=active]:bg-gray-950 data-[state=active]:text-white rounded-lg"
                        >
                          Quiz
                        </TabsTrigger>
                      )}
                    </TabsList>

                    {pkg.summary && (
                      <TabsContent value="summary" className="mt-4">
                        {renderMaterialContent(pkg.summary)}
                      </TabsContent>
                    )}

                    {pkg.flashcards && (
                      <TabsContent value="flashcards" className="mt-4">
                        {renderMaterialContent(pkg.flashcards)}
                      </TabsContent>
                    )}

                    {pkg.quiz && (
                      <TabsContent value="quiz" className="mt-4">
                        {renderMaterialContent(pkg.quiz)}
                      </TabsContent>
                    )}
                  </Tabs>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
