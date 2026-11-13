import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ className, children, hoverable = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200/90 rounded-xl shadow-subtle p-5 text-slate-900 transition-all duration-200',
        hoverable && 'hover:border-slate-300 hover:shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3 className={cn('text-base font-semibold leading-none tracking-tight text-slate-900', className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children, ...props }) => {
  return (
    <p className={cn('text-sm text-slate-500 mt-1', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div className={cn('pt-0', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }) => {
  return (
    <div className={cn('flex items-center pt-4 border-t border-slate-100', className)} {...props}>
      {children}
    </div>
  );
};

