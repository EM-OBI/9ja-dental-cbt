"use client";

import React, { useState } from "react";
import { StudySetup, StudyConfig } from "@/components/study/StudySetup";
import { StudyEngine } from "@/components/study/StudyEngine";

export default function StudyPage() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [studyConfig, setStudyConfig] = useState<StudyConfig | null>(null);

  const handleStartStudy = (config: StudyConfig) => {
    setStudyConfig(config);
    setIsSetupComplete(true);
  };

  if (isSetupComplete && studyConfig) {
    return <StudyEngine config={studyConfig} />;
  }

  return <StudySetup onStartStudy={handleStartStudy} />;
}
