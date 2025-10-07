import { useState, useCallback } from "react";
// Note: Store integration available via useStudyStore if needed for job status updates

export type JobState =
  | "PENDING"
  | "UPLOADED"
  | "PARSING"
  | "SUMMARIZING"
  | "GENERATING_FLASHCARDS"
  | "GENERATING_QUIZ"
  | "COMPLETED"
  | "FAILED";

export interface JobStatus {
  status: JobState;
  progress: number;
  message: string;
  result_id?: string;
}

export interface UploadParams {
  file?: File;
  materialTypes: string[];
  topic?: string;
  notes?: string;
}

export function useStudyUpload() {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);

  const startUpload = useCallback(async (params: UploadParams) => {
    setLoading(true);
    setStatus({
      status: "PENDING",
      progress: 0,
      message: "Initiating upload...",
    });
    setError(null);

    try {
      if (params.file) {
        // PDF upload workflow
        const initRes = await fetch("/api/study/upload/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: params.file.name,
            topic: params.topic || params.file.name.replace(".pdf", ""),
            questionCount: params.materialTypes.includes("quiz") ? 10 : 0,
            flashcardCount: params.materialTypes.includes("flashcards")
              ? 15
              : 0,
          }),
        });

        if (!initRes.ok) {
          const errData = (await initRes.json()) as { error?: string };
          throw new Error(errData.error || "Failed to initiate upload.");
        }

        const { jobId, uploadUrl } = (await initRes.json()) as {
          jobId: string;
          uploadUrl: string;
        };

        setStatus({
          status: "UPLOADED",
          progress: 10,
          message: "Uploading file...",
        });

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: params.file,
          headers: { "Content-Type": "application/pdf" },
        });

        if (!uploadRes.ok) {
          throw new Error("File upload failed.");
        }

        setStatus({
          status: "UPLOADED",
          progress: 20,
          message: "File uploaded. Processing...",
        });

        await pollJobStatus(jobId);
      } else {
        // Direct generation
        const generateRes = await fetch("/api/study/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: params.topic,
            questionCount: params.materialTypes.includes("quiz") ? 10 : 0,
            flashcardCount: params.materialTypes.includes("flashcards")
              ? 15
              : 0,
            source: params.notes
              ? { type: "notes", content: params.notes }
              : { type: "topic" },
          }),
        });

        if (!generateRes.ok) {
          const errData = (await generateRes.json()) as { error?: string };
          throw new Error(errData.error || "Failed to generate materials.");
        }

        const result = (await generateRes.json()) as {
          jobId: string;
          id: string;
        };

        if (result.jobId) {
          await pollJobStatus(result.jobId);
        } else {
          setPackageId(result.id);
          setStatus({
            status: "COMPLETED",
            progress: 100,
            message: "Materials generated!",
            result_id: result.id,
          });
          setLoading(false);
        }
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setStatus({
        status: "FAILED",
        progress: 100,
        message: errorMessage,
      });
      setLoading(false);
    }
  }, []);

  const pollJobStatus = async (jobId: string): Promise<void> => {
    let pollAttempts = 0;
    const maxAttempts = 60;

    const poll = async (): Promise<void> => {
      if (pollAttempts >= maxAttempts) {
        throw new Error("Request timed out");
      }

      const delay = Math.min(2000 * Math.pow(1.2, pollAttempts), 15000);
      await new Promise((resolve) => setTimeout(resolve, delay));

      const statusRes = await fetch(`/api/study/jobs/${jobId}/status`);

      if (!statusRes.ok) {
        throw new Error("Failed to fetch status");
      }

      const currentStatus = (await statusRes.json()) as JobStatus;
      setStatus(currentStatus);

      if (currentStatus.status === "COMPLETED" && currentStatus.result_id) {
        setPackageId(currentStatus.result_id);
        setLoading(false);
        return;
      }

      if (currentStatus.status === "FAILED") {
        throw new Error(currentStatus.message || "Processing failed");
      }

      pollAttempts++;
      await poll();
    };

    await poll();
  };

  const reset = useCallback(() => {
    setStatus(null);
    setLoading(false);
    setError(null);
    setPackageId(null);
  }, []);

  return {
    startUpload,
    status,
    loading,
    error,
    packageId,
    reset,
  };
}
