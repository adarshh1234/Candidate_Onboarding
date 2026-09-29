import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users2,
  ShieldCheck,
  CheckSquare,
  FileSignature,
  FolderCheck,
  Laptop,
  UserCheck,
  GraduationCap,
  Globe,
  HeartPulse,
  Boxes,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useHiringStore } from '@/store/hiring.store';
import { Tooltip } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export interface RecruiterSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigateMobile?: () => void;
}

const RECRUITER_NAV_ITEMS = [
  { label: 'Final List', path: '/recruiter/final-list', icon: Users2 },
  { label: 'Background Verification', path: '/recruiter/background-verification', icon: ShieldCheck, badgeKey: 'bgv' },
  { label: 'Assessments', path: '/recruiter/assessments', icon: CheckSquare },
  { label: 'Offers', path: '/recruiter/offers', icon: FileSignature, badgeKey: 'offers' },
  { label: 'Documents', path: '/recruiter/documents', icon: FolderCheck, badgeKey: 'docs' },
  { label: 'Provisions', path: '/recruiter/provisions', icon: Laptop },
  { label: 'Buddy/Direct Manager', path: '/recruiter/buddy-manager', icon: UserCheck, badgeKey: 'buddy' },
  { label: 'Training', path: '/recruiter/training', icon: GraduationCap },
  { label: 'Visa & Immigration', path: '/recruiter/visa-immigration', icon: Globe },
  { label: 'Insurance', path: '/recruiter/insurance', icon: HeartPulse },
  { label: 'Other Miscellaneous', path: '/recruiter/miscellaneous', icon: Boxes },
  { label: 'Reports', path: '/recruiter/reports', icon: BarChart3 },
];

export const RecruiterSidebar: React.FC<RecruiterSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  onNavigateMobile,
}) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const candidates = useHiringStore((state) => state.candidates);

  // Compute live badges
  const pendingDocsCount = candidates.reduce(
    (acc, c) => acc + c.documents.filter((d) => d.status === 'pending_review' || !d.status).length,
    0,
  );
  const pendingOffersCount = candidates.filter(
    (c) => c.offer.status === 'Draft' || c.offer.status === 'Pending Approval',
  ).length;
  const inProgressBGVCount = candidates.filter(
    (c) => c.bgv.status === 'In Progress' || c.bgv.status === 'Discrepancy',
  ).length;
  const unassignedBuddyCount = candidates.filter(
    (c) => !c.buddyManager.buddyName || !c.buddyManager.managerName,
  ).length;

  const getBadgeValue = (key?: string) => {
    switch (key) {
      case 'docs':
        return pendingDocsCount > 0 ? pendingDocsCount : null;
      case 'offers':
        return pendingOffersCount > 0 ? pendingOffersCount : null;
      case 'bgv':
        return inProgressBGVCount > 0 ? inProgressBGVCount : null;
      case 'buddy':
        return unassignedBuddyCount > 0 ? unassignedBuddyCount : null;
      default:
        return null;
    }
  };

  const handleSignOut = () => {
    logout();
    toast.info('Signed Out', 'You have been signed out of Onboardly.');
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-full transition-all duration-300 select-none z-20',
        isCollapsed ? 'w-20' : 'w-64',
      )}
    >
      <div>
        {/* Logo / Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <NavLink
            to="/recruiter/final-list"
            onClick={onNavigateMobile}
            className="flex items-center gap-2.5 focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-800 flex items-center justify-center text-white shadow-md shadow-teal-600/25">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="text-left">
                <span className="font-heading text-lg font-extrabold tracking-tight bg-gradient-to-r from-teal-600 to-teal-800 dark:from-teal-400 dark:to-teal-600 bg-clip-text text-transparent">
                  Onboardly
                </span>
                <span className="block text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-wider">
                  Recruiter Console
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse toggle */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Items (1 to 12 in exact specified order, all unlocked) */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]" aria-label="Recruiter Navigation">
          {RECRUITER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const badge = getBadgeValue(item.badgeKey);

            const navLink = (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigateMobile}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white font-bold shadow-md shadow-teal-700/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100',
                    isCollapsed && 'justify-center px-0',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400')} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && badge !== null && (
                      <span
                        className={cn(
                          'px-2 py-0.5 text-[10px] font-bold rounded-full',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.path} content={item.label} position="right">
                  <div>{navLink}</div>
                </Tooltip>
              );
            }

            return navLink;
          })}
        </nav>
      </div>

      {/* Footer Sign Out */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
        <button
          type="button"
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors',
            isCollapsed && 'justify-center px-0',
          )}
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
