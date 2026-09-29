import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number; // 1 to 5
  max?: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  max = 5,
  onChange,
  readOnly = true,
  size = 'sm',
  showNumber = false,
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const effectiveValue = hoverValue !== null ? hoverValue : value;

  const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
    if (readOnly || !onChange) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(starIndex);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(max, value + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(1, value - 1));
    } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      onChange(Number(e.key));
    }
  };

  return (
    <div
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={readOnly ? `Rating ${value} out of ${max} stars` : 'Rate competency 1 to 5 stars'}
      className={cn('inline-flex items-center gap-1', className)}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= effectiveValue;

          if (readOnly) {
            return (
              <Star
                key={starIndex}
                className={cn(
                  starSizes,
                  isFilled
                    ? 'fill-amber-400 text-amber-400 dark:fill-amber-400 dark:text-amber-400'
                    : 'text-slate-300 dark:text-slate-700',
                )}
                aria-hidden="true"
              />
            );
          }

          return (
            <button
              key={starIndex}
              type="button"
              role="radio"
              aria-checked={value === starIndex}
              aria-label={`${starIndex} star${starIndex > 1 ? 's' : ''}`}
              className="p-0.5 rounded transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={() => onChange?.(starIndex)}
              onMouseEnter={() => setHoverValue(starIndex)}
              onMouseLeave={() => setHoverValue(null)}
              onKeyDown={(e) => handleKeyDown(e, starIndex)}
            >
              <Star
                className={cn(
                  starSizes,
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : 'text-slate-300 dark:text-slate-700 hover:text-amber-300',
                )}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {value}/{max}
        </span>
      )}
    </div>
  );
};
