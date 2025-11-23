"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudyFlashcardDeckProps {
  cards: Array<{ front: string; back: string; hint?: string }>;
}

export function StudyFlashcardDeck({ cards }: StudyFlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!cards.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        No flashcards were generated for this topic.
      </div>
    );
  }

  const card = cards[index];
  const progressLabel = `${index + 1} / ${cards.length}`;
  const revealLabel = showAnswer ? "Hide answer" : "Show answer";

  const handleNext = () => {
    setShowAnswer(false);
    setIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    setIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleReset = () => {
    setShowAnswer(false);
    setIndex(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <span>Flashcard Drill</span>
        <span>{progressLabel}</span>
      </div>

      <article className="relative min-h-[240px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-400 dark:text-slate-500">
          <span>Question</span>
          <button
            type="button"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
            onClick={() => setShowAnswer((prev) => !prev)}
          >
            <Sparkles className="h-4 w-4" />
            {revealLabel}
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {card.front}
          </h3>

          {card.hint && !showAnswer && (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
              Hint: {card.hint}
            </div>
          )}

          {showAnswer ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 transition-opacity duration-200 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <span>Answer</span>
              </div>
              <p className="mt-2 leading-relaxed">{card.back}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs italic text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500">
              Tap reveal answer to check your understanding.
            </div>
          )}
        </div>
      </article>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            aria-label="Previous flashcard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            aria-label="Next flashcard"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            aria-label="Restart deck"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="inline-flex items-center gap-2"
          onClick={() => setShowAnswer((prev) => !prev)}
        >
          <Eye className="h-4 w-4" />
          {revealLabel}
        </Button>
      </div>
    </div>
  );
}
