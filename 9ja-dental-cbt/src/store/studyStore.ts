import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { StudySession, StudyMaterial, StudyNote, StudyActions } from "./types";
import { addXp } from "./userStore";

interface StudyState {
  currentSession: StudySession | null;
  studyMaterials: StudyMaterial[];
  recentMaterials: StudyMaterial[];
  bookmarkedMaterials: StudyMaterial[];
  studyHistory: StudySession[];
  isLoading: boolean;
  uploadProgress: number;
}

type StudyStore = StudyState & StudyActions;

// Mock study materials
const mockStudyMaterials: StudyMaterial[] = [
  {
    id: "material-1",
    title: "Fundamentals of Oral Pathology",
    type: "pdf",
    url: "/materials/oral-pathology-fundamentals.pdf",
    specialty: "Oral Pathology",
    difficulty: "intermediate",
    uploadDate: "2024-09-01",
    size: 2500000, // 2.5MB
    pages: 45,
    isBookmarked: true,
    progress: 65,
    lastAccessed: "2025-09-07",
    notes: [],
    tags: ["pathology", "diagnosis", "lesions"],
  },
  {
    id: "material-2",
    title: "Endodontic Treatment Procedures",
    type: "video",
    url: "/materials/endodontic-procedures.mp4",
    specialty: "Endodontics",
    difficulty: "advanced",
    uploadDate: "2024-08-15",
    size: 15000000, // 15MB
    duration: 1800, // 30 minutes
    isBookmarked: false,
    progress: 30,
    lastAccessed: "2025-09-05",
    notes: [],
    tags: ["endodontics", "procedures", "root-canal"],
  },
  {
    id: "material-3",
    title: "Periodontal Disease Classification",
    type: "article",
    url: "/materials/periodontal-classification.html",
    specialty: "Periodontics",
    difficulty: "beginner",
    uploadDate: "2024-09-03",
    size: 500000, // 500KB
    isBookmarked: true,
    progress: 100,
    lastAccessed: "2025-09-08",
    notes: [],
    tags: ["periodontics", "classification", "diagnosis"],
  },
];

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      studyMaterials: mockStudyMaterials,
      recentMaterials: [],
      bookmarkedMaterials: [],
      studyHistory: [],
      isLoading: false,
      uploadProgress: 0,

      // Actions
      startStudySession: (materialId: string) => {
        const material = get().studyMaterials.find((m) => m.id === materialId);
        if (!material) return;

        const newSession: StudySession = {
          id: `study-${Date.now()}`,
          userId: "user-123", // Get from user store
          materialId,
          startTime: new Date().toISOString(),
          duration: 0,
          focusTime: 0,
          breaks: 0,
          notes: [],
          isActive: true,
        };

        // Update material's last accessed date
        const updatedMaterials = get().studyMaterials.map((m) =>
          m.id === materialId
            ? { ...m, lastAccessed: new Date().toISOString() }
            : m
        );

        set({
          currentSession: newSession,
          studyMaterials: updatedMaterials,
        });
      },

      pauseStudySession: () => {
        const session = get().currentSession;
        if (!session || !session.isActive) return;

        const now = new Date();
        const startTime = new Date(session.startTime);
        const duration = Math.floor(
          (now.getTime() - startTime.getTime()) / 1000
        );

        set({
          currentSession: {
            ...session,
            duration,
            isActive: false,
          },
        });
      },

      resumeStudySession: () => {
        const session = get().currentSession;
        if (!session || session.isActive) return;

        set({
          currentSession: {
            ...session,
            isActive: true,
          },
        });
      },

      endStudySession: () => {
        const session = get().currentSession;
        if (!session) return;

        const now = new Date();
        const startTime = new Date(session.startTime);
        const totalDuration = Math.floor(
          (now.getTime() - startTime.getTime()) / 1000
        );

        const completedSession: StudySession = {
          ...session,
          endTime: now.toISOString(),
          duration: totalDuration,
          isActive: false,
        };

        // Calculate XP reward based on study time
        const minutes = Math.floor(totalDuration / 60);
        const xpReward = Math.min(minutes * 2, 100); // 2 XP per minute, max 100
        addXp(xpReward);

        // Update study history
        set({
          currentSession: null,
          studyHistory: [completedSession, ...get().studyHistory],
        });

        return completedSession;
      },

      addNote: (note: Omit<StudyNote, "id" | "timestamp">) => {
        const session = get().currentSession;
        if (!session) return;

        const newNote: StudyNote = {
          ...note,
          id: `note-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };

        set({
          currentSession: {
            ...session,
            notes: [...session.notes, newNote],
          },
        });

        // Also add to the material's notes
        const updatedMaterials = get().studyMaterials.map((material) =>
          material.id === session.materialId
            ? { ...material, notes: [...material.notes, newNote] }
            : material
        );

        set({ studyMaterials: updatedMaterials });
      },

      updateNote: (noteId: string, updates: Partial<StudyNote>) => {
        const session = get().currentSession;
        if (!session) return;

        const updatedNotes = session.notes.map((note) =>
          note.id === noteId ? { ...note, ...updates } : note
        );

        set({
          currentSession: {
            ...session,
            notes: updatedNotes,
          },
        });

        // Also update the material's notes
        const updatedMaterials = get().studyMaterials.map((material) =>
          material.id === session.materialId
            ? {
                ...material,
                notes: material.notes.map((note) =>
                  note.id === noteId ? { ...note, ...updates } : note
                ),
              }
            : material
        );

        set({ studyMaterials: updatedMaterials });
      },

      deleteNote: (noteId: string) => {
        const session = get().currentSession;
        if (!session) return;

        const updatedNotes = session.notes.filter((note) => note.id !== noteId);

        set({
          currentSession: {
            ...session,
            notes: updatedNotes,
          },
        });

        // Also remove from the material's notes
        const updatedMaterials = get().studyMaterials.map((material) =>
          material.id === session.materialId
            ? {
                ...material,
                notes: material.notes.filter((note) => note.id !== noteId),
              }
            : material
        );

        set({ studyMaterials: updatedMaterials });
      },

      bookmarkMaterial: (materialId: string) => {
        const updatedMaterials = get().studyMaterials.map((material) =>
          material.id === materialId
            ? { ...material, isBookmarked: !material.isBookmarked }
            : material
        );

        const bookmarkedMaterials = updatedMaterials.filter(
          (m) => m.isBookmarked
        );

        set({
          studyMaterials: updatedMaterials,
          bookmarkedMaterials,
        });
      },

      updateProgress: (materialId: string, progress: number) => {
        const updatedMaterials = get().studyMaterials.map((material) =>
          material.id === materialId
            ? { ...material, progress: Math.max(0, Math.min(100, progress)) }
            : material
        );

        set({ studyMaterials: updatedMaterials });

        // Award XP for progress milestones
        const material = updatedMaterials.find((m) => m.id === materialId);
        if (material && progress === 100 && material.progress < 100) {
          addXp(50); // Completion bonus
        }
      },

      uploadMaterial: async (
        material: Omit<StudyMaterial, "id" | "uploadDate">
      ) => {
        set({ isLoading: true, uploadProgress: 0 });

        try {
          // Simulate upload progress
          for (let i = 0; i <= 100; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            set({ uploadProgress: i });
          }

          const newMaterial: StudyMaterial = {
            ...material,
            id: `material-${Date.now()}`,
            uploadDate: new Date().toISOString(),
            progress: 0,
            notes: [],
          };

          set({
            studyMaterials: [newMaterial, ...get().studyMaterials],
            isLoading: false,
            uploadProgress: 0,
          });

          return newMaterial;
        } catch (error) {
          console.error("Error uploading material:", error);
          set({ isLoading: false, uploadProgress: 0 });
          throw error;
        }
      },
    }),
    {
      name: "study-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        studyMaterials: state.studyMaterials,
        bookmarkedMaterials: state.bookmarkedMaterials,
        studyHistory: state.studyHistory,
        // Don't persist current session to avoid stale state
      }),
    }
  )
);

// Helper functions
export const getStudyStats = () => {
  const { studyHistory, studyMaterials } = useStudyStore.getState();

  const totalHours =
    studyHistory.reduce((total, session) => total + session.duration, 0) / 3600;
  const materialsCompleted = studyMaterials.filter(
    (m) => m.progress === 100
  ).length;
  const totalNotes = studyMaterials.reduce(
    (total, material) => total + material.notes.length,
    0
  );
  const averageProgress =
    studyMaterials.reduce((total, material) => total + material.progress, 0) /
    studyMaterials.length;

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    materialsCompleted,
    totalMaterials: studyMaterials.length,
    totalNotes,
    averageProgress: Math.round(averageProgress),
    recentSessions: studyHistory.slice(0, 5),
  };
};

export const getRecentMaterials = () => {
  const { studyMaterials } = useStudyStore.getState();

  return studyMaterials
    .filter((material) => material.lastAccessed)
    .sort((a, b) => {
      const dateA = a.lastAccessed ? new Date(a.lastAccessed).getTime() : 0;
      const dateB = b.lastAccessed ? new Date(b.lastAccessed).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);
};

export const getBookmarkedMaterials = () => {
  const { studyMaterials } = useStudyStore.getState();
  return studyMaterials.filter((material) => material.isBookmarked);
};

export const searchMaterials = (
  query: string,
  filters?: {
    specialty?: string;
    difficulty?: string;
    type?: string;
  }
) => {
  const { studyMaterials } = useStudyStore.getState();

  return studyMaterials.filter((material) => {
    const matchesQuery =
      query === "" ||
      material.title.toLowerCase().includes(query.toLowerCase()) ||
      material.tags.some((tag) =>
        tag.toLowerCase().includes(query.toLowerCase())
      );

    const matchesSpecialty =
      !filters?.specialty || material.specialty === filters.specialty;
    const matchesDifficulty =
      !filters?.difficulty || material.difficulty === filters.difficulty;
    const matchesType = !filters?.type || material.type === filters.type;

    return matchesQuery && matchesSpecialty && matchesDifficulty && matchesType;
  });
};
