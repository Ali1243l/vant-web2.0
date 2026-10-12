import React from 'react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'default' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
  badge?: string;
}

/**
 * Spinner Component (shadcn/ui style)
 * Modern SVG loading spinner with optional badge indicator for interactive buttons & loading states
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'default',
  className = '',
  color = 'currentColor',
  badge,
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.default;

  return (
    <span className="inline-flex items-center gap-2">
      <svg
        className={`animate-spin text-current shrink-0 ${selectedSize} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        style={{ color }}
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {badge && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#004ad7]/15 text-[#004ad7] dark:bg-[#3b82f6]/20 dark:text-[#60a5fa] border border-[#004ad7]/20 dark:border-[#3b82f6]/30">
          {badge}
        </span>
      )}
    </span>
  );
};

export default Spinner;
