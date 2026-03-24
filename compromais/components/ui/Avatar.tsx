import React from 'react';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  default: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export const Avatar: React.FC<AvatarProps> = ({
  name = 'U',
  size = 'default',
  className = '',
  onClick,
  active = false,
}) => {
  const initials = name.charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold transition-all duration-150 ${
        active
          ? 'ring-2 ring-blue-600 bg-blue-600 text-white'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${className}`}
    >
      {initials}
    </button>
  );
};
