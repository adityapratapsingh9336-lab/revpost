import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  isLoading,
  icon: Icon,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 active:scale-[0.98] select-none disabled:opacity-50 disabled:pointer-events-none disabled:scale-100';

  const variants = {
    primary: 'bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 shadow-sm',
    secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-subtle',
    outline: 'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900',
    ghost: 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
    destructive: 'bg-rose-600 text-white border border-rose-600 hover:bg-rose-700 shadow-sm',
    matteAccent: 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200/80',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2 w-9 h-9',
    iconSm: 'p-1.5 w-7 h-7',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={cn('shrink-0', size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

