"use client";

import { useCallback, useMemo, useState } from "react";
// import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudySetup, StudyConfig } from "@/components/study/StudySetup";
import { StudyEngine } from "@/components/study/StudyEngine";

export default function StudyEnginePage() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [studyConfig, setStudyConfig] = useState<StudyConfig | null>(null);

  const handleStartStudy = useCallback((config: StudyConfig) => {
    setStudyConfig(config);
    setIsSetupComplete(true);
  }, []);

  const handleReset = useCallback(() => {
    setStudyConfig(null);
    setIsSetupComplete(false);
  }, []);

  const engineKey = useMemo(() => {
    if (!studyConfig) return null;
    if (studyConfig.packageId) return `package-${studyConfig.packageId}`;
    const descriptor = [
      studyConfig.mode,
      studyConfig.courseName,
      studyConfig.specialty,
      studyConfig.source,
      studyConfig.fileName,
    ]
      .filter(Boolean)
      .join("-");
    return descriptor || "study-engine";
  }, [studyConfig]);

  if (isSetupComplete && studyConfig) {
    return (
      <div className="min-h-full bg-slate-50">
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-slate-900">
              Your AI-generated materials
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to generator
            </Button>
          </div>
          <StudyEngine key={engineKey ?? "study-engine"} config={studyConfig} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50">
      <StudySetup onStartStudy={handleStartStudy} />
    </div>
  );
}
