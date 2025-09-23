import { QuizMode, Specialty, TimerOption } from "@/types/definitions";
import {
  BookOpen,
  Trophy,
  Target,
  Brain,
  AlertCircle,
  Award,
  Zap,
  Users,
  Clock,
} from "lucide-react";

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

export const specialties: Specialty[] = [
  {
    name: "Oral Surgery",
    icon: <Target className="w-5 h-5" />,
  },
  {
    name: "Endodontics",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    name: "Periodontics",
    icon: <AlertCircle className="w-5 h-5" />,
  },
  {
    name: "Prosthodontics",
    icon: <Award className="w-5 h-5" />,
  },
  {
    name: "Orthodontics",
    icon: <Zap className="w-5 h-5" />,
  },
  {
    name: "Pediatric Dentistry",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: "Oral Pathology & Oral Medicine",
    icon: <Target className="w-5 h-5" />,
  },
  {
    name: "Community Dentistry",
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: "Radiology",
    icon: <Brain className="w-5 h-5" />,
  },
  {
    name: "General Dentistry",
    icon: <BookOpen className="w-5 h-5" />,
  },
];

// Default question counts for specialties
// These will be updated dynamically when fetching quizzes from the API
const defaultQuestionCounts: Record<string, number> = {
  "Oral Surgery": 50,
  Endodontics: 45,
  Periodontics: 40,
  Prosthodontics: 35,
  Orthodontics: 30,
  "Pediatric Dentistry": 25,
  "Oral Pathology & Oral Medicine": 20,
  "Community Dentistry": 15,
  Radiology: 25,
  "General Dentistry": 100,
};

// Add question counts to specialties
export const specialtiesWithCounts: Specialty[] = specialties.map(
  (specialty) => ({
    ...specialty,
    count: defaultQuestionCounts[specialty.name] || 0,
  })
);

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
