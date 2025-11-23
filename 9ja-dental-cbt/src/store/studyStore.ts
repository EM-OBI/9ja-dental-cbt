import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  StudySession,
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
  aiGeneratedPackages: AIStudyPackage[];
  activeJobs: Map<string, JobStatus>;
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

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      aiGeneratedPackages: [],
      activeJobs: new Map(),
      isLoading: false,
      uploadProgress: 0,
      studyPageUI: {
        activeTab: "topic",
        topicInput: "",
        notesInput: "",
        materialTypes: ["summary"],
      },

      // Actions


      startStudySession: (materialId: string) => {
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

        set({
          currentSession: newSession,
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

        set({
          currentSession: null,
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

    }),
    {
      name: getStudyStorageKey(),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        aiGeneratedPackages: state.aiGeneratedPackages,
        studyPageUI: state.studyPageUI, // Persist UI state
        // Don't persist current session, active jobs, or upload progress to avoid stale state
      }),
    }
  )
);

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
