"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Upload,
  FileText,
  ChevronRight,
  Check,
  Archive,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface StudySetupProps {
  onStartStudy: (config: StudyConfig) => void;
  isLoading?: boolean;
  specialties?: Array<{
    id: string;
    name: string;
  }>;
}

export type StudySourceType = "topic" | "notes" | "pdf" | "existing";
export type StudyMode = "generate" | "view";

export interface StudyConfig {
  mode: StudyMode;
  packageId?: string;
  courseName: string;
  specialty: string;
  source: StudySourceType;
  content: string;
  fileName?: string;
  file?: File;
  materialTypes: string[];
}

const SPECIALTY_OPTIONS = [
  "Oral Pathology",
  "Periodontology",
  "Endodontics",
  "Orthodontics",
  "Pediatric Dentistry",
  "Prosthodontics",
  "Oral Surgery",
  "General Dentistry",
];

const MATERIAL_TYPES = [
  { key: "summary", label: "Summary", description: "AI-generated class notes" },
  { key: "flashcards", label: "Flashcards", description: "Quick review cards" },
  { key: "quiz", label: "Quiz", description: "Practice questions" },
];

export function StudySetup({
  onStartStudy,
  isLoading = false,
}: StudySetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [courseName, setCourseName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [source, setSource] = useState<StudySourceType>("topic");
  const [topicInput, setTopicInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [materialTypes, setMaterialTypes] = useState<string[]>(["summary"]);

  const steps = [
    "Course Details",
    "Study Material",
    "Material Types",
    "Generate",
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return courseName.trim() !== "" && specialty !== "";
      case 1:
        if (source === "topic") return topicInput.trim() !== "";
        if (source === "notes") return notesInput.trim() !== "";
        if (source === "pdf") return selectedFile !== null;
        return false;
      case 2:
        return materialTypes.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleStartStudy();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartStudy = () => {
    const config: StudyConfig = {
      mode: "generate",
      courseName,
      specialty,
      source,
      content:
        source === "topic" ? topicInput : source === "notes" ? notesInput : "",
      fileName: selectedFile?.name,
      file: selectedFile || undefined,
      materialTypes,
    };
    onStartStudy(config);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === "application/pdf" || file.name.endsWith(".pdf"))
    ) {
      setSelectedFile(file);
    }
  };

  const toggleMaterialType = (type: string) => {
    if (materialTypes.includes(type)) {
      setMaterialTypes(materialTypes.filter((t) => t !== type));
    } else {
      setMaterialTypes([...materialTypes, type]);
    }
  };

  return (
    <div className="min-h-full bg-transparent p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-foreground mb-2">
            Study Setup
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Configure your AI study materials
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-2">
          <div className="flex items-center min-w-max px-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    index <= currentStep
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-colors ${
                      index < currentStep
                        ? "bg-slate-900 dark:bg-slate-300"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-card rounded-xl border border-slate-200 dark:border-border p-6">
          {/* Step 0: Course Details */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-6 text-center">
                Course Details
              </h2>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="courseName"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block"
                  >
                    Course Name
                  </Label>
                  <Input
                    id="courseName"
                    placeholder="e.g., Advanced Periodontal Disease"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="h-10"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="specialty"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block"
                  >
                    Select Specialty
                  </Label>
                  <select
                    id="specialty"
                    title="Select your dental specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-slate-300 dark:border-border rounded-lg bg-white dark:bg-input text-slate-900 dark:text-foreground focus:border-slate-900 dark:focus:border-slate-100 focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10 focus:outline-none transition-all"
                  >
                    <option value="">Choose a specialty...</option>
                    {SPECIALTY_OPTIONS.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Study Material */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-6 text-center">
                Choose Your Input Method
              </h2>

              {/* Source Type Selector */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div
                  onClick={() => setSource("topic")}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    source === "topic"
                      ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                      : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-card"
                  }`}
                >
                  <div className="text-center">
                    <BookOpen className="w-6 h-6 mx-auto mb-3 text-slate-700 dark:text-slate-300" />
                    <div className="text-sm font-medium text-slate-900 dark:text-foreground">
                      Topic
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => setSource("notes")}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    source === "notes"
                      ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                      : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-card"
                  }`}
                >
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-3 text-slate-700 dark:text-slate-300" />
                    <div className="text-sm font-medium text-slate-900 dark:text-foreground">
                      Notes
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => setSource("pdf")}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    source === "pdf"
                      ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                      : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-card"
                  }`}
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-3 text-slate-700 dark:text-slate-300" />
                    <div className="text-sm font-medium text-slate-900 dark:text-foreground">
                      PDF
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Input */}
              <div>
                {source === "topic" && (
                  <div>
                    <Label
                      htmlFor="topic"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block"
                    >
                      Study Topic
                    </Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Gingivitis and Periodontitis"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      className="h-10"
                    />
                  </div>
                )}

                {source === "notes" && (
                  <div>
                    <Label
                      htmlFor="notes"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block"
                    >
                      Study Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Paste your study notes here..."
                      rows={6}
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                )}

                {source === "pdf" && (
                  <div>
                    <Label
                      htmlFor="pdf"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block"
                    >
                      Upload Study Material
                    </Label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors bg-slate-50/50 dark:bg-slate-800/50">
                      <input
                        id="pdf"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="pdf" className="cursor-pointer block">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-white dark:text-slate-900" />
                        </div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {selectedFile
                            ? selectedFile.name
                            : "Click to upload file"}
                        </div>
                        {!selectedFile && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            PDF, DOCX, or TXT files
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Material Types */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-6 text-center">
                Select Material Types
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {MATERIAL_TYPES.map((type) => (
                  <div
                    key={type.key}
                    onClick={() => toggleMaterialType(type.key)}
                    className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                      materialTypes.includes(type.key)
                        ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                        : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-card"
                    }`}
                  >
                    <h3 className="text-base font-semibold text-slate-900 dark:text-foreground mb-2">
                      {type.label}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {type.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review & Generate */}
          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-6">
                Ready to Generate
              </h2>

              {/* Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 mb-8 max-w-md mx-auto border border-slate-200 dark:border-border">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4">
                  Study Package Summary
                </h3>
                <div className="space-y-2.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Course:
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-foreground">
                      {courseName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Specialty:
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-foreground">
                      {specialty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Source:
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-foreground capitalize">
                      {source}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Materials:
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-foreground">
                      {materialTypes.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-border">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            {currentStep < 3 && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-1.5 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-1.5 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" label={null} />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Materials</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* View Saved Packages Button */}
        <div className="mt-6 text-center">
          <Link
            href="/study/saved"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground transition-colors"
          >
            <Archive className="w-4 h-4" />
            <span>Saved Materials</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
