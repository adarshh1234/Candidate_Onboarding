import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Users2,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import { RecruiterCandidate } from '@/types';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow, StatItem } from '@/components/recruiter/StatCardRow';
import { FilterBar, FilterState } from '@/components/recruiter/FilterBar';
import { DataTable } from '@/components/recruiter/DataTable';
import { StatusPill } from '@/components/recruiter/StatusPill';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { addCandidateSchema, AddCandidateFormValues } from './schema';
import { RECRUITER_DEPARTMENTS, RECRUITER_LOCATIONS } from '@/lib/constants';

export const FinalListPage: React.FC = () => {
  const { onOpenCandidateDrawer } = useOutletContext<{
    onOpenCandidateDrawer: (candidate: RecruiterCandidate) => void;
  }>();

  const candidates = useHiringStore((state) => state.candidates);
  const addCandidate = useHiringStore((state) => state.addCandidate);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    location: '',
    dateRange: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddCandidateFormValues>({
    resolver: zodResolver(addCandidateSchema),
    defaultValues: {
      recruiterOwner: 'Priya Nair',
      department: 'Engineering',
      location: 'Bengaluru, India',
    },
  });

  // Calculate Stat Cards
  const total = candidates.length;
  const inProgress = candidates.filter(
    (c) => c.stage === 'Onboarding' || c.stage === 'BGV In Progress' || c.stage === 'Offer Accepted',
  ).length;
  const readyDay1 = candidates.filter((c) => c.stage === 'Ready for Day 1').length;

  const atRisk = useMemo(() => {
    const current = Date.now();
    return candidates.filter((c) => {
      const start = new Date(c.startDate);
      const diffDays = Math.ceil((start.getTime() - current) / (1000 * 3600 * 24));
      return diffDays <= 7 && diffDays >= 0 && c.overallProgress < 60;
    }).length;
  }, [candidates]);

  const statItems: StatItem[] = [
    { label: 'Total Candidates', value: total, subtext: 'In active hiring pipeline', icon: Users2, variant: 'teal' },
    { label: 'Onboarding in Progress', value: inProgress, subtext: 'Completing checklist & BGV', icon: Clock, variant: 'default' },
    { label: 'Ready for Day 1', value: readyDay1, subtext: '100% compliant and provisioned', icon: CheckCircle2, variant: 'success' },
    { label: 'At Risk (< 7 Days)', value: atRisk, subtext: 'Start date near, progress < 60%', icon: AlertTriangle, variant: 'danger' },
  ];

  // Filtering candidates
  const filteredCandidates = useMemo(() => {
    const nowTime = Date.now();
    return candidates.filter((c) => {
      // Search text
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          c.name.toLowerCase().includes(q) ||
          c.candidateCode.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Status
      if (filters.status && c.stage !== filters.status) return false;
      // Department
      if (filters.department && c.department !== filters.department) return false;
      // Location
      if (filters.location && c.location !== filters.location) return false;
      // Date range
      if (filters.dateRange) {
        const start = new Date(c.startDate);
        const diffDays = Math.ceil((start.getTime() - nowTime) / (1000 * 3600 * 24));
        if (filters.dateRange === 'next_7_days' && (diffDays > 7 || diffDays < 0)) return false;
        if (filters.dateRange === 'next_14_days' && (diffDays > 14 || diffDays < 0)) return false;
      }
      return true;
    });
  }, [candidates, filters]);

  // Columns definition
  const columns = useMemo<ColumnDef<RecruiterCandidate>[]>(() => {
    return [
      {
        id: 'candidate',
        header: 'Candidate',
        accessorKey: 'name',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-3 min-w-[200px]">
              <img
                src={c.avatar}
                alt={c.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
              />
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 block truncate">
                  {c.name}
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  {c.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'candidateCode',
        header: 'ID',
        accessorKey: 'candidateCode',
        cell: ({ getValue }) => (
          <span className="font-mono text-slate-500 font-semibold">{String(getValue())}</span>
        ),
      },
      {
        id: 'role',
        header: 'Role & Level',
        accessorKey: 'role',
        cell: ({ row }) => (
          <div className="min-w-[140px]">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{row.original.role}</span>
            <span className="text-[10px] text-slate-400">{row.original.offer.band}</span>
          </div>
        ),
      },
      {
        id: 'department',
        header: 'Department',
        accessorKey: 'department',
      },
      {
        id: 'location',
        header: 'Location',
        accessorKey: 'location',
      },
      {
        id: 'startDate',
        header: 'Start Date',
        accessorKey: 'startDate',
        cell: ({ getValue }) => (
          <span className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
            {String(getValue())}
          </span>
        ),
      },
      {
        id: 'progress',
        header: 'Onboarding %',
        accessorKey: 'overallProgress',
        cell: ({ getValue }) => {
          const val = Number(getValue());
          return (
            <div className="w-28 space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className={val === 100 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'}>
                  {val}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    val === 100
                      ? 'bg-emerald-500'
                      : val >= 50
                        ? 'bg-teal-500'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: 'stage',
        header: 'Stage',
        accessorKey: 'stage',
        cell: ({ getValue }) => <StatusPill status={String(getValue())} size="sm" />,
      },
      {
        id: 'recruiterOwner',
        header: 'Owner',
        accessorKey: 'recruiterOwner',
        cell: ({ getValue }) => (
          <span className="text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
            {String(getValue())}
          </span>
        ),
      },
      {
        id: 'lastActivity',
        header: 'Last Activity',
        accessorKey: 'lastActivity',
        cell: ({ getValue }) => (
          <span className="text-slate-400 text-[11px] whitespace-nowrap">{String(getValue())}</span>
        ),
      },
    ];
  }, []);

  const handleCreateCandidate = (values: AddCandidateFormValues) => {
    addCandidate({
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      department: values.department,
      location: values.location,
      startDate: values.startDate,
      recruiterOwner: values.recruiterOwner,
      offer: {
        role: values.role,
        band: 'L4 - Mid Level',
        department: values.department,
        location: values.location,
        annualCTC: values.annualCTC,
        joiningBonus: '₹2,00,000 INR',
        equityGrant: '500 Stock Options',
        joiningDate: values.startDate,
        reportingManager: 'Sarah Jenkins',
        expiryDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
        status: 'Draft',
        version: 1,
      },
    });

    toast.success('Candidate Added', `${values.name} has been enrolled in the hiring pipeline.`);
    reset();
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      <RecruiterPageHeader
        title="Final Candidate List"
        subtitle="Master registry of selected talent progressing from offer release to Day-1 onboarding readiness."
        breadcrumb="Final List"
        action={
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsAddOpen(true)}
            className="text-xs bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white gap-2 shadow-md shadow-teal-700/20"
          >
            <UserPlus className="w-4 h-4" />
            Add Candidate
          </Button>
        }
      />

      {/* 4 Stat Cards */}
      <StatCardRow stats={statItems} columns={4} />

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        placeholder="Filter by name, ID, email, or role..."
        showDateRange={true}
        statusOptions={[
          { value: 'Selected', label: 'Selected' },
          { value: 'Offer Pending', label: 'Offer Pending' },
          { value: 'Offer Released', label: 'Offer Released' },
          { value: 'Offer Accepted', label: 'Offer Accepted' },
          { value: 'BGV In Progress', label: 'BGV In Progress' },
          { value: 'Onboarding', label: 'Onboarding' },
          { value: 'Ready for Day 1', label: 'Ready for Day 1' },
          { value: 'Offer Declined', label: 'Offer Declined' },
        ]}
      />

      {/* Master Data Table */}
      <DataTable
        columns={columns}
        data={filteredCandidates}
        searchPlaceholder="Quick filter visible table rows..."
        onRowClick={(candidate) => onOpenCandidateDrawer(candidate)}
        exportFilename="onboardly_candidate_final_list.csv"
        renderBulkActions={(selectedRows) => (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success(
                  'Bulk Reminders Dispatched',
                  `Sent WhatsApp and email reminders to ${selectedRows.length} candidates.`,
                );
              }}
              className="text-xs bg-white dark:bg-slate-900"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Send Reminder ({selectedRows.length})
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info(
                  'Recruiter Assigned',
                  `Assigned ${selectedRows.length} candidates to Priya Nair.`,
                );
              }}
              className="text-xs bg-white dark:bg-slate-900"
            >
              Assign Owner
            </Button>
          </div>
        )}
      />

      {/* Add Candidate Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Selected Candidate"
        description="Create a new candidate record to initiate background verification, offer release, and IT provisioning."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(handleCreateCandidate)} className="space-y-4 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Full Name"
              placeholder="e.g. Kunal Sengupta"
              required
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="kunal@example.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              placeholder="+91 98765 00000"
              required
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Designation / Role"
              placeholder="Senior Software Engineer"
              required
              error={errors.role?.message}
              {...register('role')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department <span className="text-rose-500">*</span>
              </label>
              <Select error={errors.department?.message} {...register('department')}>
                {RECRUITER_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Location <span className="text-rose-500">*</span>
              </label>
              <Select error={errors.location?.message} {...register('location')}>
                {RECRUITER_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Expected Joining Date"
              type="date"
              required
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="Annual CTC Package"
              placeholder="₹30,00,000 INR"
              required
              error={errors.annualCTC?.message}
              {...register('annualCTC')}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white"
            >
              Create Candidate Record
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
