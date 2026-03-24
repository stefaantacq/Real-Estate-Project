import React from 'react';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
type ButtonSize = 'default' | 'sm' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-xs',
  icon: 'p-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
