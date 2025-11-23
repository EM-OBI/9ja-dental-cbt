"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, ClipboardCheck } from "lucide-react";

interface QuickActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickActionMenu({
  isOpen,
  onClose,
}: QuickActionMenuProps) {
  const router = useRouter();

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => onClose()}
        className={`fixed bottom-20 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center group ${
          isOpen ? "z-[70]" : "z-50"
        }`}
        aria-label="Quick Actions"
      >
        <Plus
          className={`w-6 h-6 transition-transform duration-200 ${
            isOpen ? "rotate-45" : "group-hover:rotate-90"
          }`}
        />
      </button>

      {/* Quick Action Popup - Positioned near FAB */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[65] bg-black/20" onClick={onClose} />

          {/* Modal */}
          <div className="fixed bottom-36 right-6 z-[68] w-56 bg-white dark:bg-card rounded-lg shadow-lg border border-slate-200 dark:border-border overflow-hidden">
            {/* Take a Test */}
            <button
              onClick={() => {
                onClose();
                router.push("/quiz");
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group border-b border-slate-100 dark:border-slate-800"
            >
              <div className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Take a Test
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Start quiz
                </p>
              </div>
            </button>

            {/* Study Materials */}
            <button
              onClick={() => {
                onClose();
                router.push("/study");
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
            >
              <div className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  Study
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review topics
                </p>
              </div>
            </button>
          </div>
        </>
      )}
    </>
  );
}
