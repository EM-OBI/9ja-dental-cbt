"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Check } from "lucide-react";
import { SummaryViewer } from "@/components/study/SummaryViewer";
import { StudyQuizPractice } from "@/components/study/StudyQuizPractice";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useStudyPackage } from "@/hooks/queries/useStudyPackages";
import { cn } from "@/lib/utils";

type ViewState = 'summary' | 'quiz' | 'completed';

export default function StudyPackagePage() {
    const router = useRouter();
    const params = useParams();
    const packageId = params.packageId as string;

    const [currentView, setCurrentView] = useState<ViewState>('summary');

    const { data, isLoading, error } = useStudyPackage(packageId);

    const packageDetails = data?.packageDetails;
    const materials = data?.materials;

    const allQuizQuestions = useMemo(() => {
        if (!materials?.quiz) return [];

        return [
            ...(materials.quiz.multipleChoice || []),
            ...(materials.quiz.trueFalse || []),
        ].map(q => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctAnswer,
            explanation: q.explanation,
        }));
    }, [materials?.quiz]);

    const handleProceedToQuiz = useCallback(() => {
        setCurrentView('quiz');
    }, []);

    const handleBackToLibrary = useCallback(() => {
        router.push('/study/library');
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading study materials...</p>
                </div>
            </div>
        );
    }

    if (error || !materials) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border-2 border-red-200 dark:border-red-800">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Error Loading Materials
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {error instanceof Error ? error.message : "Materials not found"}
                    </p>
                    <button
                        onClick={handleBackToLibrary}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-all"
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBackToLibrary}
                            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back to Library</span>
                        </button>

                        <div className="flex items-center gap-3">
                            {/* Progress Steps */}
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                    currentView === 'summary'
                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                )}>
                                    {currentView !== 'summary' && <Check className="w-4 h-4" />}
                                    <span>Summary</span>
                                </div>
                                <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                                    currentView === 'quiz' || currentView === 'completed'
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                                )}>
                                    {currentView === 'completed' && <Check className="w-4 h-4" />}
                                    <span>Quiz</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    AI Generated
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Package Title */}
                    <div className="mt-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            {packageDetails?.topic || "Study Package"}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
                    <div className="p-6 md:p-8">
                        <AnimatePresence mode="wait">
                            {/* Summary View */}
                            {currentView === 'summary' && materials.summary && (
                                <SummaryViewer
                                    key="summary"
                                    html={materials.summary}
                                    onProceed={handleProceedToQuiz}
                                    showProceedButton={allQuizQuestions.length > 0}
                                />
                            )}

                            {/* Quiz View */}
                            {currentView === 'quiz' && allQuizQuestions.length > 0 && (
                                <motion.div
                                    key="quiz"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <StudyQuizPractice
                                        questions={allQuizQuestions}
                                    />
                                </motion.div>
                            )}

                            {/* Completed View */}
                            {currentView === 'completed' && (
                                <motion.div
                                    key="completed"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-center py-12"
                                >
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                        Great Work!
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                                        {"You've completed this study session"}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <button
                                            onClick={() => setCurrentView('summary')}
                                            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all"
                                        >
                                            Review Summary
                                        </button>
                                        <button
                                            onClick={() => setCurrentView('quiz')}
                                            className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all"
                                        >
                                            Retake Quiz
                                        </button>
                                        <button
                                            onClick={handleBackToLibrary}
                                            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-all"
                                        >
                                            Back to Library
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
