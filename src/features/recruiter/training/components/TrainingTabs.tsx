import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TRAINING_TABS, TrainingTabId } from '../training.constants';

interface TrainingTabsProps {
  activeTab: TrainingTabId;
  onTabChange: (tab: TrainingTabId) => void;
  counts?: Record<string, number>;
}

export const TrainingTabs: React.FC<TrainingTabsProps> = ({
  activeTab,
  onTabChange,
  counts = {},
}) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => onTabChange(val as TrainingTabId)}
      className="w-full"
    >
      <div className="relative w-full overflow-hidden">
        {/* Subtle gradient edges to hint horizontal scrollability on narrow viewports */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 sm:hidden" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 sm:hidden" />

        <TabsList
          className="flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-2 pt-1 px-0.5 scrollbar-none snap-x snap-mandatory flex-nowrap w-max min-w-full justify-start border-none bg-transparent h-auto"
          aria-label="Training and Learning sections"
        >
          {TRAINING_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = counts[tab.id];

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`snap-start shrink-0 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 border select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0F4C4A] to-[#0D9488] text-white border-transparent shadow-[0_2px_12px_rgba(13,148,136,0.35)] ring-1 ring-teal-400/30'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>
    </Tabs>
  );
};
