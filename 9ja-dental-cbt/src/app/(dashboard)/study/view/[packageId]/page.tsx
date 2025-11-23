import { StudyEngine } from "@/components/study/StudyEngine";
import type { StudyConfig } from "@/components/study/StudySetup";

export default async function ViewStudyPackagePage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;

  const config: StudyConfig = {
    mode: "view",
    packageId,
    courseName: "",
    specialty: "",
    source: "existing",
    content: "",
    materialTypes: ["summary", "flashcards", "quiz"],
  };

  return <StudyEngine config={config} />;
}
