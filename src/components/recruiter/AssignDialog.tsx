import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHiringStore } from '@/store/hiring.store';
import { Employee, RecruiterCandidate } from '@/types';
import { Search, AlertTriangle, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: RecruiterCandidate;
  assignmentType: 'manager' | 'buddy';
  onAssign: (employee: Employee) => void;
}

export const AssignDialog: React.FC<AssignDialogProps> = ({
  isOpen,
  onClose,
  candidate,
  assignmentType,
  onAssign,
}) => {
  const employees = useHiringStore((state) => state.employees);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const isAssigningBuddy = assignmentType === 'buddy';
  const existingManagerId = candidate.buddyManager.managerId;
  const existingBuddyId = candidate.buddyManager.buddyId;

  // Filter and auto-suggest employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Sort so same department or location are suggested first
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aMatch = (a.department === candidate.department ? 2 : 0) + (a.location === candidate.location ? 1 : 0);
    const bMatch = (b.department === candidate.department ? 2 : 0) + (b.location === candidate.location ? 1 : 0);
    return bMatch - aMatch;
  });

  const handleSelect = (emp: Employee) => {
    // Check buddy != manager rule
    if (isAssigningBuddy && existingManagerId && emp.id === existingManagerId) {
      return; // Cannot assign same person as buddy
    }
    if (!isAssigningBuddy && existingBuddyId && emp.id === existingBuddyId) {
      return; // Cannot assign same person as manager
    }
    setSelectedEmp(emp);
  };

  const handleConfirm = () => {
    if (!selectedEmp) return;
    onAssign(selectedEmp);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isAssigningBuddy ? 'Assign Peer Buddy' : 'Assign Direct Manager'}
      description={`Select a team member from Apex directory for ${candidate.name} (${candidate.role}, ${candidate.department}).`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-left">
        {/* Search Input */}
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, role, department, or city..."
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          className="text-xs"
        />

        {/* Directory List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {sortedEmployees.length === 0 ? (
            <p className="text-xs text-center text-slate-400 py-6">
              No matching employees found.
            </p>
          ) : (
            sortedEmployees.map((emp) => {
              const isSameDept = emp.department === candidate.department;
              const isSameLoc = emp.location === candidate.location;
              const isConflict = isAssigningBuddy
                ? emp.id === existingManagerId
                : emp.id === existingBuddyId;
              const isHighBuddyLoad = isAssigningBuddy && emp.currentBuddyCount >= 3;
              const isSelected = selectedEmp?.id === emp.id;

              return (
                <div
                  key={emp.id}
                  onClick={() => !isConflict && handleSelect(emp)}
                  className={cn(
                    'p-3 rounded-2xl border transition-all flex items-center justify-between gap-3',
                    isConflict
                      ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      : isSelected
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 cursor-pointer shadow-sm ring-1 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer',
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {emp.name}
                        </span>
                        {isSameDept && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 dark:bg-teal-950 dark:text-teal-300 px-1.5 py-0.5 rounded">
                            <Sparkles className="w-2.5 h-2.5" />
                            Same Team
                          </span>
                        )}
                        {isSameLoc && (
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {emp.location.split(',')[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {emp.role} • {emp.department}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {/* Buddy load count pill if assigning buddy */}
                    {isAssigningBuddy && (
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1',
                          isHighBuddyLoad
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400',
                        )}
                        title={isHighBuddyLoad ? 'Warning: Buddy has 3+ active new hires' : ''}
                      >
                        {isHighBuddyLoad && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                        {emp.currentBuddyCount} active buddies
                      </span>
                    )}

                    {isConflict && (
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                        {isAssigningBuddy ? 'Already Manager' : 'Already Buddy'}
                      </span>
                    )}

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Warning if buddy load >= 3 */}
        {selectedEmp && isAssigningBuddy && selectedEmp.currentBuddyCount >= 3 && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>High Mentorship Load:</strong> {selectedEmp.name} is already assigned as buddy for {selectedEmp.currentBuddyCount} new hires. Confirm if they have capacity.
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedEmp}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white"
          >
            Confirm Assignment
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
