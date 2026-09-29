import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { RecruiterSidebar } from './RecruiterSidebar';
import { RecruiterTopbar } from './RecruiterTopbar';
import { CandidateDrawer } from './CandidateDrawer';
import { AssignDialog } from './AssignDialog';
import { RecruiterCandidate, Employee } from '@/types';
import { useHiringStore } from '@/store/hiring.store';
import { toast } from '@/components/ui/toast';

export const RecruiterShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<RecruiterCandidate | null>(null);
  const [assignDialogState, setAssignDialogState] = useState<{
    isOpen: boolean;
    type: 'manager' | 'buddy';
  }>({ isOpen: false, type: 'manager' });

  const location = useLocation();
  const assignBuddyAndManager = useHiringStore((state) => state.assignBuddyAndManager);

  const handleOpenCandidateDrawer = (candidate: RecruiterCandidate) => {
    setActiveCandidate(candidate);
  };

  const handleAssignEmployee = (emp: Employee) => {
    if (!activeCandidate) return;

    if (assignDialogState.type === 'manager') {
      assignBuddyAndManager(activeCandidate.id, {
        managerId: emp.id,
        managerName: emp.name,
        managerRole: emp.role,
        managerEmail: emp.email,
        managerAvatar: emp.avatar,
      });
      toast.success('Manager Assigned', `${emp.name} is now the direct manager for ${activeCandidate.name}.`);
    } else {
      assignBuddyAndManager(activeCandidate.id, {
        buddyId: emp.id,
        buddyName: emp.name,
        buddyRole: emp.role,
        buddyEmail: emp.email,
        buddyAvatar: emp.avatar,
      });
      toast.success('Buddy Assigned', `${emp.name} is now the peer buddy for ${activeCandidate.name}.`);
    }
  };

  return (
    <div
      data-portal="recruiter"
      className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    >
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 h-full">
        <RecruiterSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      </div>

      {/* Mobile Drawer (visible on < lg) */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-teal-800 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-heading font-bold text-slate-900 dark:text-slate-100">
                    Onboardly
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <RecruiterSidebar
                  isCollapsed={false}
                  onNavigateMobile={() => setIsMobileNavOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Recruiter Content Container */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <RecruiterTopbar
          onToggleMobileMenu={() => setIsMobileNavOpen(true)}
          onSelectCandidate={handleOpenCandidateDrawer}
        />

        {/* Scrollable Content Area */}
        <main
          id="recruiter-main"
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8"
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <Outlet context={{ onOpenCandidateDrawer: handleOpenCandidateDrawer }} />
            </motion.div>
          </div>
        </main>
      </div>

      {/* Global Candidate Detail Sheet */}
      <CandidateDrawer
        candidate={activeCandidate}
        isOpen={Boolean(activeCandidate)}
        onClose={() => setActiveCandidate(null)}
        onOpenAssignDialog={(type) => setAssignDialogState({ isOpen: true, type })}
      />

      {/* Assign Manager/Buddy Dialog */}
      {activeCandidate && assignDialogState.isOpen && (
        <AssignDialog
          isOpen={assignDialogState.isOpen}
          onClose={() => setAssignDialogState({ isOpen: false, type: 'manager' })}
          candidate={activeCandidate}
          assignmentType={assignDialogState.type}
          onAssign={handleAssignEmployee}
        />
      )}
    </div>
  );
};
