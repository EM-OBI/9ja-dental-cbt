import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  barClassName?: string;
}

export default function ProgressBar({ 
  progress, 
  className = "w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3",
  barClassName = "bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
}: ProgressBarProps) {
  const progressValue = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={className}>
      <div
        className={barClassName}
        style={{ width: `${progressValue}%` }}
      />
    </div>
  );
}
