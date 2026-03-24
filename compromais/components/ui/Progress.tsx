import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
  label?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className = '', label }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {label && (
        <span className="text-xs text-slate-500 whitespace-nowrap font-medium">{label}</span>
      )}
    </div>
  );
};
