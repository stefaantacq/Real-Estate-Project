import React from 'react';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'draft' | 'active' | 'archived' | 'destructive';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-blue-100 text-blue-700 border-blue-200',
  secondary: 'bg-slate-100 text-slate-600 border-slate-200',
  outline: 'bg-white text-slate-600 border-slate-200',
  draft: 'bg-blue-50 text-blue-700 border-blue-200',
  active: 'bg-amber-50 text-amber-800 border-amber-200',
  archived: 'bg-slate-100 text-slate-600 border-slate-200',
  destructive: 'bg-red-50 text-red-700 border-red-200',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = '',
  children,
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
