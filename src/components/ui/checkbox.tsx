import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, checked, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col space-y-1">
        <label
          htmlFor={inputId}
          className={cn(
            'flex items-start gap-3 select-none cursor-pointer group',
            props.disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              id={inputId}
              type="checkbox"
              ref={ref}
              checked={checked}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                'w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-150',
                'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2',
                'peer-checked:bg-indigo-600 peer-checked:border-indigo-600 dark:peer-checked:bg-indigo-600 dark:peer-checked:border-indigo-600 text-white',
                'group-hover:border-indigo-400',
                error && 'border-rose-400',
                className,
              )}
            >
              <Check className="w-3.5 h-3.5 stroke-[3] opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
          </div>
          {(label || description) && (
            <div className="space-y-0.5 text-left">
              {label && (
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {label}
                </span>
              )}
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}
        </label>
        {error && <p className="text-xs text-rose-500 font-medium pl-8">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
