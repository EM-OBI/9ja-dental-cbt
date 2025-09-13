"use client";
import React, { useState, useEffect } from "react";
import {
  Play,
  Clock,
  Trophy,
  BookOpen,
  Target,
  Timer,
  Users,
  Award,
  ChevronRight,
  Check,
  Zap,
  Brain,
  AlertCircle,
  X,
  Bookmark,
  SkipForward,
  Pause,
  ChevronLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface QuizMode {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  settings: {
    timeLimit: boolean;
    showExplanationAfterEachQuestion: boolean;
    showSummaryAtEnd: boolean;
    leaderboard: boolean;
  };
}

interface QuizState {
  currentQuestion: number;
  answers: Record<number, string>;
  score: number;
  timeRemaining: number;
  isActive: boolean;
  bookmarkedQuestions: number[];
  startTime: number;
  questionStartTime: number;
  timeSpentPerQuestion: Record<number, number>;
  shuffledQuestions: Question[];
  wrongAnswers: Array<{
    questionIndex: number;
    userAnswer: string;
    correctAnswer: string;
  }>;
  showExplanation: boolean;
  isSubmitting: boolean;
}

interface Specialty {
  name: string;
  icon: React.ReactNode;
}

interface TimerOption {
  name: string;
  duration: string;
  minutes: number;
}

interface Question {
  id: number;
  specialty: string;
  type: "multiple-choice" | "true-false" | "image-based";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  image?: string;
  difficulty: "easy" | "medium" | "hard";
  timeEstimate: number; // seconds
}

interface QuizState {
  currentQuestion: number;
  answers: Record<number, string>;
  score: number;
  timeRemaining: number;
  isActive: boolean;
  bookmarkedQuestions: number[];
  startTime: number;
  questionStartTime: number;
  timeSpentPerQuestion: Record<number, number>;
  shuffledQuestions: Question[];
  wrongAnswers: Array<{
    questionIndex: number;
    userAnswer: string;
    correctAnswer: string;
  }>;
  showExplanation: boolean;
  isSubmitting: boolean;
}

interface QuizStats {
  totalTime: number;
  averageTimePerQuestion: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  accuracy: number;
  timeBonus: number;
  finalScore: number;
}

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedTimer, setSelectedTimer] = useState<string>("");
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    score: 0,
    timeRemaining: 0,
    isActive: false,
    bookmarkedQuestions: [],
    startTime: 0,
    questionStartTime: 0,
    timeSpentPerQuestion: {},
    shuffledQuestions: [],
    wrongAnswers: [],
    showExplanation: false,
    isSubmitting: false,
  });
  const [showResults, setShowResults] = useState(false);

  // Utility functions for enhanced quiz logic
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const calculateTimeBonus = (
    timeSpent: number,
    timeEstimate: number
  ): number => {
    if (timeSpent <= timeEstimate * 0.7) return 5; // Quick answer bonus
    if (timeSpent <= timeEstimate) return 2; // Normal time bonus
    return 0; // No bonus for slow answers
  };

  const calculateFinalScore = (quizStats: Partial<QuizStats>): QuizStats => {
    const totalQuestions = filteredQuestions.length;
    const correctAnswers = quizStats.correctAnswers || 0;
    const wrongAnswers = quizStats.wrongAnswers || 0;
    const skippedAnswers = totalQuestions - correctAnswers - wrongAnswers;
    const accuracy =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const baseScore = correctAnswers * 10;
    const timeBonus = quizStats.timeBonus || 0;
    const finalScore = baseScore + timeBonus;

    return {
      totalTime: quizStats.totalTime || 0,
      averageTimePerQuestion:
        totalQuestions > 0 ? (quizStats.totalTime || 0) / totalQuestions : 0,
      correctAnswers,
      wrongAnswers,
      skippedAnswers,
      accuracy,
      timeBonus,
      finalScore,
    };
  };

  const quizModes: QuizMode[] = [
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

  // Comprehensive questions database for all specialties
  const questions: Question[] = [
    // Oral Surgery Questions (4)
    {
      id: 1,
      specialty: "Oral Surgery",
      type: "multiple-choice",
      question:
        "Which nerve is most commonly injured during third molar extraction?",
      options: [
        "Lingual nerve",
        "Inferior alveolar nerve",
        "Buccal nerve",
        "Hypoglossal nerve",
      ],
      answer: "Inferior alveolar nerve",
      explanation:
        "The inferior alveolar nerve runs close to the roots of mandibular third molars, making it the most commonly injured during extraction.",
      difficulty: "medium",
      timeEstimate: 45,
    },
    {
      id: 2,
      specialty: "Oral Surgery",
      type: "multiple-choice",
      question: "What is the most important factor in preventing dry socket?",
      options: [
        "Antibiotics",
        "Gentle extraction technique",
        "Smoking cessation",
        "Mouth rinse",
      ],
      answer: "Gentle extraction technique",
      explanation:
        "Gentle extraction technique that preserves the blood clot is the most critical factor in preventing dry socket (alveolar osteitis).",
      difficulty: "medium",
      timeEstimate: 40,
    },
    {
      id: 3,
      specialty: "Oral Surgery",
      type: "true-false",
      question:
        "The coronoid process should be removed when extracting impacted mandibular third molars.",
      options: ["True", "False"],
      answer: "False",
      explanation:
        "The coronoid process should be preserved. Bone removal should be limited to the buccal and distal aspects of the impacted tooth.",
      difficulty: "hard",
      timeEstimate: 35,
    },
    {
      id: 4,
      specialty: "Oral Surgery",
      type: "multiple-choice",
      question: "What is the primary indication for apicoectomy?",
      options: [
        "Periapical lesion with failed endodontic treatment",
        "Acute pulpitis",
        "Dental trauma",
        "Tooth mobility",
      ],
      answer: "Periapical lesion with failed endodontic treatment",
      explanation:
        "Apicoectomy is indicated when conventional endodontic retreatment is not feasible or has failed to resolve periapical pathology.",
      difficulty: "hard",
      timeEstimate: 50,
    },

    // Endodontics Questions (4)
    {
      id: 5,
      specialty: "Endodontics",
      type: "true-false",
      question:
        "The working length in root canal therapy should terminate at the apical constriction.",
      options: ["True", "False"],
      answer: "True",
      explanation:
        "The apical constriction is the ideal endpoint for cleaning and shaping because it minimizes over-instrumentation.",
      difficulty: "easy",
      timeEstimate: 30,
    },
    {
      id: 6,
      specialty: "Endodontics",
      type: "multiple-choice",
      question:
        "What is the most effective irrigant for dissolving organic tissue?",
      options: ["EDTA", "Sodium hypochlorite", "Saline", "Hydrogen peroxide"],
      answer: "Sodium hypochlorite",
      explanation:
        "Sodium hypochlorite is the most effective irrigant for dissolving organic tissue and has excellent antimicrobial properties.",
      difficulty: "medium",
      timeEstimate: 40,
    },
    {
      id: 7,
      specialty: "Endodontics",
      type: "multiple-choice",
      question: "Which file system is best for curved canals?",
      options: [
        "Stainless steel files",
        "Nickel-titanium files",
        "Carbon steel files",
        "Titanium files",
      ],
      answer: "Nickel-titanium files",
      explanation:
        "Nickel-titanium files have superior flexibility and shape memory, making them ideal for negotiating curved root canals.",
      difficulty: "medium",
      timeEstimate: 45,
    },
    {
      id: 8,
      specialty: "Endodontics",
      type: "true-false",
      question: "Calcium hydroxide can be used as an intracanal medicament.",
      options: ["True", "False"],
      answer: "True",
      explanation:
        "Calcium hydroxide is an excellent intracanal medicament due to its high pH, antimicrobial properties, and ability to neutralize bacterial toxins.",
      difficulty: "easy",
      timeEstimate: 25,
    },

    // Periodontics Questions (4)
    {
      id: 9,
      specialty: "Periodontics",
      type: "multiple-choice",
      question: "What is the primary cause of gingivitis?",
      options: [
        "Genetic factors",
        "Bacterial plaque",
        "Hormonal changes",
        "Nutritional deficiency",
      ],
      answer: "Bacterial plaque",
      explanation:
        "Bacterial plaque is the primary etiological factor in gingivitis, leading to inflammation of the gingival tissues.",
      difficulty: "easy",
      timeEstimate: 30,
    },
    {
      id: 10,
      specialty: "Periodontics",
      type: "multiple-choice",
      question:
        "What is the most reliable clinical sign of periodontal disease progression?",
      options: [
        "Bleeding on probing",
        "Clinical attachment loss",
        "Pocket depth",
        "Tooth mobility",
      ],
      answer: "Clinical attachment loss",
      explanation:
        "Clinical attachment loss is the most reliable indicator of periodontal disease progression as it represents actual loss of periodontal support.",
      difficulty: "medium",
      timeEstimate: 45,
    },
    {
      id: 11,
      specialty: "Periodontics",
      type: "true-false",
      question:
        "Aggressive periodontitis typically affects patients over 35 years of age.",
      options: ["True", "False"],
      answer: "False",
      explanation:
        "Aggressive periodontitis typically affects young individuals, usually before age 35, and is characterized by rapid attachment loss.",
      difficulty: "medium",
      timeEstimate: 35,
    },
    {
      id: 12,
      specialty: "Periodontics",
      type: "multiple-choice",
      question:
        "Which bacteria is most associated with aggressive periodontitis?",
      options: [
        "Porphyromonas gingivalis",
        "Aggregatibacter actinomycetemcomitans",
        "Tannerella forsythia",
        "Treponema denticola",
      ],
      answer: "Aggregatibacter actinomycetemcomitans",
      explanation:
        "Aggregatibacter actinomycetemcomitans is strongly associated with aggressive periodontitis, particularly the localized form.",
      difficulty: "hard",
      timeEstimate: 50,
    },

    // Prosthodontics Questions (4)
    {
      id: 13,
      specialty: "Prosthodontics",
      type: "true-false",
      question:
        "A crown margin should always be placed supragingivally to maintain periodontal health.",
      options: ["True", "False"],
      answer: "False",
      explanation:
        "While supragingival margins are preferred for periodontal health, subgingival placement may be necessary for esthetics, retention, or caries extension.",
      difficulty: "medium",
      timeEstimate: 40,
    },
    {
      id: 14,
      specialty: "Prosthodontics",
      type: "multiple-choice",
      question: "What is the ideal taper for crown preparation?",
      options: [
        "2-5 degrees",
        "6-12 degrees",
        "15-20 degrees",
        "25-30 degrees",
      ],
      answer: "6-12 degrees",
      explanation:
        "The ideal taper for crown preparation is 6-12 degrees total convergence angle to provide adequate retention and resistance form.",
      difficulty: "medium",
      timeEstimate: 45,
    },
    {
      id: 15,
      specialty: "Prosthodontics",
      type: "multiple-choice",
      question:
        "Which impression material provides the highest accuracy for crown and bridge work?",
      options: ["Alginate", "Polyvinyl siloxane", "Polyether", "Polysulfide"],
      answer: "Polyvinyl siloxane",
      explanation:
        "Polyvinyl siloxane (PVS) provides the highest accuracy and dimensional stability, making it ideal for fixed prosthodontics.",
      difficulty: "medium",
      timeEstimate: 40,
    },
    {
      id: 16,
      specialty: "Prosthodontics",
      type: "true-false",
      question:
        "Glass ionomer cement can be used for permanent cementation of metal crowns.",
      options: ["True", "False"],
      answer: "True",
      explanation:
        "Glass ionomer cement has adequate strength for permanent cementation of metal crowns and provides fluoride release and chemical adhesion.",
      difficulty: "easy",
      timeEstimate: 30,
    },

    // Orthodontics Questions (4)
    {
      id: 17,
      specialty: "Orthodontics",
      type: "multiple-choice",
      question:
        "What is the ideal time to start interceptive orthodontic treatment?",
      options: [
        "Primary dentition",
        "Mixed dentition",
        "Permanent dentition",
        "Adult dentition",
      ],
      answer: "Mixed dentition",
      explanation:
        "Mixed dentition is the ideal time for interceptive treatment as it allows for guidance of erupting permanent teeth and correction of developing malocclusions.",
      difficulty: "easy",
      timeEstimate: 35,
    },
    {
      id: 18,
      specialty: "Orthodontics",
      type: "multiple-choice",
      question: "What characterizes a Class II malocclusion?",
      options: [
        "Normal molar relationship",
        "Mesial position of mandible",
        "Distal position of mandible",
        "Crossbite relationship",
      ],
      answer: "Distal position of mandible",
      explanation:
        "Class II malocclusion is characterized by a distal (posterior) position of the mandible relative to the maxilla.",
      difficulty: "medium",
      timeEstimate: 40,
    },
    {
      id: 19,
      specialty: "Orthodontics",
      type: "true-false",
      question:
        "Functional appliances are most effective during the pubertal growth spurt.",
      options: ["True", "False"],
      answer: "True",
      explanation:
        "Functional appliances are most effective during periods of active growth, particularly the pubertal growth spurt when mandibular growth can be stimulated.",
      difficulty: "medium",
      timeEstimate: 35,
    },
    {
      id: 20,
      specialty: "Orthodontics",
      type: "multiple-choice",
      question: "What is the normal overjet measurement?",
      options: ["1-2 mm", "2-4 mm", "4-6 mm", "6-8 mm"],
      answer: "2-4 mm",
      explanation:
        "Normal overjet (horizontal overlap of incisors) ranges from 2-4 mm, providing proper incisal guidance and esthetics.",
      difficulty: "easy",
      timeEstimate: 30,
    },

    // Pediatric Dentistry Questions (3)
    {
      id: 21,
      specialty: "Pediatric Dentistry",
      type: "multiple-choice",
      question: "At what age do the first primary teeth typically erupt?",
      options: ["4-6 months", "6-8 months", "8-10 months", "10-12 months"],
      answer: "6-8 months",
      explanation:
        "The first primary teeth (mandibular central incisors) typically erupt between 6-8 months of age.",
      difficulty: "easy",
      timeEstimate: 25,
    },
    {
      id: 22,
      specialty: "Pediatric Dentistry",
      type: "true-false",
      question: "Fluoride varnish can be applied to primary teeth.",
      options: ["True", "False"],
      answer: "True",
      explanation:
        "Fluoride varnish is safe and effective for caries prevention in primary teeth and can be applied from the time of first tooth eruption.",
      difficulty: "easy",
      timeEstimate: 25,
    },
    {
      id: 23,
      specialty: "Pediatric Dentistry",
      type: "multiple-choice",
      question:
        "What is the most common site for Early Childhood Caries (ECC)?",
      options: [
        "Mandibular molars",
        "Maxillary anterior teeth",
        "Mandibular anterior teeth",
        "Maxillary molars",
      ],
      answer: "Maxillary anterior teeth",
      explanation:
        "Early Childhood Caries typically affects maxillary anterior teeth first due to prolonged bottle feeding or nursing habits.",
      difficulty: "medium",
      timeEstimate: 40,
    },

    // Oral Pathology & Oral Medicine Questions (3)
    {
      id: 24,
      specialty: "Oral Pathology & Oral Medicine",
      type: "multiple-choice",
      question: "What is the most common malignant tumor of the oral cavity?",
      options: [
        "Adenocarcinoma",
        "Squamous cell carcinoma",
        "Melanoma",
        "Sarcoma",
      ],
      answer: "Squamous cell carcinoma",
      explanation:
        "Squamous cell carcinoma accounts for approximately 90% of all malignant oral tumors.",
      difficulty: "medium",
      timeEstimate: 40,
    },
    {
      id: 25,
      specialty: "Oral Pathology & Oral Medicine",
      type: "true-false",
      question: "Leukoplakia is always a premalignant condition.",
      options: ["True", "False"],
      answer: "False",
      explanation:
        "While leukoplakia has malignant potential, not all leukoplakic lesions are premalignant. Biopsy is required for definitive diagnosis.",
      difficulty: "hard",
      timeEstimate: 45,
    },
    {
      id: 26,
      specialty: "Oral Pathology & Oral Medicine",
      type: "multiple-choice",
      question: "Which virus is associated with oral hairy leukoplakia?",
      options: ["HSV-1", "HPV", "EBV", "CMV"],
      answer: "EBV",
      explanation:
        "Oral hairy leukoplakia is associated with Epstein-Barr virus (EBV) and is commonly seen in immunocompromised patients.",
      difficulty: "hard",
      timeEstimate: 50,
    },

    // Community Dentistry Questions (2)
    {
      id: 27,
      specialty: "Community Dentistry",
      type: "multiple-choice",
      question:
        "What is the optimal fluoride concentration in public water supplies?",
      options: ["0.5-1.0 ppm", "0.7-1.2 ppm", "1.0-1.5 ppm", "1.5-2.0 ppm"],
      answer: "0.7-1.2 ppm",
      explanation:
        "The optimal fluoride concentration in public water supplies is 0.7-1.2 ppm to maximize caries prevention while minimizing fluorosis risk.",
      difficulty: "medium",
      timeEstimate: 40,
    },
    {
      id: 28,
      specialty: "Community Dentistry",
      type: "true-false",
      question:
        "Water fluoridation is considered one of the greatest public health achievements.",
      options: ["True", "False"],
      answer: "True",
      explanation:
        "Water fluoridation has been recognized as one of the 10 great public health achievements of the 20th century by the CDC.",
      difficulty: "easy",
      timeEstimate: 25,
    },

    // Radiology Questions (2)
    {
      id: 29,
      specialty: "Radiology",
      type: "multiple-choice",
      question:
        "What is the most common radiographic appearance of periapical abscess?",
      options: [
        "Radiopaque lesion",
        "Radiolucent lesion",
        "Mixed radiolucent-radiopaque",
        "No radiographic changes",
      ],
      answer: "Radiolucent lesion",
      explanation:
        "Periapical abscesses typically appear as radiolucent (dark) lesions at the apex of the affected tooth due to bone destruction.",
      difficulty: "easy",
      timeEstimate: 30,
    },
    {
      id: 30,
      specialty: "Radiology",
      type: "true-false",
      question:
        "CBCT provides better soft tissue contrast than conventional radiographs.",
      options: ["True", "False"],
      answer: "False",
      explanation:
        "CBCT provides excellent bone detail but has limited soft tissue contrast compared to medical CT scans.",
      difficulty: "medium",
      timeEstimate: 35,
    },

    // General Dentistry Questions (2)
    {
      id: 31,
      specialty: "General Dentistry",
      type: "multiple-choice",
      question: "What is the most common cause of tooth loss in adults?",
      options: [
        "Dental caries",
        "Periodontal disease",
        "Trauma",
        "Orthodontic extraction",
      ],
      answer: "Periodontal disease",
      explanation:
        "Periodontal disease is the leading cause of tooth loss in adults, particularly after age 35.",
      difficulty: "easy",
      timeEstimate: 30,
    },
    {
      id: 32,
      specialty: "General Dentistry",
      type: "true-false",
      question:
        "Amalgam restorations should be polished immediately after placement.",
      options: ["True", "False"],
      answer: "False",
      explanation:
        "Amalgam restorations should not be polished immediately after placement. They should be allowed to set for 24 hours before polishing.",
      difficulty: "easy",
      timeEstimate: 25,
    },
  ];

  // Filter questions based on selected specialty
  const filteredQuestions =
    selectedSpecialty === "General Dentistry"
      ? questions
      : questions.filter((q) => q.specialty === selectedSpecialty);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizState.isActive && quizState.timeRemaining > 0) {
      interval = setInterval(() => {
        setQuizState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
    } else if (quizState.timeRemaining === 0 && quizState.isActive) {
      handleQuizComplete();
    }
    return () => clearInterval(interval);
  }, [quizState.isActive, quizState.timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleQuizComplete = () => {
    setQuizState((prev) => ({ ...prev, isActive: false }));
    setShowResults(true);
  };

  const handleAnswerSelect = (answer: string) => {
    // Prevent duplicate selections or changes after submission
    if (quizState.isSubmitting) return;

    const modeSettings = getCurrentModeSettings();
    const currentQ =
      quizState.shuffledQuestions[quizState.currentQuestion] ||
      filteredQuestions[quizState.currentQuestion];
    const isCorrect = answer === currentQ.answer;

    setQuizState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentQuestion]: answer },
      // Track wrong answers for summary
      wrongAnswers: !isCorrect
        ? [
            ...prev.wrongAnswers.filter(
              (wa) => wa.questionIndex !== prev.currentQuestion
            ), // Remove any existing entry for this question
            {
              questionIndex: prev.currentQuestion,
              userAnswer: answer,
              correctAnswer: currentQ.answer,
            },
          ]
        : prev.wrongAnswers.filter(
            (wa) => wa.questionIndex !== prev.currentQuestion
          ), // Remove from wrong answers if now correct
      // Show explanation immediately in Practice Mode
      showExplanation: modeSettings?.showExplanationAfterEachQuestion || false,
    }));
  };

  const handleNextQuestion = () => {
    // Prevent multiple submissions
    if (quizState.isSubmitting) return;

    setQuizState((prev) => ({ ...prev, isSubmitting: true }));

    const currentQ =
      quizState.shuffledQuestions[quizState.currentQuestion] ||
      filteredQuestions[quizState.currentQuestion];
    const selectedAnswer = quizState.answers[quizState.currentQuestion];
    const now = Date.now();
    const timeSpent = Math.floor((now - quizState.questionStartTime) / 1000);

    // Calculate time bonus for this question
    const timeBonus = calculateTimeBonus(timeSpent, currentQ.timeEstimate);

    // Record time spent on this question
    const updatedTimeSpent = {
      ...quizState.timeSpentPerQuestion,
      [quizState.currentQuestion]: timeSpent,
    };

    if (selectedAnswer === currentQ.answer) {
      setQuizState((prev) => ({
        ...prev,
        score: prev.score + 10 + timeBonus,
        timeSpentPerQuestion: updatedTimeSpent,
        questionStartTime: now,
      }));
    } else {
      setQuizState((prev) => ({
        ...prev,
        timeSpentPerQuestion: updatedTimeSpent,
        questionStartTime: now,
      }));
    }

    const questionsToUse =
      quizState.shuffledQuestions.length > 0
        ? quizState.shuffledQuestions
        : filteredQuestions;
    if (quizState.currentQuestion < questionsToUse.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        showExplanation: false, // Reset explanation for next question
        isSubmitting: false, // Reset submission flag
      }));
    } else {
      handleQuizComplete();
    }
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestion > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1,
        showExplanation: false, // Reset explanation when going back
      }));
    }
  };

  const toggleBookmark = () => {
    const questionsToUse =
      quizState.shuffledQuestions.length > 0
        ? quizState.shuffledQuestions
        : filteredQuestions;
    const questionId = questionsToUse[quizState.currentQuestion].id;
    setQuizState((prev) => ({
      ...prev,
      bookmarkedQuestions: prev.bookmarkedQuestions.includes(questionId)
        ? prev.bookmarkedQuestions.filter((id) => id !== questionId)
        : [...prev.bookmarkedQuestions, questionId],
    }));
  };

  const restartQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      answers: {},
      score: 0,
      timeRemaining: 0,
      isActive: false,
      bookmarkedQuestions: [],
      startTime: 0,
      questionStartTime: 0,
      timeSpentPerQuestion: {},
      shuffledQuestions: [],
      wrongAnswers: [],
      showExplanation: false,
      isSubmitting: false,
    });
    setShowResults(false);
    setCurrentStep(0);
  };

  const specialties: Specialty[] = [
    { name: "Oral Surgery", icon: <Target className="w-5 h-5" /> },
    { name: "Endodontics", icon: <Brain className="w-5 h-5" /> },
    { name: "Periodontics", icon: <AlertCircle className="w-5 h-5" /> },
    { name: "Prosthodontics", icon: <Award className="w-5 h-5" /> },
    { name: "Orthodontics", icon: <Zap className="w-5 h-5" /> },
    { name: "Pediatric Dentistry", icon: <BookOpen className="w-5 h-5" /> },
    {
      name: "Oral Pathology & Oral Medicine",
      icon: <Target className="w-5 h-5" />,
    },
    { name: "Community Dentistry", icon: <Users className="w-5 h-5" /> },
    { name: "Radiology", icon: <Brain className="w-5 h-5" /> },
    { name: "General Dentistry", icon: <BookOpen className="w-5 h-5" /> },
  ];

  const timerOptions: TimerOption[] = [
    { name: "Quick Fire", duration: "10 mins", minutes: 10 },
    { name: "Standard", duration: "30 mins", minutes: 30 },
    { name: "Marathon", duration: "60 mins", minutes: 60 },
  ];

  const steps = [
    "Choose Your Mode",
    "Select Specialty",
    "Set Your Timer",
    "Start Quiz",
    "Quiz Active",
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedMode !== "";
      case 1:
        return selectedSpecialty !== "";
      case 2:
        return selectedTimer !== "";
      default:
        return true;
    }
  };

  const getCurrentModeSettings = () => {
    return quizModes.find((m) => m.name === selectedMode)?.settings;
  };

  // Show quiz results
  if (showResults) {
    const questionsToUse =
      quizState.shuffledQuestions.length > 0
        ? quizState.shuffledQuestions
        : filteredQuestions;
    const totalQuestions = questionsToUse.length;
    const correctAnswersCount = Object.keys(quizState.answers).filter(
      (qIdx) => {
        const question = questionsToUse[parseInt(qIdx)];
        return (
          question && quizState.answers[parseInt(qIdx)] === question.answer
        );
      }
    ).length;
    const wrongAnswersCount =
      Object.keys(quizState.answers).length - correctAnswersCount;
    const skippedAnswersCount =
      totalQuestions - Object.keys(quizState.answers).length;

    const totalTimeSpent = Object.values(quizState.timeSpentPerQuestion).reduce(
      (sum, time) => sum + time,
      0
    );
    const averageTime =
      totalQuestions > 0 ? Math.round(totalTimeSpent / totalQuestions) : 0;
    const percentage = Math.round((correctAnswersCount / totalQuestions) * 100);

    const stats = calculateFinalScore({
      totalTime: totalTimeSpent,
      correctAnswers: correctAnswersCount,
      wrongAnswers: wrongAnswersCount,
      timeBonus: quizState.score - correctAnswersCount * 10, // Calculate time bonus from score difference
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Quiz Complete!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {selectedMode} - {selectedSpecialty}
              </p>
            </div>

            {/* Enhanced Statistics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {correctAnswersCount}/{totalQuestions}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Correct Answers
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-500 mb-1">
                  {percentage}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Accuracy
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-500 mb-1">
                  {stats.finalScore}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Final Score
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-500 mb-1">
                  {averageTime}s
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Avg Time/Q
                </div>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Performance Breakdown
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-green-600 text-xl font-bold">
                    {correctAnswersCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Correct
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-red-600 text-xl font-bold">
                    {wrongAnswersCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Wrong
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-600 text-xl font-bold">
                    {skippedAnswersCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Skipped
                  </div>
                </div>
              </div>

              {stats.timeBonus > 0 && (
                <div className="mt-4 text-center">
                  <div className="text-blue-600 text-lg font-semibold">
                    Time Bonus: +{stats.timeBonus} points
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Earned for quick and accurate answers
                  </div>
                </div>
              )}
            </div>

            {/* Wrong Answers Summary (for Challenge/Exam modes) */}
            {getCurrentModeSettings()?.showSummaryAtEnd &&
              quizState.wrongAnswers.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    Review Incorrect Answers
                  </h3>
                  <div className="space-y-4">
                    {quizState.wrongAnswers.map((wrongAnswer, index) => {
                      const question =
                        questionsToUse[wrongAnswer.questionIndex];
                      return (
                        <div
                          key={index}
                          className="border border-slate-200 dark:border-slate-600 rounded-lg p-4"
                        >
                          <div className="mb-3">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                              Question {wrongAnswer.questionIndex + 1}:{" "}
                              {question.question}
                            </h4>
                            <div className="grid gap-2 md:grid-cols-2">
                              <div>
                                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                                  Your Answer:{" "}
                                </span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  {wrongAnswer.userAnswer}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                  Correct Answer:{" "}
                                </span>
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  {wrongAnswer.correctAnswer}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 rounded p-3">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            <div className="flex gap-4 flex-col sm:flex-row justify-center">
              <button
                onClick={restartQuiz}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <span>Take Another Quiz</span>
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz interface
  if (currentStep === 4 && quizState.isActive) {
    const questionsToUse =
      quizState.shuffledQuestions.length > 0
        ? quizState.shuffledQuestions
        : filteredQuestions;
    const currentQuestion = questionsToUse[quizState.currentQuestion];
    const selectedAnswer = quizState.answers[quizState.currentQuestion];
    const modeSettings = getCurrentModeSettings();
    const isBookmarked = quizState.bookmarkedQuestions.includes(
      currentQuestion.id
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Question {quizState.currentQuestion + 1} of{" "}
                  {questionsToUse.length}
                </div>
                <div className="text-sm font-medium text-blue-500">
                  {currentQuestion.specialty}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {modeSettings?.timeLimit && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="font-mono text-orange-500">
                      {formatTime(quizState.timeRemaining)}
                    </span>
                  </div>
                )}
                <button
                  onClick={toggleBookmark}
                  title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    isBookmarked
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-700 hover:text-slate-600"
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((quizState.currentQuestion + 1) / questionsToUse.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentQuestion.type === "multiple-choice"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20"
                      : currentQuestion.type === "true-false"
                      ? "bg-green-100 text-green-600 dark:bg-green-900/20"
                      : "bg-purple-100 text-purple-600 dark:bg-purple-900/20"
                  }`}
                >
                  {currentQuestion.type.replace("-", " ").toUpperCase()}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentQuestion.difficulty === "easy"
                      ? "bg-green-100 text-green-600 dark:bg-green-900/20"
                      : currentQuestion.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20"
                      : "bg-red-100 text-red-600 dark:bg-red-900/20"
                  }`}
                >
                  {currentQuestion.difficulty.toUpperCase()}
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  Est. {currentQuestion.timeEstimate}s
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                {currentQuestion.question}
              </h2>

              {currentQuestion.image && (
                <div className="mb-6">
                  <img
                    src={currentQuestion.image}
                    alt="Question image"
                    className="max-w-full h-auto rounded-lg border border-slate-200 dark:border-slate-600"
                  />
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === option
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === option
                          ? "border-blue-500 bg-blue-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {selectedAnswer === option && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-slate-900 dark:text-slate-100">
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Explanation (Practice Mode) */}
            {quizState.showExplanation && selectedAnswer && (
              <div className="mb-8 p-6 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      selectedAnswer === currentQuestion.answer
                        ? "bg-green-100 text-green-600 dark:bg-green-900/20"
                        : "bg-red-100 text-red-600 dark:bg-red-900/20"
                    }`}
                  >
                    {selectedAnswer === currentQuestion.answer ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`font-semibold mb-2 ${
                        selectedAnswer === currentQuestion.answer
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400"
                      }`}
                    >
                      {selectedAnswer === currentQuestion.answer
                        ? "Correct!"
                        : "Incorrect"}
                    </h3>
                    {selectedAnswer !== currentQuestion.answer && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        The correct answer is:{" "}
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {currentQuestion.answer}
                        </span>
                      </p>
                    )}
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousQuestion}
                disabled={quizState.currentQuestion === 0}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer || quizState.isSubmitting}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
              >
                <span>
                  {quizState.isSubmitting
                    ? "Processing..."
                    : quizState.currentQuestion === filteredQuestions.length - 1
                    ? "Finish"
                    : "Next"}
                </span>
                {!quizState.isSubmitting && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartQuiz = () => {
    const selectedTimerOption = timerOptions.find(
      (t) => t.name === selectedTimer
    );
    const selectedModeSettings = quizModes.find(
      (m) => m.name === selectedMode
    )?.settings;

    // Shuffle questions for randomization
    const questionsToUse =
      selectedSpecialty === "General Dentistry"
        ? questions
        : questions.filter((q) => q.specialty === selectedSpecialty);
    const shuffledQuestions = shuffleArray(questionsToUse);

    const now = Date.now();
    setQuizState({
      currentQuestion: 0,
      answers: {},
      score: 0,
      timeRemaining: selectedModeSettings?.timeLimit
        ? (selectedTimerOption?.minutes || 30) * 60
        : 0,
      isActive: true,
      bookmarkedQuestions: [],
      startTime: now,
      questionStartTime: now,
      timeSpentPerQuestion: {},
      shuffledQuestions,
      wrongAnswers: [],
      showExplanation: false,
      isSubmitting: false,
    });
    setCurrentStep(4); // Move to quiz interface
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 sm:mb-4">
            9ja Dental Quiz
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2 sm:px-0">
            Welcome to the 9ja Dental Quiz! Test your dental knowledge and
            improve your skills with fun and interactive questions.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto pb-2">
          <div className="flex items-center min-w-max px-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium ${
                    index <= currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 ${
                      index < currentStep
                        ? "bg-blue-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-8">
          {/* Step 0: Choose Mode */}
          {currentStep === 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 text-center">
                Choose Your Mode
              </h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                {quizModes.map((mode) => (
                  <div
                    key={mode.name}
                    onClick={() => setSelectedMode(mode.name)}
                    className={`p-4 sm:p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedMode === mode.name
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${mode.color} text-white flex items-center justify-center mb-3 sm:mb-4`}
                    >
                      {mode.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {mode.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {mode.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Select Specialty */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 text-center">
                Select Specialty
              </h2>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {specialties.map((specialty) => (
                  <div
                    key={specialty.name}
                    onClick={() => setSelectedSpecialty(specialty.name)}
                    className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center space-x-2 sm:space-x-3 ${
                      selectedSpecialty === specialty.name
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <div className="text-blue-500 flex-shrink-0">
                      {specialty.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {specialty.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Set Timer */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6 text-center">
                Set Your Timer
              </h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-3 max-w-2xl mx-auto">
                {timerOptions.map((option) => (
                  <div
                    key={option.name}
                    onClick={() => setSelectedTimer(option.name)}
                    className={`p-4 sm:p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center ${
                      selectedTimer === option.name
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2 sm:mb-3" />
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {option.name}
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-blue-500 mb-2">
                      {option.duration}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {option.name === "Quick Fire" &&
                        "Perfect for a quick review"}
                      {option.name === "Standard" &&
                        "Ideal for focused practice"}
                      {option.name === "Marathon" && "Deep learning session"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Start Quiz */}
          {currentStep === 3 && (
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 sm:mb-6">
                Ready to Start!
              </h2>

              {/* Quiz Summary */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">
                  Quiz Summary
                </h3>
                <div className="space-y-2 sm:space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Mode:
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                      {selectedMode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Specialty:
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                      {selectedSpecialty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Duration:
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                      {
                        timerOptions.find((t) => t.name === selectedTimer)
                          ?.duration
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3 sm:mb-4 px-2 sm:px-0">
                  Questions include Multiple Choice, True/False, Image-based
                  diagnosis, and Case Scenarios.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Detailed explanations</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4" />
                    <span>Leaderboard</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                <span>Start Quiz</span>
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-600">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Back
            </button>

            {currentStep < 3 && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="mt-6 sm:mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 text-center">
            Features
          </h3>
          <div className="grid gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              "Detailed explanations after questions in Practice Mode",
              "Timer & progress bar for real-time tracking",
              "Leaderboard & badges in Challenge Mode",
              "Bookmark & review questions",
              "Dark mode & offline support",
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400"
              >
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
