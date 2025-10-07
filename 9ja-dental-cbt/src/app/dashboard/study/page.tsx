"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Progress Header */}
      {(loading || status) && (
        <Card className="border-slate-200 dark:border-border bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm font-medium text-slate-900 dark:text-foreground">
                  {status?.message || "Processing..."}
                </span>
              </div>
              <Badge
                variant={
                  status?.status === "COMPLETED" ? "default" : "secondary"
                }
              >
                {status?.status || "PROCESSING"}
              </Badge>
            </div>
            <Progress value={status?.progress || 0} className="h-1.5" />
          </CardContent>
        </Card>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            AI Study Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="topic"
            value={activeTab}
            onValueChange={(value) =>
              updateStudyPageUI({
                activeTab: value as "topic" | "notes" | "pdf",
              })
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="topic">Topic</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="pdf">PDF Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="topic" className="space-y-4">
              <div>
                <Label htmlFor="topic">Study Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Periodontal Disease"
                  value={topicInput}
                  onChange={(e) =>
                    updateStudyPageUI({ topicInput: e.target.value })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div>
                <Label htmlFor="notes">Study Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Paste your study notes here..."
                  rows={6}
                  value={notesInput}
                  onChange={(e) =>
                    updateStudyPageUI({ notesInput: e.target.value })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="pdf" className="space-y-4">
              <div>
                <Label htmlFor="pdf">Upload PDF</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center mb-2">
                  <input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="pdf" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <div className="text-sm text-slate-600">
                      {selectedFile ? selectedFile.name : "Click to upload PDF"}
                    </div>
                  </label>
                </div>
              </div>
            </TabsContent>

            {/* Material Type Selection */}
            <div className="space-y-2">
              <Label>Generate Materials</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { key: "summary", label: "Summary" },
                  { key: "flashcards", label: "Flashcards" },
                  { key: "quiz", label: "Quiz" },
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={
                      materialTypes.includes(key) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => toggleMaterialType(key)}
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
              className="w-full"
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
        </CardContent>
      </Card>

      {/* Recent Study Sessions */}
      {studyHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Study Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studyHistory.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                      <Badge variant="secondary" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        {session.notes.length} notes
                      </Badge>
                    )}
                    <Badge
                      variant={session.isActive ? "default" : "outline"}
                      className="text-xs"
                    >
                      {session.isActive ? "Active" : "Completed"}
                    </Badge>
                  </div>
                </div>
              ))}
              {studyHistory.length > 5 && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-400 pt-2">
                  + {studyHistory.length - 5} more sessions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Materials */}
      {aiGeneratedPackages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-foreground">
            Generated Study Materials
          </h2>
          {aiGeneratedPackages.map((pkg) => (
            <Card key={pkg.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{pkg.topic}</CardTitle>
                  <Badge
                    variant={
                      pkg.status === "completed" ? "default" : "secondary"
                    }
                  >
                    {pkg.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue={
                    pkg.summary
                      ? "summary"
                      : pkg.flashcards
                      ? "flashcards"
                      : "quiz"
                  }
                >
                  <TabsList>
                    {pkg.summary && (
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                    )}
                    {pkg.flashcards && (
                      <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                    )}
                    {pkg.quiz && <TabsTrigger value="quiz">Quiz</TabsTrigger>}
                  </TabsList>

                  {pkg.summary && (
                    <TabsContent value="summary">
                      {renderMaterialContent(pkg.summary)}
                    </TabsContent>
                  )}

                  {pkg.flashcards && (
                    <TabsContent value="flashcards">
                      {renderMaterialContent(pkg.flashcards)}
                    </TabsContent>
                  )}

                  {pkg.quiz && (
                    <TabsContent value="quiz">
                      {renderMaterialContent(pkg.quiz)}
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
