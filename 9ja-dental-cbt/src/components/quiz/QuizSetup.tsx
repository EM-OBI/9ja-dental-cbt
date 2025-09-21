"use client";

import React, { useState } from "react";
import { Play, ChevronRight, Check, Clock } from "lucide-react";
import { QuizConfig } from "@/types/definitions";
import {
  quizModes,
  specialtiesWithCounts,
  timerOptions,
} from "@/types/QuizConfig";

interface QuizSetupProps {
  onStartQuiz: (config: QuizConfig) => void;
  onRestartQuiz: () => void;
}

export function QuizSetup({ onStartQuiz }: QuizSetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
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
        return selectedSpecialty !== "";
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
    <div className="min-h-screen bg-transparent p-3">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 sm:mb-4">
            🦷 Dental Knowledge Quiz
          </h1>
          <p className="text-sm sm:text-lg text-amber-700 dark:text-amber-300 max-w-2xl mx-auto px-2 sm:px-0 font-medium">
            Test your dental expertise and advance your professional skills with
            interactive questions
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto pb-2">
          <div className="flex items-center min-w-max px-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium ${
                    index <= currentStep
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 ${
                      index < currentStep
                        ? "bg-gradient-to-r from-orange-500 to-red-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-8 border border-amber-100 dark:border-slate-700">
          {/* Step 0: Choose Mode */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6 text-center">
                Choose Your Learning Mode
              </h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                {quizModes.map((mode) => (
                  <div
                    key={mode.name}
                    onClick={() => setSelectedMode(mode.name)}
                    className={`p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedMode === mode.name
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/30 shadow-md ring-2 ring-amber-200 dark:ring-amber-700"
                        : "border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${mode.color} text-white flex items-center justify-center mb-3 sm:mb-4 shadow-sm`}
                    >
                      {mode.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                      {mode.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
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
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6 text-center">
                Select Your Specialty Area
              </h2>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {specialtiesWithCounts.map((specialty) => (
                  <div
                    key={specialty.name}
                    onClick={() => setSelectedSpecialty(specialty.name)}
                    className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between hover:shadow-md ${
                      selectedSpecialty === specialty.name
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/30 shadow-md ring-2 ring-amber-200 dark:ring-amber-700"
                        : "border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="text-amber-600 flex-shrink-0">
                        {specialty.icon}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {specialty.name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                      {specialty.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Set Timer */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6 text-center">
                Set Your Study Timer
              </h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-3 max-w-2xl mx-auto">
                {timerOptions.map((option) => (
                  <div
                    key={option.name}
                    onClick={() => setSelectedTimer(option.name)}
                    className={`p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center hover:shadow-md ${
                      selectedTimer === option.name
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/30 shadow-md ring-2 ring-amber-200 dark:ring-amber-700"
                        : "border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 mx-auto mb-2 sm:mb-3" />
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                      {option.name}
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-amber-600 mb-2">
                      {option.duration}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
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
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">
                Ready to Start! 🦷
              </h2>

              {/* Quiz Summary */}
              <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-md mx-auto border border-amber-200 dark:border-amber-700 ring-2 ring-amber-200 dark:ring-amber-700">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 sm:mb-4">
                  Quiz Summary
                </h3>
                <div className="space-y-2 sm:space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Mode:
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100">
                      {selectedMode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Specialty:
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100">
                      {selectedSpecialty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Duration:
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100">
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
                    specialty: selectedSpecialty,
                    totalQuestions: 20,
                  };

                  onStartQuiz(config);
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Play className="w-5 h-5" />
                <span>Start Quiz</span>
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-600">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Back
            </button>

            {currentStep < 3 && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
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
