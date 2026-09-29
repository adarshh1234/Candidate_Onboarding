import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  RotateCcw,
  Menu,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useHiringStore } from '@/store/hiring.store';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { CommandPalette } from './CommandPalette';
import { toast } from '@/components/ui/toast';
import { RecruiterCandidate } from '@/types';

interface RecruiterTopbarProps {
  onToggleMobileMenu?: () => void;
  onSelectCandidate?: (candidate: RecruiterCandidate) => void;
}

export const RecruiterTopbar: React.FC<RecruiterTopbarProps> = ({
  onToggleMobileMenu,
  onSelectCandidate,
}) => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const activityLog = useHiringStore((state) => state.activityLog);
  const resetDemo = useHiringStore((state) => state.resetDemo);

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReset = () => {
    if (window.confirm('Reset all recruiter and candidate demo data to initial state?')) {
      resetDemo();
      toast.info('Demo Reset', 'All records and portals restored to initial state.');
    }
  };

  const handleSignOut = () => {
    logout();
    toast.info('Signed Out', 'You have been signed out.');
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile hamburger + Global Search Input Trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open recruiter menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick search input button opening command palette */}
          <button
            type="button"
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-xs text-slate-400 hover:border-teal-400 dark:hover:border-teal-600 transition-all text-left shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search candidate or ID...</span>
            </div>
            <kbd className="hidden sm:inline-block font-mono text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Reset Demo, Notifications, Theme Toggle, Role Badge, Avatar Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reset Demo button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 gap-1.5"
            title="Reset demo data across both portals"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Demo</span>
          </Button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((prev) => !prev)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {activityLog.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 z-50 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                    Live System & Candidate Events
                  </h4>
                  <span className="text-[10px] text-teal-600 font-bold bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full">
                    {activityLog.length} events
                  </span>
                </div>

                <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                  {activityLog.slice(0, 8).map((act) => (
                    <div key={act.id} className="py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{act.action}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{act.details}</p>
                      <span className="text-[10px] text-slate-400 block pt-0.5">By {act.actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Role Badge */}
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Recruiter
          </span>

          {/* User Profile Avatar & Menu */}
          <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'Recruiter'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/20"
              />
              <div className="hidden sm:block text-left pr-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                  {user?.name || 'Priya Nair'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 leading-none">
                  Lead Talent Partner
                </p>
              </div>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 z-50 text-left">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Priya Nair'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || 'recruiter@apex.com'}</p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectCandidate={onSelectCandidate}
      />
    </>
  );
};
