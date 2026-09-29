import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AssessmentType } from '@/types';
import { ASSESSMENT_TABS } from '../assessment.constants';

interface AssessmentTabsProps {
  activeTab: AssessmentType;
  onTabChange: (tab: AssessmentType) => void;
  pendingCounts: Record<string, number>;
  children?: React.ReactNode;
}

export const AssessmentTabs: React.FC<AssessmentTabsProps> = ({
  activeTab,
  onTabChange,
  pendingCounts,
  children,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => onTabChange(val as AssessmentType)}
      className="w-full space-y-4"
    >
      {/* Horizontal pill row under page header */}
      <div className="relative w-full overflow-hidden">
        {/* Subtle gradient edge shadows to indicate horizontal scrollability on narrow viewports */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10 sm:hidden" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-10 sm:hidden" />

        <TabsList
          className="flex items-center gap-2 overflow-x-auto overflow-y-hidden pb-2 pt-1 px-1 scrollbar-none snap-x snap-mandatory flex-nowrap w-max min-w-full justify-start border-none bg-transparent h-auto"
          aria-label="Assessment tracks"
        >
          {ASSESSMENT_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = pendingCounts[tab.id] || 0;
            const Icon = tab.icon;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`snap-start shrink-0 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 border select-none ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0F4C4A] to-[#0D9488] text-white border-transparent shadow-[0_2px_12px_rgba(13,148,136,0.35)] ring-1 ring-teal-400/30'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50 dark:border-teal-800/50'
                  }`}
                >
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Tab Panel with framer-motion transition */}
      <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
        <motion.div
          key={activeTab}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};
