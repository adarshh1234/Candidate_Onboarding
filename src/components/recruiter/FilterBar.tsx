import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RECRUITER_DEPARTMENTS, RECRUITER_LOCATIONS } from '@/lib/constants';

export interface FilterState {
  search: string;
  status: string;
  department: string;
  location: string;
  dateRange?: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange?: (filters: FilterState) => void;
  onFilterChange?: (filters: FilterState) => void;
  statusOptions?: { value: string; label: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  showDateRange?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onFilterChange,
  statusOptions = [],
  placeholder = 'Search candidate, ID, or title...',
  searchPlaceholder,
  showDateRange = false,
}) => {
  const triggerChange = onFilterChange || onChange || (() => {});
  const effectivePlaceholder = searchPlaceholder || placeholder;
  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    Boolean(filters.department) ||
    Boolean(filters.location) ||
    Boolean(filters.dateRange);

  const handleClear = () => {
    triggerChange({
      search: '',
      status: '',
      department: '',
      location: '',
      dateRange: '',
    });
  };

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search input */}
        <div className="lg:col-span-4">
          <Input
            value={filters.search}
            onChange={(e) => triggerChange({ ...filters, search: e.target.value })}
            placeholder={effectivePlaceholder}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            className="w-full text-xs"
          />
        </div>

        {/* Status Dropdown */}
        {statusOptions.length > 0 && (
          <div className="lg:col-span-2">
            <Select
              value={filters.status}
              onChange={(e) => triggerChange({ ...filters, status: e.target.value })}
              className="text-xs"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Department Dropdown */}
        <div className="lg:col-span-3">
          <Select
            value={filters.department}
            onChange={(e) => triggerChange({ ...filters, department: e.target.value })}
            className="text-xs"
          >
            <option value="">All Departments</option>
            {RECRUITER_DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
        </div>

        {/* Location Dropdown */}
        <div className="lg:col-span-2">
          <Select
            value={filters.location}
            onChange={(e) => triggerChange({ ...filters, location: e.target.value })}
            className="text-xs"
          >
            <option value="">All Locations</option>
            {RECRUITER_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </Select>
        </div>

        {/* Date Range if applicable */}
        {showDateRange && (
          <div className="lg:col-span-2">
            <Select
              value={filters.dateRange || ''}
              onChange={(e) => triggerChange({ ...filters, dateRange: e.target.value })}
              className="text-xs"
            >
              <option value="">Any Date</option>
              <option value="next_7_days">Starting &lt; 7 Days</option>
              <option value="next_14_days">Starting &lt; 14 Days</option>
              <option value="this_month">This Month</option>
              <option value="next_month">Next Month</option>
            </Select>
          </div>
        )}

        {/* Clear Filters CTA */}
        {hasActiveFilters && (
          <div className="lg:col-span-1 flex items-center justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1 px-2.5"
              title="Clear all filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
