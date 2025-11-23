"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Album, ChevronRight, Search, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StudyFlashcardDeck } from "@/components/study/StudyFlashcardDeck";
import { useFlashcardSets, type FlashcardSet } from "@/hooks/queries/useStudyPackages";

export default function FlashcardsPage() {
    const router = useRouter();
    const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: flashcardSets = [], isLoading, error } = useFlashcardSets();

    const filteredSets = useMemo(() => {
        return flashcardSets.filter((set) =>
            set.topic.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [flashcardSets, searchQuery]);

    const stats = useMemo(() => ({
        totalSets: flashcardSets.length,
        totalCards: flashcardSets.reduce((sum, set) => sum + set.cardCount, 0),
    }), [flashcardSets]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading flashcards...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border-2 border-red-200 dark:border-red-800">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Error Loading Flashcards
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {error instanceof Error ? error.message : 'Failed to load flashcards'}
                    </p>
                </div>
            </div>
        );
    }

    if (selectedSet) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-background p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => setSelectedSet(null)}
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
                    >
                        ← Back to sets
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-xl p-6 md:p-8">
                        <StudyFlashcardDeck cards={selectedSet.cards} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Flashcards
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Review and memorize key concepts with spaced repetition
                    </p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search flashcard sets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 border-2"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sets</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.totalSets}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <Album className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cards</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.totalCards}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Study Streak</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    0 days
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🔥</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flashcard Sets */}
                {filteredSets.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Album className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {searchQuery ? "No flashcards found" : "No flashcards yet"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchQuery
                                ? "Try adjusting your search"
                                : "Generate study materials with flashcards to get started"
                            }
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => router.push("/study")}
                                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-all"
                            >
                                Generate Materials
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSets.map((set, index) => (
                            <motion.div
                                key={set.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => setSelectedSet(set)}
                                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer transition-all hover:shadow-xl"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors line-clamp-2">
                                            {set.topic}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {set.cardCount} cards
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <Album className="w-3.5 h-3.5" />
                                    <span>Created {new Date(set.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
