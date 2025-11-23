"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    BookOpen,
    Clock,
    FileText,
    ChevronRight,
    Search,
    Filter,
    Album,
    Lightbulb,
    Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useStudyPackages } from "@/hooks/queries/useStudyPackages";

export default function StudyLibraryPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const { data: packages = [], isLoading, error } = useStudyPackages();

    const filteredPackages = useMemo(() => {
        return packages.filter((pkg) =>
            pkg.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [packages, searchQuery]);

    const stats = useMemo(() => ({
        total: packages.length,
        completed: packages.filter(p => p.progress?.quizScore !== null).length,
        inProgress: packages.filter(p => p.progress?.summaryViewed && !p.progress?.quizScore).length,
    }), [packages]);

    const handlePackageClick = (packageId: string) => {
        router.push(`/study/${packageId}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Recently";

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your study materials...</p>
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
                        Error Loading Library
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">{error instanceof Error ? error.message : 'Failed to load packages'}</p>
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
                        Study Materials Library
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Access your AI-generated study materials
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search by topic or specialty..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-12 border-2"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-all">
                        <Filter className="w-5 h-5" />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Materials</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.completed}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <Lightbulb className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.inProgress}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Packages Grid */}
                {filteredPackages.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {searchQuery ? "No materials found" : "No study materials yet"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchQuery
                                ? "Try adjusting your search criteria"
                                : "Generate your first study package to get started"
                            }
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => router.push("/study")}
                                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-all"
                            >
                                Generate Study Materials
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPackages.map((pkg, index) => (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handlePackageClick(pkg.id)}
                                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-slate-400 dark:hover:border-gray-500 cursor-pointer transition-all hover:shadow-xl"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-slate-700 dark:group-hover:text-gray-200 transition-colors line-clamp-2">
                                            {pkg.topic}
                                        </h3>
                                        {pkg.specialty && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {pkg.specialty}
                                            </p>
                                        )}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-slate-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
                                </div>

                                {/* Materials Available */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {pkg.materials.hasSummary && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg">
                                            <FileText className="w-3.5 h-3.5" />
                                            Summary
                                        </span>
                                    )}
                                    {pkg.materials.hasFlashcards && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-lg">
                                            <Album className="w-3.5 h-3.5" />
                                            Flashcards
                                        </span>
                                    )}
                                    {pkg.materials.hasQuiz && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-lg">
                                            <Lightbulb className="w-3.5 h-3.5" />
                                            Quiz
                                        </span>
                                    )}
                                </div>

                                {/* Progress */}
                                {pkg.progress && (
                                    <div className="mb-4">
                                        {pkg.progress.quizScore !== null ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${pkg.progress.quizScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                    {pkg.progress.quizScore}%
                                                </span>
                                            </div>
                                        ) : pkg.progress.summaryViewed ? (
                                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                                📖 In Progress
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Not started
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{formatDate(pkg.createdAt)}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
