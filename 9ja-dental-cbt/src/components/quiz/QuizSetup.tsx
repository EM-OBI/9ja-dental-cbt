"use client";

import React, { useState } from "react";
import { Play, ChevronRight, ChevronLeft, Check, Clock, Trophy, BookOpen, Target } from "lucide-react";
import { QuizConfig } from "@/types/definitions";
import { quizModes, timerOptions } from "@/types/QuizConfig";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [selectedSpecialtyName, setSelectedSpecialtyName] = useState<string>("");
  const [selectedTimer, setSelectedTimer] = useState<string>("");

  const steps = [
    { title: "Mode", subtitle: "How do you want to learn?" },
    { title: "Specialty", subtitle: "What's your focus?" },
    { title: "Duration", subtitle: "How much time do you have?" },
    { title: "Review", subtitle: "Ready to begin?" },
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
            Configure your session to match your goals
          </p>
        </div>

        {/* Main Content */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* Step 0: Choose Mode */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 md:grid-cols-3"
              >
                {quizModes.map((mode) => (
                  <div
                    key={mode.name}
                    onClick={() => setSelectedMode(mode.name)}
                    className={cn(
                      "group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden",
                      selectedMode === mode.name
                        ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/50 shadow-lg scale-[1.02]"
                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md"
                    )}
                  >
                    <div className={cn(
                      "mb-4 w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      selectedMode === mode.name
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-slate-200 dark:group-hover:bg-gray-700"
                    )}>
                      {mode.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {mode.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {mode.description}
                    </p>

                    {selectedMode === mode.name && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white dark:text-slate-900" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* Step 1: Select Specialty */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {specialties.length === 0 ? (
                  <div className="text-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-500">Loading specialties...</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {specialties.map((specialty) => (
                      <div
                        key={specialty.id}
                        onClick={() => {
                          setSelectedSpecialtyId(specialty.id);
                          setSelectedSpecialtyName(specialty.name);
                        }}
                        className={cn(
                          "group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                          selectedSpecialtyId === specialty.id
                            ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/50 shadow-md"
                            : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                            selectedSpecialtyId === specialty.id
                              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          )}>
                            {specialty.icon || <BookOpen className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {specialty.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {specialty.questionCount} questions
                            </p>
                          </div>
                          {selectedSpecialtyId === specialty.id && (
                            <Check className="w-5 h-5 text-slate-900 dark:text-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Set Timer */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 md:grid-cols-3 max-w-3xl mx-auto"
              >
                {timerOptions.map((option) => (
                  <div
                    key={option.name}
                    onClick={() => setSelectedTimer(option.name)}
                    className={cn(
                      "group relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 text-center",
                      selectedTimer === option.name
                        ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/50 shadow-lg scale-105"
                        : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
                    )}
                  >
                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:scale-110 transition-transform">
                      <Clock className={cn(
                        "w-8 h-8 transition-colors",
                        selectedTimer === option.name
                          ? "text-slate-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-500"
                      )} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {option.name}
                    </h3>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                      {option.duration}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {option.name === "Quick Fire" && "Rapid review session"}
                      {option.name === "Standard" && "Balanced practice"}
                      {option.name === "Marathon" && "Deep dive learning"}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Step 3: Review & Start */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="max-w-md mx-auto"
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
                  <div className="p-8 text-center border-b border-gray-100 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="w-16 h-16 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/20">
                      <Trophy className="w-8 h-8 text-white dark:text-slate-900" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {"You're All Set!"}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                      Review your settings before starting
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Mode</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{selectedMode}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Specialty</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px] text-right">
                        {selectedSpecialtyName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Duration</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {timerOptions.find((t) => t.name === selectedTimer)?.duration}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
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
                            specialties.find((s) => s.id === selectedSpecialtyId)?.name ||
                            "General",
                          totalQuestions: 20,
                        };

                        onStartQuiz(config);
                      }}
                      disabled={isLoading}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="text-white dark:text-slate-900" />
                          <span>Starting Quiz...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          <span>Start Quiz Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="mt-12 flex justify-between items-center max-w-4xl mx-auto px-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              currentStep === 0
                ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < steps.length - 1 && (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all",
                canProceed()
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-lg hover:scale-105"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
              )}
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
