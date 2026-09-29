import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { useHiringStore } from '@/store/hiring.store';
import { RecruiterCandidate } from '@/types';
import { RECRUITER_SIDEBAR_ITEMS } from '@/lib/constants';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCandidate?: (candidate: RecruiterCandidate) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectCandidate,
}) => {
  const [query, setQuery] = useState('');
  const candidates = useHiringStore((state) => state.candidates);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.candidateCode.toLowerCase().includes(query.toLowerCase()) ||
    c.role.toLowerCase().includes(query.toLowerCase()) ||
    c.department.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredPages = RECRUITER_SIDEBAR_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelectCandidate = (candidate: RecruiterCandidate) => {
    onSelectCandidate?.(candidate);
    onClose();
  };

  const handleNavigatePage = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Global Search & Jump" maxWidth="lg">
      <div className="space-y-4 text-left">
        {/* Search input with keyboard cue */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a candidate name, ID, role, or section..."
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Candidates matching */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-1">
              Candidates ({filteredCandidates.length})
            </span>
            {filteredCandidates.length === 0 ? (
              <p className="text-xs text-slate-400 px-1 py-1">No candidate matches found.</p>
            ) : (
              <div className="space-y-1">
                {filteredCandidates.slice(0, 5).map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => handleSelectCandidate(candidate)}
                    className="w-full p-2.5 rounded-xl hover:bg-teal-50/60 dark:hover:bg-teal-950/40 text-left flex items-center justify-between gap-3 group transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                            {candidate.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {candidate.candidateCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {candidate.role} • {candidate.department} ({candidate.location})
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Page Jump */}
          <div className="pt-3 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-1">
              Sections & Modules
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filteredPages.map((page) => (
                <button
                  key={page.path}
                  type="button"
                  onClick={() => handleNavigatePage(page.path)}
                  className="p-2 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-left flex items-center justify-between text-xs transition-colors"
                >
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {page.label}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press ESC to close</span>
          <span>Shortcut: <strong>Cmd + K</strong> or <strong>Ctrl + K</strong></span>
        </div>
      </div>
    </Dialog>
  );
};
