export type JobState =
  | "PENDING"
  | "UPLOADED"
  | "PARSING"
  | "SUMMARIZING"
  | "GENERATING_FLASHCARDS"
  | "GENERATING_QUIZ"
  | "COMPLETED"
  | "FAILED";

export interface JobStatusPayload {
  status: JobState;
  progress: number;
  message: string;
  packageId?: string;
  resultId?: string;
  error?: string;
}

export interface JobStatus extends JobStatusPayload {
  jobId: string;
}

export type JobStatusUpdate = JobStatusPayload;

export interface JobMetadata {
  userId: string;
  topic: string;
  topicSlug: string;
  questionCount: number;
  flashcardCount: number;
  documentId: string;
  r2Key: string;
  source?: { type: string; content?: string };
}
