"use client";

import React, { useState } from "react";
import { BookOpen, Upload, FileText, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export interface StudyConfig {
  courseName: string;
  specialty: string;
  source: "topic" | "notes" | "pdf";
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
  const [source, setSource] = useState<"topic" | "notes" | "pdf">("topic");
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
    <div className="min-h-screen bg-transparent p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-foreground mb-2">
            AI Study Assistant
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generate personalized study materials with AI
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

        {/* Step Content Card */}
        <div className="bg-white dark:bg-[#1D1D20] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden mb-6">
          <div className="p-6 md:p-8">
            {/* Step 0: Course Details */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white dark:text-slate-900" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground">
                    Course Details
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Tell us about your study topic
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="courseName"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Course Name
                    </Label>
                    <Input
                      id="courseName"
                      placeholder="e.g., Advanced Periodontal Disease"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="specialty"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Select Specialty
                    </Label>
                    <select
                      id="specialty"
                      title="Select your dental specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="mt-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-foreground focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 focus:outline-none"
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
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-white dark:text-slate-900" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground">
                    Study Material
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Choose your input method
                  </p>
                </div>

                {/* Source Type Selector */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button
                    onClick={() => setSource("topic")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      source === "topic"
                        ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <div className="text-center">
                      <BookOpen className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Topic</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSource("notes")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      source === "notes"
                        ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <div className="text-center">
                      <FileText className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">Notes</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSource("pdf")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      source === "pdf"
                        ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">PDF</div>
                    </div>
                  </button>
                </div>

                {/* Content Input */}
                {source === "topic" && (
                  <div>
                    <Label
                      htmlFor="topic"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Study Topic
                    </Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Gingivitis and Periodontitis"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                {source === "notes" && (
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
                      onChange={(e) => setNotesInput(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}

                {source === "pdf" && (
                  <div>
                    <Label
                      htmlFor="pdf"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Upload Study Material
                    </Label>
                    <div className="mt-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors bg-orange-50/30 dark:bg-orange-950/10">
                      <input
                        id="pdf"
                        type="file"
                        accept=".pdf,.docx,.txt"
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
            )}

            {/* Step 2: Material Types */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-white dark:text-slate-900" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground">
                    Material Types
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    What would you like to generate?
                  </p>
                </div>

                <div className="grid gap-4">
                  {MATERIAL_TYPES.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => toggleMaterialType(type.key)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        materialTypes.includes(type.key)
                          ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-foreground">
                            {type.label}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {type.description}
                          </div>
                        </div>
                        {materialTypes.includes(type.key) && (
                          <Check className="w-5 h-5 text-slate-900 dark:text-slate-100" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Review & Generate */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white dark:text-slate-900" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground">
                    Ready to Generate
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Review your configuration
                  </p>
                </div>

                <div className="space-y-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
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
            )}
          </div>

          {/* Navigation */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || isLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                className="flex-1 bg-slate-900 hover:bg-slate-700 text-white"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  <>
                    Generate Materials
                    <Check className="ml-2 w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
