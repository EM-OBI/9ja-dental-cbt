"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SavedPackagesList } from "@/components/study/SavedPackagesList";
import { useStudyPackages } from "@/hooks/useStudyPackages";

export default function SavedStudyPackagesPage() {
  const router = useRouter();
  const { packages, isLoading, error, refresh } = useStudyPackages();

  return (
    <div className="min-h-full bg-transparent p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-foreground">
              Saved Study Packages
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Revisit previously generated summaries, flashcards, and quizzes.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/study">Generate new materials</Link>
            </Button>
          </div>
        </div>

        <SavedPackagesList
          packages={packages}
          isLoading={isLoading}
          error={error}
          onRefresh={refresh}
          onOpenPackage={(pkg) => router.push(`/study/view/${pkg.id}`)}
        />
      </div>
    </div>
  );
}
