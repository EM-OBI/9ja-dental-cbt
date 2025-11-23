"use client";

import React, { useState } from "react";
import { Play, ChevronRight, Check, Clock } from "lucide-react";
import { QuizConfig } from "@/types/definitions";
import { quizModes, timerOptions } from "@/types/QuizConfig";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface QuizSetupProps {
  onStartQuiz: (config: QuizConfig) => void;
  onRestartQuiz: () => void;
  isLoading?: boolean;
  specialties?: Array<{
    id: string;
    name: string;
    questionCount: number;
    icon?: React.ReactNode;
  }>;
}

export function QuizSetup({
  onStartQuiz,
  isLoading = false,
  specialties = [],
}: QuizSetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>("");
  const [selectedSpecialtyName, setSelectedSpecialtyName] =
    useState<string>("");
  const [selectedTimer, setSelectedTimer] = useState<string>("");

  const steps = [
    "Choose Your Mode",
    "Select Specialty",
    "Set Your Timer",
    "Start Quiz",
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedMode !== "";
      case 1:
        return selectedSpecialtyId !== "";
      case 2:
        return selectedTimer !== "";
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

  return (
    <div className="min-h-full bg-transparent p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-foreground mb-2">
            Quiz Setup
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Configure your quiz settings to begin
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
          {/* Step 0: Choose Mode */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-6 text-center">
                Choose Your Learning Mode
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {quizModes.map((mode) => (
                  <div
                    key={mode.name}
                    onClick={() => setSelectedMode(mode.name)}
                    className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedMode === mode.name
                        ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                        : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-card"
                    }`}
                  >
                    <div className="text-slate-700 dark:text-slate-300 mb-3">
                      {mode.icon}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-foreground mb-2">
                      {mode.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {mode.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Step 1: Select Specialty */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-6 text-center">
                Select Your Specialty Area
              </h2>
              {specialties.length === 0 ? (
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  <LoadingSpinner size="md" label="Loading specialties..." />
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {specialties.map((specialty) => (
                    <div
                      key={specialty.id}
                      onClick={() => {
                        setSelectedSpecialtyId(specialty.id);
                        setSelectedSpecialtyName(specialty.name);
                      }}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between ${
                        selectedSpecialtyId === specialty.id
                          ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                          : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="text-slate-600 dark:text-slate-400 flex-shrink-0">
                          {specialty.icon}
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-foreground truncate">
                          {specialty.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full ml-2">
                        {specialty.questionCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}{" "}
          {/* Step 2: Set Timer */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-6 text-center">
                Set Your Study Timer
              </h2>
              <div className="grid gap-4 md:grid-cols-3 max-w-2xl mx-auto">
                {timerOptions.map((option) => (
                  <div
                    key={option.name}
                    onClick={() => setSelectedTimer(option.name)}
                    className={`p-5 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      selectedTimer === option.name
                        ? "border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-800"
                        : "border-slate-200 dark:border-border hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-card"
                    }`}
                  >
                    <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-foreground mb-1">
                      {option.name}
                    </h3>
                    <p className="text-2xl font-bold text-slate-900 dark:text-foreground mb-2">
                      {option.duration}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {option.name === "Quick Fire" &&
                        "Perfect for a quick review"}
                      {option.name === "Standard" &&
                        "Ideal for focused practice"}
                      {option.name === "Marathon" && "Deep learning session"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Step 3: Start Quiz */}
          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground mb-6">
                Ready to Start
              </h2>

              {/* Quiz Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 mb-8 max-w-md mx-auto border border-slate-200 dark:border-border">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-4">
                  Quiz Summary
                </h3>
                <div className="space-y-2.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Mode:
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-foreground">
                      {selectedMode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Specialty:
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-foreground">
                      {selectedSpecialtyName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Duration:
                    </span>
                    <span className="text-sm font-medium text-slate-900 dark:text-foreground">
                      {
                        timerOptions.find((t) => t.name === selectedTimer)
                          ?.duration
                      }
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const selectedTimerOption = timerOptions.find(
                    (t) => t.name === selectedTimer
                  );
                  const selectedModeSettings = quizModes.find(
                    (m) => m.name === selectedMode
                  )?.settings;

                  const config: QuizConfig = {
                    mode: selectedMode.includes("Practice")
                      ? "practice"
                      : selectedMode.includes("Challenge")
                      ? "challenge"
                      : "exam",
                    timeLimit: selectedModeSettings?.timeLimit
                      ? (selectedTimerOption?.minutes || 30) * 60
                      : null,
                    specialtyId: selectedSpecialtyId,
                    specialtyName:
                      selectedSpecialtyName ||
                      specialties.find((s) => s.id === selectedSpecialtyId)
                        ?.name ||
                      "General",
                    totalQuestions: 20,
                  };

                  onStartQuiz(config);
                }}
                disabled={isLoading}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 disabled:bg-slate-300 disabled:dark:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium text-base transition-colors flex items-center gap-2 mx-auto disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" label={null} />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Quiz</span>
                  </>
                )}
              </button>
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
          </div>
        </div>
      </div>
    </div>
  );
}
