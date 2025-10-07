export interface StudySummary {
  id: string;
  userId: string;
  topic: string;
  topicSlug: string;
  path: string;
  model: string;
  contentHash?: string | null;
  createdAt: string;
  content?: string;
}

export interface StudyFlashcards {
  id: string;
  userId: string;
  topic: string;
  topicSlug: string;
  filePath: string;
  count: number;
  summaryId?: string | null;
  model: string;
  createdAt: string;
  cards?: Array<{
    question: string;
    answer: string;
    topic: string;
  }>;
}

export interface StudyQuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface StudyQuiz {
  id: string;
  userId: string;
  topic: string;
  topicSlug: string;
  filePath: string;
  numQuestions: number;
  flashcardId?: string | null;
  model: string;
  createdAt: string;
  questions?: StudyQuizQuestion[];
}

export interface StudyProgressRecord {
  id: string;
  userId: string;
  topic: string;
  topicSlug: string;
  summaryDone: boolean;
  flashcardsDone: boolean;
  quizScore: number | null;
  lastGeneratedAt?: string | null;
  updatedAt: string;
}

export interface StudyGenerationResult {
  summary: StudySummary;
  flashcards: StudyFlashcards;
  quiz: StudyQuiz;
  progress: StudyProgressRecord;
}

export interface GenerateStudyPayload {
  topic: string;
  source?: {
    type: "pdf" | "notes" | "topic";
    content?: string;
  };
  preferences?: string[];
}
