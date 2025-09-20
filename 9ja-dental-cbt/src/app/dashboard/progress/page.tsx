"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProgressRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard overview page
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl m-4 p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mb-4"></div>
      <p className="text-slate-600 dark:text-slate-400 font-medium">
        Redirecting to your learning dashboard...
      </p>
    </div>
  );
}
