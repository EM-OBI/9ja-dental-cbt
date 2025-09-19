import type { StatsData, Question } from "@/types/definitions";

export const mockStatsData: StatsData = {
  questions: 1,
  satisfactionRate: "98%",
  countries: 1,
};

export const mockQuestions: Question[] = [
  // Oral Surgery Questions
  {
    id: "os-001",
    text: "Which nerve is most commonly injured during third molar extraction?",
    options: [
      "Lingual nerve",
      "Inferior alveolar nerve",
      "Buccal nerve",
      "Hypoglossal nerve",
    ],
    correctAnswer: 1,
    explanation:
      "The inferior alveolar nerve runs close to the roots of mandibular third molars, making it the most commonly injured during extraction.",
    specialty: "Oral Surgery",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 45,
  },
  {
    id: "os-002",
    text: "What is the most important factor in preventing dry socket?",
    options: [
      "Antibiotics",
      "Gentle extraction technique",
      "Smoking cessation",
      "Mouth rinse",
    ],
    correctAnswer: 1,
    explanation:
      "Gentle extraction technique that preserves the blood clot is the most critical factor in preventing dry socket (alveolar osteitis).",
    specialty: "Oral Surgery",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 40,
  },
  {
    id: "os-003",
    text: "The coronoid process should be removed when extracting impacted mandibular third molars.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation:
      "The coronoid process should be preserved. Bone removal should be limited to the buccal and distal aspects of the impacted tooth.",
    specialty: "Oral Surgery",
    difficulty: "hard",
    type: "true-false",
    timeEstimate: 35,
  },
  {
    id: "os-004",
    text: "What is the primary indication for apicoectomy?",
    options: [
      "Periapical lesion with failed endodontic treatment",
      "Acute pulpitis",
      "Dental trauma",
      "Tooth mobility",
    ],
    correctAnswer: 0,
    explanation:
      "Apicoectomy is indicated when conventional endodontic retreatment is not feasible or has failed to resolve periapical pathology.",
    specialty: "Oral Surgery",
    difficulty: "hard",
    type: "mcq",
    timeEstimate: 50,
  },

  // Endodontics Questions
  {
    id: "endo-001",
    text: "The working length in root canal therapy should terminate at the apical constriction.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation:
      "The apical constriction is the ideal endpoint for cleaning and shaping because it minimizes over-instrumentation.",
    specialty: "Endodontics",
    difficulty: "easy",
    type: "true-false",
    timeEstimate: 30,
  },
  {
    id: "endo-002",
    text: "What is the most effective irrigant for dissolving organic tissue?",
    options: ["EDTA", "Sodium hypochlorite", "Saline", "Hydrogen peroxide"],
    correctAnswer: 1,
    explanation:
      "Sodium hypochlorite is the most effective irrigant for dissolving organic tissue and has excellent antimicrobial properties.",
    specialty: "Endodontics",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 40,
  },
  {
    id: "endo-003",
    text: "Which file system is best for curved canals?",
    options: [
      "Stainless steel files",
      "Nickel-titanium files",
      "Carbon steel files",
      "Titanium files",
    ],
    correctAnswer: 1,
    explanation:
      "Nickel-titanium files have superior flexibility and shape memory, making them ideal for negotiating curved root canals.",
    specialty: "Endodontics",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 45,
  },
  {
    id: "endo-004",
    text: "Calcium hydroxide can be used as an intracanal medicament.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation:
      "Calcium hydroxide is an excellent intracanal medicament due to its high pH, antimicrobial properties, and ability to neutralize bacterial toxins.",
    specialty: "Endodontics",
    difficulty: "easy",
    type: "true-false",
    timeEstimate: 25,
  },

  // Periodontics Questions
  {
    id: "perio-001",
    text: "What is the primary cause of gingivitis?",
    options: [
      "Genetic factors",
      "Bacterial plaque",
      "Hormonal changes",
      "Nutritional deficiency",
    ],
    correctAnswer: 1,
    explanation:
      "Bacterial plaque is the primary etiological factor in gingivitis, leading to inflammation of the gingival tissues.",
    specialty: "Periodontics",
    difficulty: "easy",
    type: "mcq",
    timeEstimate: 30,
  },
  {
    id: "perio-002",
    text: "What is the most reliable clinical sign of periodontal disease progression?",
    options: [
      "Bleeding on probing",
      "Clinical attachment loss",
      "Pocket depth",
      "Tooth mobility",
    ],
    correctAnswer: 1,
    explanation:
      "Clinical attachment loss is the most reliable indicator of periodontal disease progression as it represents actual loss of periodontal support.",
    specialty: "Periodontics",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 45,
  },
  {
    id: "perio-003",
    text: "Aggressive periodontitis typically affects patients over 35 years of age.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation:
      "Aggressive periodontitis typically affects young individuals, usually before age 35, and is characterized by rapid attachment loss.",
    specialty: "Periodontics",
    difficulty: "medium",
    type: "true-false",
    timeEstimate: 35,
  },
  {
    id: "perio-004",
    text: "Which bacteria is most associated with aggressive periodontitis?",
    options: [
      "Porphyromonas gingivalis",
      "Aggregatibacter actinomycetemcomitans",
      "Tannerella forsythia",
      "Treponema denticola",
    ],
    correctAnswer: 1,
    explanation:
      "Aggregatibacter actinomycetemcomitans is strongly associated with aggressive periodontitis, particularly the localized form.",
    specialty: "Periodontics",
    difficulty: "hard",
    type: "mcq",
    timeEstimate: 50,
  },

  // Prosthodontics Questions
  {
    id: "prosth-001",
    text: "A crown margin should always be placed supragingivally to maintain periodontal health.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation:
      "While supragingival margins are preferred for periodontal health, subgingival placement may be necessary for esthetics, retention, or caries extension.",
    specialty: "Prosthodontics",
    difficulty: "medium",
    type: "true-false",
    timeEstimate: 40,
  },
  {
    id: "prosth-002",
    text: "What is the ideal taper for crown preparation?",
    options: ["2-5 degrees", "6-12 degrees", "15-20 degrees", "25-30 degrees"],
    correctAnswer: 1,
    explanation:
      "The ideal taper for crown preparation is 6-12 degrees total convergence angle to provide adequate retention and resistance form.",
    specialty: "Prosthodontics",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 45,
  },
  {
    id: "prosth-003",
    text: "Which impression material provides the highest accuracy for crown and bridge work?",
    options: ["Alginate", "Polyvinyl siloxane", "Polyether", "Polysulfide"],
    correctAnswer: 1,
    explanation:
      "Polyvinyl siloxane (PVS) provides the highest accuracy and dimensional stability, making it ideal for fixed prosthodontics.",
    specialty: "Prosthodontics",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 40,
  },
  {
    id: "prosth-004",
    text: "Glass ionomer cement can be used for permanent cementation of metal crowns.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation:
      "Glass ionomer cement has adequate strength for permanent cementation of metal crowns and provides fluoride release and chemical adhesion.",
    specialty: "Prosthodontics",
    difficulty: "easy",
    type: "true-false",
    timeEstimate: 30,
  },

  // Orthodontics Questions
  {
    id: "ortho-001",
    text: "What is the ideal time to start interceptive orthodontic treatment?",
    options: [
      "Primary dentition",
      "Mixed dentition",
      "Permanent dentition",
      "Adult dentition",
    ],
    correctAnswer: 1,
    explanation:
      "Mixed dentition is the ideal time for interceptive treatment as it allows for guidance of erupting permanent teeth and correction of developing malocclusions.",
    specialty: "Orthodontics",
    difficulty: "easy",
    type: "mcq",
    timeEstimate: 35,
  },
  {
    id: "ortho-002",
    text: "What characterizes a Class II malocclusion?",
    options: [
      "Normal molar relationship",
      "Mesial position of mandible",
      "Distal position of mandible",
      "Crossbite relationship",
    ],
    correctAnswer: 2,
    explanation:
      "Class II malocclusion is characterized by a distal (posterior) position of the mandible relative to the maxilla.",
    specialty: "Orthodontics",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 40,
  },
  {
    id: "ortho-003",
    text: "Functional appliances are most effective during the pubertal growth spurt.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation:
      "Functional appliances are most effective during periods of active growth, particularly the pubertal growth spurt when mandibular growth can be stimulated.",
    specialty: "Orthodontics",
    difficulty: "medium",
    type: "true-false",
    timeEstimate: 35,
  },
  {
    id: "ortho-004",
    text: "What is the normal overjet measurement?",
    options: ["1-2 mm", "2-4 mm", "4-6 mm", "6-8 mm"],
    correctAnswer: 1,
    explanation:
      "Normal overjet (horizontal overlap of incisors) ranges from 2-4 mm, providing proper incisal guidance and esthetics.",
    specialty: "Orthodontics",
    difficulty: "easy",
    type: "mcq",
    timeEstimate: 30,
  },

  // Pediatric Dentistry Questions
  {
    id: "pedo-001",
    text: "At what age do the first primary teeth typically erupt?",
    options: ["4-6 months", "6-8 months", "8-10 months", "10-12 months"],
    correctAnswer: 1,
    explanation:
      "The first primary teeth (mandibular central incisors) typically erupt between 6-8 months of age.",
    specialty: "Pediatric Dentistry",
    difficulty: "easy",
    type: "mcq",
    timeEstimate: 25,
  },
  {
    id: "pedo-002",
    text: "Fluoride varnish can be applied to primary teeth.",
    options: ["True", "False"],
    correctAnswer: 0,
    explanation:
      "Fluoride varnish is safe and effective for caries prevention in primary teeth and can be applied from the time of first tooth eruption.",
    specialty: "Pediatric Dentistry",
    difficulty: "easy",
    type: "true-false",
    timeEstimate: 25,
  },
  {
    id: "pedo-003",
    text: "What is the most common site for Early Childhood Caries (ECC)?",
    options: [
      "Mandibular molars",
      "Maxillary anterior teeth",
      "Mandibular anterior teeth",
      "Maxillary molars",
    ],
    correctAnswer: 1,
    explanation:
      "Early Childhood Caries typically affects maxillary anterior teeth first due to prolonged bottle feeding or nursing habits.",
    specialty: "Pediatric Dentistry",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 40,
  },

  // Add more questions for other specialties...
  // Oral Pathology & Oral Medicine
  {
    id: "path-001",
    text: "What is the most common malignant tumor of the oral cavity?",
    options: [
      "Adenocarcinoma",
      "Squamous cell carcinoma",
      "Melanoma",
      "Sarcoma",
    ],
    correctAnswer: 1,
    explanation:
      "Squamous cell carcinoma accounts for approximately 90% of all malignant oral tumors.",
    specialty: "Oral Pathology & Oral Medicine",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 40,
  },
  {
    id: "path-002",
    text: "Leukoplakia is always a premalignant condition.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation:
      "While leukoplakia has malignant potential, not all leukoplakic lesions are premalignant. Biopsy is required for definitive diagnosis.",
    specialty: "Oral Pathology & Oral Medicine",
    difficulty: "hard",
    type: "true-false",
    timeEstimate: 45,
  },

  // Community Dentistry
  {
    id: "comm-001",
    text: "What is the optimal fluoride concentration in public water supplies?",
    options: ["0.5-1.0 ppm", "0.7-1.2 ppm", "1.0-1.5 ppm", "1.5-2.0 ppm"],
    correctAnswer: 1,
    explanation:
      "The optimal fluoride concentration in public water supplies is 0.7-1.2 ppm to maximize caries prevention while minimizing fluorosis risk.",
    specialty: "Community Dentistry",
    difficulty: "medium",
    type: "mcq",
    timeEstimate: 40,
  },

  // Radiology
  {
    id: "radio-001",
    text: "What is the most common radiographic appearance of periapical abscess?",
    options: [
      "Radiopaque lesion",
      "Radiolucent lesion",
      "Mixed radiolucent-radiopaque",
      "No radiographic changes",
    ],
    correctAnswer: 1,
    explanation:
      "Periapical abscesses typically appear as radiolucent (dark) lesions at the apex of the affected tooth due to bone destruction.",
    specialty: "Radiology",
    difficulty: "easy",
    type: "mcq",
    timeEstimate: 30,
  },

  // General Dentistry
  {
    id: "gen-001",
    text: "What is the most common cause of tooth loss in adults?",
    options: [
      "Dental caries",
      "Periodontal disease",
      "Trauma",
      "Orthodontic extraction",
    ],
    correctAnswer: 1,
    explanation:
      "Periodontal disease is the leading cause of tooth loss in adults, particularly after age 35.",
    specialty: "General Dentistry",
    difficulty: "easy",
    type: "mcq",
    timeEstimate: 30,
  },
  {
    id: "gen-002",
    text: "Amalgam restorations should be polished immediately after placement.",
    options: ["True", "False"],
    correctAnswer: 1,
    explanation:
      "Amalgam restorations should not be polished immediately after placement. They should be allowed to set for 24 hours before polishing.",
    specialty: "General Dentistry",
    difficulty: "easy",
    type: "true-false",
    timeEstimate: 25,
  },
];

// Helper function to get questions by specialty
export function getQuestionsBySpecialty(specialty: string): Question[] {
  if (specialty === "General Dentistry" || specialty === "All Specialties") {
    return mockQuestions;
  }
  return mockQuestions.filter((q) => q.specialty === specialty);
}

// Helper function to get question count by specialty
export function getQuestionCountBySpecialty(): Record<string, number> {
  const counts: Record<string, number> = {};

  mockQuestions.forEach((q) => {
    counts[q.specialty] = (counts[q.specialty] || 0) + 1;
  });

  counts["General Dentistry"] = mockQuestions.length;

  return counts;
}
