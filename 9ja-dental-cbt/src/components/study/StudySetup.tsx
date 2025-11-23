"use client";

import React, { useState } from "react";
import {
  Upload,
  FileText,
  Check,
  Lightbulb,
  GraduationCap,
  Sparkles,
  FileUp,
  Album,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  { key: "summary", label: "Summary", description: "AI-generated class notes", icon: FileText },
  { key: "flashcards", label: "Flashcards", description: "Quick review cards", icon: Album },
  { key: "quiz", label: "Quiz", description: "Practice questions", icon: Lightbulb },
];

const SOURCE_TYPES = [
  { key: "topic", label: "Topic", description: "Enter a subject to study", icon: Lightbulb },
  { key: "notes", label: "Notes", description: "Paste your study notes", icon: FileText },
  { key: "pdf", label: "PDF", description: "Upload a document", icon: FileUp },
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const steps = [
    { title: "Course", subtitle: "What are you studying?" },
    { title: "Source", subtitle: "What's your learning source?" },
    { title: "Materials", subtitle: "How do you want to learn?" },
    { title: "Review", subtitle: "Ready to generate?" },
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
      setIsUploading(true);
      setUploadProgress(0);
      setSelectedFile(file);

      // Simulate upload progress (since file is selected locally, not uploaded yet)
      // In a real upload scenario, you'd track actual upload progress via XMLHttpRequest or fetch
      const fileSize = file.size;
      const chunkSize = Math.max(fileSize / 100, 1024 * 10); // At least 10KB per step
      let loaded = 0;

      const progressInterval = setInterval(() => {
        loaded += chunkSize;
        const progress = Math.min((loaded / fileSize) * 100, 100);
        setUploadProgress(progress);

        if (progress >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
        }
      }, 50); // Update every 50ms for smooth animation
    }
  };

  const toggleMaterialType = (type: string) => {
    if (materialTypes.includes(type)) {
      setMaterialTypes(materialTypes.filter((t) => t !== type));
    } else {
      setMaterialTypes([...materialTypes, type]);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-slate-900 dark:bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-10">
          <motion.h1
            key={steps[currentStep].title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2"
          >
            {steps[currentStep].subtitle}
          </motion.h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure your study materials to match your learning style
          </p>
        </div>

        {/* Main Content */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* Step 0: Course Details */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Course Name Input */}
                <div className="max-w-md mx-auto">
                  <Label htmlFor="courseName" className="text-base font-medium mb-2 block">
                    Course Name
                  </Label>
                  <Input
                    id="courseName"
                    type="text"
                    placeholder="e.g., Dental Anatomy"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="h-12 text-base border-2"
                    autoFocus
                  />
                </div>

                {/* Specialty Selection */}
                <div>
                  <Label className="text-base font-medium mb-4 block text-center">
                    Select Specialty
                  </Label>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
                    {SPECIALTY_OPTIONS.map((spec) => (
                      <div
                        key={spec}
                        onClick={() => setSpecialty(spec)}
                        className={cn(
                          "group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
                          specialty === spec
                            ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-900/50 shadow-lg"
                            : "border-gray-200 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-sm font-medium transition-colors",
                            specialty === spec
                              ? "text-slate-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          )}>
                            {spec}
                          </span>
                          {specialty === spec && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white dark:text-slate-900" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Study Source */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Source Type Selection */}
                <div className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
                  {SOURCE_TYPES.map((sourceType) => {
                    const Icon = sourceType.icon;
                    return (
                      <div
                        key={sourceType.key}
                        onClick={() => setSource(sourceType.key as StudySourceType)}
                        className={cn(
                          "group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden",
                          source === sourceType.key
                            ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-900/50 shadow-lg"
                            : "border-gray-200 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50"
                        )}
                      >
                        <div className="relative z-10">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                            source === sourceType.key
                              ? "bg-slate-900 dark:bg-white"
                              : "bg-gray-100 dark:bg-gray-700"
                          )}>
                            <Icon className={cn(
                              "w-6 h-6 transition-colors",
                              source === sourceType.key
                                ? "text-white dark:text-slate-900"
                                : "text-gray-600 dark:text-gray-300"
                            )} />
                          </div>
                          <h3 className={cn(
                            "text-lg font-semibold mb-1 transition-colors",
                            source === sourceType.key
                              ? "text-slate-900 dark:text-white"
                              : "text-gray-900 dark:text-gray-100"
                          )}>
                            {sourceType.label}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {sourceType.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Source Input */}
                <motion.div
                  key={source}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto mt-8"
                >
                  {source === "topic" && (
                    <div>
                      <Label htmlFor="topic" className="text-base font-medium mb-2 block">
                        Study Topic
                      </Label>
                      <Input
                        id="topic"
                        type="text"
                        placeholder="e.g., Teeth anatomy and classification"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        className="h-12 text-base border-2"
                        autoFocus
                      />
                    </div>
                  )}

                  {source === "notes" && (
                    <div>
                      <Label htmlFor="notes" className="text-base font-medium mb-2 block">
                        Your Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Paste your study notes here..."
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        className="min-h-[200px] text-base border-2"
                        autoFocus
                      />
                    </div>
                  )}

                  {source === "pdf" && (
                    <div>
                      <Label htmlFor="pdf" className="text-base font-medium mb-2 block">
                        Upload PDF
                      </Label>
                      <div className="relative">
                        <input
                          id="pdf"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="pdf"
                          className={cn(
                            "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                            isUploading
                              ? "border-slate-400 dark:border-gray-500 bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed"
                              : selectedFile
                                ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-900/50"
                                : "border-gray-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50"
                          )}
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center w-full px-8">
                              <FileText className="w-12 h-12 text-slate-900 dark:text-white mb-4 animate-pulse" />
                              <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                                Processing file...
                              </p>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  className="h-full bg-slate-900 dark:bg-white rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${uploadProgress}%` }}
                                  transition={{ duration: 0.1 }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {Math.round(uploadProgress)}%
                              </p>
                            </div>
                          ) : selectedFile ? (
                            <div className="flex flex-col items-center">
                              <FileText className="w-12 h-12 text-slate-900 dark:text-white mb-2" />
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {(selectedFile.size / 1024).toFixed(2)} KB
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Click to change file
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="w-12 h-12 text-gray-400 mb-2" />
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Click to upload PDF
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                PDF files only
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Material Types */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto"
              >
                {MATERIAL_TYPES.map((material) => {
                  const Icon = material.icon;
                  const isSelected = materialTypes.includes(material.key);
                  return (
                    <div
                      key={material.key}
                      onClick={() => toggleMaterialType(material.key)}
                      className={cn(
                        "group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden",
                        isSelected
                          ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-900/50 shadow-lg"
                          : "border-gray-200 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800/50"
                      )}
                    >
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                            isSelected
                              ? "bg-slate-900 dark:bg-white"
                              : "bg-gray-100 dark:bg-gray-700"
                          )}>
                            <Icon className={cn(
                              "w-6 h-6 transition-colors",
                              isSelected
                                ? "text-white dark:text-slate-900"
                                : "text-gray-600 dark:text-gray-300"
                            )} />
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center"
                            >
                              <Check className="w-4 h-4 text-white dark:text-slate-900" />
                            </motion.div>
                          )}
                        </div>
                        <h3 className={cn(
                          "text-lg font-semibold mb-1 transition-colors",
                          isSelected
                            ? "text-slate-900 dark:text-white"
                            : "text-gray-900 dark:text-gray-100"
                        )}>
                          {material.label}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {material.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/20">
                      <Sparkles className="w-8 h-8 text-white dark:text-slate-900" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {"Ready to Generate!"}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Review your configuration before generating
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Course</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{courseName}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Specialty</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{specialty}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Source</span>
                      <span className="font-semibold text-gray-900 dark:text-white capitalize">{source}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-gray-600 dark:text-gray-400">Materials</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {materialTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartStudy}
                    disabled={isLoading}
                    className="w-full mt-8 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-5 h-5" />
                        <span>Generate Study Materials</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-4 mt-12"
          >
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium transition-all"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Continue
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
