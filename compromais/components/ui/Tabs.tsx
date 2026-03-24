import React from 'react';

interface TabsProps {
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ className = '', children }) => (
  <div className={className}>{children}</div>
);

export const TabsList: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`inline-flex items-center gap-1 border-b border-slate-200 ${className}`}>
    {children}
  </div>
);

interface TabsTriggerProps {
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ active, onClick, className = '', children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
    } ${className}`}
  >
    {children}
  </button>
);
