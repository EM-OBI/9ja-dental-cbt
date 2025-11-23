"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryViewerProps {
    html: string;
    onProceed?: () => void;
    showProceedButton?: boolean;
}

export function SummaryViewer({
    html,
    onProceed,
    showProceedButton = false
}: SummaryViewerProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [readingProgress, setReadingProgress] = React.useState(0);

    // Track scroll progress
    React.useEffect(() => {
        const handleScroll = () => {
            if (!contentRef.current) return;

            const element = contentRef.current;
            const scrollTop = element.scrollTop;
            const scrollHeight = element.scrollHeight - element.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 100;

            setReadingProgress(Math.min(100, Math.max(0, progress)));
        };

        const element = contentRef.current;
        if (element) {
            element.addEventListener('scroll', handleScroll);
            return () => element.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Study Summary
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Review the material before taking the quiz
                        </p>
                    </div>
                </div>

                {/* Reading Progress */}
                <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(readingProgress)}% read
                    </span>
                    <div className="w-32 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${readingProgress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div
                ref={contentRef}
                className={cn(
                    "prose prose-slate dark:prose-invert max-w-none overflow-y-auto transition-all duration-300",
                    isExpanded ? "max-h-[600px]" : "max-h-[400px]"
                )}
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 transparent'
                }}
            >
                <div
                    className="text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            </div>

            {/* Expand/Collapse */}
            <div className="flex justify-center">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-4 h-4" />
                            Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" />
                            Read more
                        </>
                    )}
                </button>
            </div>

            {/* Proceed Button */}
            {showProceedButton && onProceed && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                    <button
                        onClick={onProceed}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-slate-900 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        <span>Proceed to Quiz</span>
                        <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            →
                        </motion.div>
                    </button>
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                        {"Make sure you've reviewed the summary before starting the quiz"}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
