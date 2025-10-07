import { QuizMode, Specialty, TimerOption } from "@/types/definitions";
import { BookOpen, Trophy, Target } from "lucide-react";

export const quizModes: QuizMode[] = [
  {
    name: "Practice Mode",
    description:
      "No time limit, detailed explanations after each question. Perfect for learning.",
    icon: <BookOpen className="w-6 h-6" />,
    color: "bg-green-500",
    settings: {
      timeLimit: false,
      showExplanationAfterEachQuestion: true,
      showSummaryAtEnd: false,
      leaderboard: false,
    },
  },
  {
    name: "Challenge Mode",
    description:
      "Timed questions, points-based scoring, and leaderboard competition.",
    icon: <Trophy className="w-6 h-6" />,
    color: "bg-blue-500",
    settings: {
      timeLimit: true,
      showExplanationAfterEachQuestion: false,
      showSummaryAtEnd: true,
      leaderboard: true,
    },
  },
  {
    name: "Exam Simulation",
    description:
      "Timed, no hints, realistic exam conditions with a final score report.",
    icon: <Target className="w-6 h-6" />,
    color: "bg-red-500",
    settings: {
      timeLimit: true,
      showExplanationAfterEachQuestion: false,
      showSummaryAtEnd: true,
      leaderboard: false,
    },
  },
];

// Specialties are now fetched from the API via /api/specialties
// This is kept for backward compatibility but should be replaced with API data
export const specialties: Specialty[] = [];

// Specialties with counts will be populated from API
export const specialtiesWithCounts: Specialty[] = [];

export const timerOptions: TimerOption[] = [
  { name: "Quick Fire", duration: "10 mins", minutes: 10 },
  { name: "Standard", duration: "30 mins", minutes: 30 },
  { name: "Marathon", duration: "60 mins", minutes: 60 },
];

export const defaultQuizSettings = {
  questionsPerQuiz: 20,
  passingScore: 70,
  timePerQuestion: 60, // seconds
};
