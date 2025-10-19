"use client";

import type { ReactNode } from "react";
import { BookOpen, Brain, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StudyMaterialType = "summary" | "flashcards" | "quiz";

interface StudyMaterialLauncherProps {
  topic: string;
  available: {
    summary?: string;
    flashcards?: Array<{ front: string; back: string; hint?: string }>;
    quiz?: {
      multipleChoice?: Array<QuizQuestion>;
      trueFalse?: Array<QuizQuestion>;
    };
  };
  onSelect: (type: StudyMaterialType) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export function StudyMaterialLauncher({
  topic,
  available,
  onSelect,
}: StudyMaterialLauncherProps) {
  const cards: Array<{
    type: StudyMaterialType;
    title: string;
    description: string;
    cta: string;
    icon: ReactNode;
    enabled: boolean;
    meta?: string;
    preview?: string;
  }> = [
    {
      type: "summary",
      title: "Study Summary",
      description:
        "Read the AI-generated outline to anchor key concepts before you drill into practice.",
      cta: "Read Summary",
      icon: <BookOpen className="h-5 w-5" />,
      enabled: Boolean(available.summary),
      meta: available.summary ? "Approx. 10 min read" : undefined,
      preview: available.summary
        ? sanitizePreview(available.summary)
        : undefined,
    },
    {
      type: "flashcards",
      title: "Flashcard Warm-Up",
      description:
        "Flip through targeted flashcards to reinforce definitions, mnemonics, and clinical pearls.",
      cta: "Start Flashcards",
      icon: <FileText className="h-5 w-5" />,
      enabled: Boolean(available.flashcards?.length),
      meta: available.flashcards
        ? `${available.flashcards.length} cards`
        : undefined,
      preview: available.flashcards?.length
        ? available.flashcards[0].front
        : undefined,
    },
    {
      type: "quiz",
      title: "Assessment Quiz",
      description:
        "Gauge your mastery with mixed-format questions and immediate feedback.",
      cta: "Begin Quiz",
      icon: <Brain className="h-5 w-5" />,
      enabled:
        Boolean(available.quiz?.multipleChoice?.length) ||
        Boolean(available.quiz?.trueFalse?.length),
      meta: available.quiz
        ? `${
            (available.quiz.multipleChoice?.length || 0) +
            (available.quiz.trueFalse?.length || 0)
          } questions`
        : undefined,
      preview: available.quiz?.multipleChoice?.[0]?.question,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-foreground">
          Choose where to begin
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          We generated a custom study path for{" "}
          <span className="font-medium">{topic}</span>. Pick the experience you
          want to tackle first.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards
          .filter((card) => card.enabled)
          .map((card) => (
            <article
              key={card.type}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/60"
            >
              <div className="space-y-3">
                <div
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                    "bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300"
                  )}
                >
                  {card.icon}
                  <span className="ml-2">{card.title}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {card.description}
                </p>
                {card.preview && (
                  <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
                    {truncate(card.preview, 140)}
                  </p>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between">
                {card.meta ? (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {card.meta}
                  </span>
                ) : (
                  <span />
                )}
                <Button
                  variant="secondary"
                  onClick={() => onSelect(card.type)}
                  className="group/button inline-flex items-center"
                >
                  <span>{card.cta}</span>
                  <ChevronRight className="ml-2 h-4 w-4 transition group-hover/button:translate-x-1" />
                </Button>
              </div>
            </article>
          ))}
      </div>
    </div>
  );
}

function sanitizePreview(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  return text.trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1).trim()}…`;
}
