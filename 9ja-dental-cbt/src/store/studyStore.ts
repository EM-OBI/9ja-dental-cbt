import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  StudySession,
  StudyMaterial,
  StudyNote,
  StudyActions,
  AIStudyPackage,
  JobStatus,
  StudyPageUIState,
} from "./types";
import { addXp, getCurrentUserId } from "./userStore";
import { nanoid } from "nanoid";

interface StudyState {
  currentSession: StudySession | null;
  studyMaterials: StudyMaterial[];
  aiGeneratedPackages: AIStudyPackage[];
  activeJobs: Map<string, JobStatus>;
  recentMaterials: StudyMaterial[];
  bookmarkedMaterials: StudyMaterial[];
  studyHistory: StudySession[];
  isLoading: boolean;
  uploadProgress: number;
  // UI State
  studyPageUI: StudyPageUIState;
}

type StudyStore = StudyState & StudyActions;

// Create a user-specific storage key
const getStudyStorageKey = () => {
  const userId = getCurrentUserId();
  return userId ? `study-${userId}` : "study-guest";
};

// Study materials will be fetched from the API

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      studyMaterials: [], // Will be loaded from API
      aiGeneratedPackages: [],
      activeJobs: new Map(),
      recentMaterials: [],
      bookmarkedMaterials: [],
      studyHistory: [],
      isLoading: false,
      uploadProgress: 0,
      studyPageUI: {
        activeTab: "topic",
        topicInput: "",
        notesInput: "",
        materialTypes: ["summary"],
      },

      // Actions
      // Fetch study materials from API
      fetchStudyMaterials: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch("/api/study/materials");
          const result = (await response.json()) as {
            success: boolean;
            data?: StudyMaterial[];
            error?: string;
          };

          if (result.success && result.data) {
            set({
              studyMaterials: result.data,
              recentMaterials: result.data.slice(0, 5), // Last 5 accessed
              bookmarkedMaterials: result.data.filter(
                (m: StudyMaterial) => m.isBookmarked
              ),
              isLoading: false,
            });
          } else {
            console.error("Failed to fetch study materials:", result.error);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error fetching study materials:", error);
          set({ isLoading: false });
        }
      },

      startStudySession: (materialId: string) => {
        const material = get().studyMaterials.find((m) => m.id === materialId);
        if (!material) return;

        const userId = getCurrentUserId();
        if (!userId) {
          console.warn(
            "Attempted to start a study session without an authenticated user"
          );
          return;
        }

        const newSession: StudySession = {
          id: `study-${Date.now()}`,
          userId,
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

      // AI-generated materials actions
      addAIPackage: (packageData) => {
        const packageId = nanoid();
        const newPackage: AIStudyPackage = {
          ...packageData,
          id: packageId,
          generatedAt: new Date().toISOString(),
        };

        set({
          aiGeneratedPackages: [newPackage, ...get().aiGeneratedPackages],
        });

        return packageId;
      },

      updateAIPackage: (packageId, updates) => {
        const updatedPackages = get().aiGeneratedPackages.map((pkg) =>
          pkg.id === packageId ? { ...pkg, ...updates } : pkg
        );

        set({ aiGeneratedPackages: updatedPackages });
      },

      deleteAIPackage: (packageId) => {
        const filteredPackages = get().aiGeneratedPackages.filter(
          (pkg) => pkg.id !== packageId
        );

        set({ aiGeneratedPackages: filteredPackages });
      },

      getAIPackage: (packageId) => {
        return get().aiGeneratedPackages.find((pkg) => pkg.id === packageId);
      },

      updateJobStatus: (jobId, status) => {
        const jobs = new Map(get().activeJobs);
        jobs.set(jobId, status);

        set({ activeJobs: jobs });

        // If job is completed, update the corresponding package
        if (status.status === "COMPLETED" && status.packageId) {
          get().updateAIPackage(status.packageId, {
            status: "completed",
            progress: 100,
          });
        } else if (status.status === "FAILED" && status.packageId) {
          get().updateAIPackage(status.packageId, {
            status: "error",
            error: status.error || "Generation failed",
          });
        }
      },

      // UI state actions
      updateStudyPageUI: (updates) => {
        set({
          studyPageUI: {
            ...get().studyPageUI,
            ...updates,
          },
        });
      },

      resetStudyPageUI: () => {
        set({
          studyPageUI: {
            activeTab: "topic",
            topicInput: "",
            notesInput: "",
            materialTypes: ["summary"],
          },
        });
      },

      // Database integration actions
      loadStudySessionsFromDatabase: async (userId: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`/api/users/${userId}/study-sessions`);
          const data = (await response.json()) as {
            success: boolean;
            data?: Array<{
              id: string;
              userId: string;
              materialId: string;
              startTime: string;
              endTime?: string;
              duration: number;
              focusTime: number;
              breaks: number;
              isActive: boolean;
            }>;
          };

          if (data.success && data.data) {
            // Transform API sessions to store format
            const sessions: StudySession[] = data.data.map((s) => ({
              ...s,
              notes: [], // Notes would need to be fetched separately if needed
            }));

            set({
              studyHistory: sessions,
              isLoading: false,
            });
          } else {
            console.error("Failed to load study sessions from database");
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error loading study sessions:", error);
          set({ isLoading: false });
        }
      },

      saveStudySessionToDatabase: async (session: StudySession) => {
        try {
          const response = await fetch(
            `/api/users/${session.userId}/study-sessions`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                materialId: session.materialId,
                startTime: session.startTime,
                endTime: session.endTime,
                duration: session.duration,
                focusTime: session.focusTime,
                breaks: session.breaks,
              }),
            }
          );

          const data = (await response.json()) as {
            success: boolean;
            error?: string;
          };
          if (!data.success) {
            console.error("Failed to save study session:", data.error);
          }
        } catch (error) {
          console.error("Error saving study session:", error);
        }
      },
    }),
    {
      name: getStudyStorageKey(),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        studyMaterials: state.studyMaterials,
        aiGeneratedPackages: state.aiGeneratedPackages,
        bookmarkedMaterials: state.bookmarkedMaterials,
        studyHistory: state.studyHistory,
        studyPageUI: state.studyPageUI, // Persist UI state
        // Don't persist current session, active jobs, or upload progress to avoid stale state
      }),
    }
  )
);

// Helper functions
export const getStudyStats = () => {
  const { studyHistory, studyMaterials } = useStudyStore.getState();

  const totalSeconds = studyHistory.reduce(
    (total, session) => total + session.duration,
    0
  );
  const totalHours = totalSeconds / 3600;
  const totalMinutes = Math.round(totalSeconds / 60);
  const materialsCompleted = studyMaterials.filter(
    (m) => m.progress === 100
  ).length;
  const totalNotes = studyMaterials.reduce(
    (total, material) => total + material.notes.length,
    0
  );
  const totalProgress = studyMaterials.reduce(
    (total, material) => total + material.progress,
    0
  );
  const averageProgress =
    studyMaterials.length > 0 ? totalProgress / studyMaterials.length : 0;

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    totalMinutes,
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

// AI-generated materials helpers
export const getAIPackages = () => {
  const { aiGeneratedPackages } = useStudyStore.getState();
  return aiGeneratedPackages;
};

export const getCompletedAIPackages = () => {
  const { aiGeneratedPackages } = useStudyStore.getState();
  return aiGeneratedPackages.filter((pkg) => pkg.status === "completed");
};

export const getAIPackagesBySource = (source: "topic" | "notes" | "pdf") => {
  const { aiGeneratedPackages } = useStudyStore.getState();
  return aiGeneratedPackages.filter((pkg) => pkg.source === source);
};

export const getActiveJobs = () => {
  const { activeJobs } = useStudyStore.getState();
  return Array.from(activeJobs.values());
};
