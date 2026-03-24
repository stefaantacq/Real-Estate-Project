import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ className = '', children, onClick }) => (
  <div
    className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-6 pb-0 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <h3 className={`text-sm font-semibold text-slate-900 ${className}`}>
    {children}
  </h3>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);
