import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  FileCheck2,
  ShieldCheck,
  Download,
  Printer,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import { RecruiterCandidate } from '@/types';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow, StatItem } from '@/components/recruiter/StatCardRow';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { exportToCsv } from '@/lib/utils';
import { RECRUITER_DEPARTMENTS, RECRUITER_LOCATIONS } from '@/lib/constants';

const THEME_COLORS = {
  teal: '#0D9488',
  tealDark: '#0F766E',
  tealLight: '#2DD4BF',
  slate: '#64748B',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  indigo: '#6366F1',
};

const PIE_COLORS = ['#0D9488', '#2DD4BF', '#10B981', '#6366F1', '#F59E0B', '#F43F5E'];

export const ReportsPage: React.FC = () => {
  const { onOpenCandidateDrawer } = useOutletContext<{
    onOpenCandidateDrawer: (candidate: RecruiterCandidate) => void;
  }>();

  const candidates = useHiringStore((state) => state.candidates);
  const miscTasks = useHiringStore((state) => state.miscTasks);

  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('All Time');

  // Filtered dataset for reporting
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (departmentFilter && c.department !== departmentFilter) return false;
      if (locationFilter && c.location !== locationFilter) return false;
      return true;
    });
  }, [candidates, departmentFilter, locationFilter]);

  // Executive KPI calculations
  const stats = useMemo<StatItem[]>(() => {
    const total = filteredCandidates.length;

    // Offer acceptance rate
    const offers = filteredCandidates.filter((c) => c.offer);
    const acceptedOffers = offers.filter((c) => c.offer?.status === 'Accepted');
    const offerRate = offers.length > 0 ? Math.round((acceptedOffers.length / offers.length) * 100) : 0;

    // Docs verified %
    let totalDocs = 0;
    let verifiedDocs = 0;
    filteredCandidates.forEach((c) => {
      (c.documents || []).forEach((d) => {
        totalDocs++;
        if (d.status === 'verified') verifiedDocs++;
      });
    });
    const docRate = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

    // BGV clear rate
    const bgvCases = filteredCandidates.filter((c) => c.bgv && c.bgv.status !== 'Not Initiated');
    const bgvClear = bgvCases.filter((c) => c.bgv?.status === 'Clear');
    const bgvRate = bgvCases.length > 0 ? Math.round((bgvClear.length / bgvCases.length) * 100) : 0;

    // Day 1 readiness %
    const ready = filteredCandidates.filter(
      (c) => c.stage === 'Ready for Day 1' || c.overallProgress >= 90
    );
    const day1Rate = total > 0 ? Math.round((ready.length / total) * 100) : 0;

    return [
      {
        id: 'offer-acceptance',
        label: 'Offer Acceptance Rate',
        value: `${offerRate}%`,
        subtitle: `${acceptedOffers.length} of ${offers.length} offers`,
        icon: TrendingUp,
        variant: 'teal',
      },
      {
        id: 'avg-time-to-onboard',
        label: 'Avg Time to Onboard',
        value: '14.2 Days',
        subtitle: 'From offer release to Day 1',
        icon: Clock,
      },
      {
        id: 'docs-verified',
        label: 'Docs Verification Rate',
        value: `${docRate}%`,
        subtitle: `${verifiedDocs} verified certificates`,
        icon: FileCheck2,
        variant: 'success',
      },
      {
        id: 'bgv-clear',
        label: 'BGV Clearance Rate',
        value: `${bgvRate}%`,
        subtitle: `${bgvClear.length} checks cleared`,
        icon: ShieldCheck,
      },
      {
        id: 'day-1-ready',
        label: 'Day-1 Readiness Index',
        value: `${day1Rate}%`,
        subtitle: `${ready.length} joiners 100% prepared`,
        icon: BarChart3,
        variant: 'success',
      },
    ];
  }, [filteredCandidates]);

  // Chart 1: Funnel Data
  const funnelData = useMemo(() => {
    return [
      { stage: 'Selected', count: filteredCandidates.length },
      {
        stage: 'Offer Released',
        count: filteredCandidates.filter((c) => c.offer && c.offer.status !== 'Draft').length,
      },
      {
        stage: 'Offer Accepted',
        count: filteredCandidates.filter((c) => c.offer?.status === 'Accepted').length,
      },
      {
        stage: 'BGV Cleared',
        count: filteredCandidates.filter((c) => c.bgv?.status === 'Clear').length,
      },
      {
        stage: 'Docs Verified',
        count: filteredCandidates.filter((c) =>
          c.documents.some((d) => d.status === 'verified')
        ).length,
      },
      {
        stage: 'Ready for Day 1',
        count: filteredCandidates.filter(
          (c) => c.stage === 'Ready for Day 1' || c.overallProgress >= 90
        ).length,
      },
    ];
  }, [filteredCandidates]);

  // Chart 2: Stage Distribution Donut
  const stageDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCandidates.forEach((c) => {
      counts[c.stage] = (counts[c.stage] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredCandidates]);

  // Chart 3: Offers Over Time (Months)
  const offersOverTimeData = [
    { month: 'May', released: 12, accepted: 10 },
    { month: 'Jun', released: 18, accepted: 15 },
    { month: 'Jul', released: 22, accepted: 19 },
    { month: 'Aug', released: 28, accepted: 25 },
    { month: 'Sep', released: 24, accepted: 21 },
  ];

  // Chart 4: BGV Status by Vendor
  const bgvVendorData = [
    { vendor: 'FirstAdvantage', clear: 8, discrepancy: 1, inProgress: 3 },
    { vendor: 'AuthBridge', clear: 6, discrepancy: 2, inProgress: 2 },
    { vendor: 'HireRight', clear: 5, discrepancy: 0, inProgress: 2 },
  ];

  // Chart 5: Doc Rejection Reasons
  const docRejectionData = [
    { reason: 'Blurry Scan', count: 7 },
    { reason: 'Expired Doc', count: 4 },
    { reason: 'Missing Back Page', count: 5 },
    { reason: 'Wrong Category', count: 3 },
    { reason: 'Name Mismatch', count: 2 },
  ];

  // Chart 6: Training Completion by Department
  const trainingByDeptData = useMemo(() => {
    const deptStats: Record<string, { completed: number; total: number }> = {};
    filteredCandidates.forEach((c) => {
      const stat = (deptStats[c.department] ??= { completed: 0, total: 0 });
      (c.training || []).forEach((t) => {
        stat.total++;
        if (t.isCompleted || t.isWaived) {
          stat.completed++;
        }
      });
    });
    return Object.entries(deptStats).map(([dept, val]) => ({
      department: dept,
      rate: val.total > 0 ? Math.round((val.completed / val.total) * 100) : 0,
    }));
  }, [filteredCandidates]);

  // Table 1: At-Risk Candidates (Start < 7 days & < 60% progress)
  const atRiskCandidates = useMemo(() => {
    const today = new Date();
    return filteredCandidates.filter((cand) => {
      const start = new Date(cand.startDate);
      const diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && cand.overallProgress < 60;
    });
  }, [filteredCandidates]);

  // Table 2: Overdue Tasks
  const overdueTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return miscTasks.filter((t) => t.status !== 'Done' && t.dueDate < today);
  }, [miscTasks]);

  const handleExportAtRiskCsv = () => {
    exportToCsv(
      atRiskCandidates.map((c) => ({
        'Candidate ID': c.candidateId,
        Name: c.name,
        Email: c.email,
        Role: c.role,
        Department: c.department,
        'Start Date': c.startDate,
        'Progress %': c.overallProgress,
        Stage: c.stage,
        Owner: c.recruiterOwner,
      })),
      'at-risk-candidates.csv'
    );
    toast.success('Exported At-Risk Candidates CSV');
  };

  const handleExportOverdueTasksCsv = () => {
    exportToCsv(
      overdueTasks.map((t) => ({
        Title: t.title,
        Category: t.category,
        Assignee: t.assignee,
        Priority: t.priority,
        'Due Date': t.dueDate,
        Status: t.status,
      })),
      'overdue-tasks.csv'
    );
    toast.success('Exported Overdue Tasks CSV');
  };

  return (
    <div className="space-y-6">
      <RecruiterPageHeader
        title="Executive Talent & Onboarding Intelligence"
        subtitle="Real-time conversion metrics, SLA monitoring, compliance risk identification, and audit exports."
        breadcrumb="Reports"
        actions={
          <div className="flex items-center gap-2">
            <Select
              className="w-36 text-xs"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {RECRUITER_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>

            <Select
              className="w-36 text-xs"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All Locations</option>
              {RECRUITER_LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>

            <Select
              className="w-32 text-xs"
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
            >
              <option value="All Time">All Time</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Quarter">This Quarter</option>
            </Select>

            <Button
              variant="outline"
              className="text-xs gap-1.5"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <StatCardRow stats={stats} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Funnel */}
        <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Candidate Pipeline Conversion Funnel
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">Active Hiring Cycle</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" stroke="currentColor" fontSize={11} opacity={0.6} />
                <YAxis
                  dataKey="stage"
                  type="category"
                  stroke="currentColor"
                  fontSize={11}
                  opacity={0.8}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill={THEME_COLORS.teal} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Stage Distribution Donut */}
        <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Current Cohort Stage Distribution
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">Breakdown by status</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || ''} ${(((percent || 0)) * 100).toFixed(0)}%`
                  }
                  dataKey="value"
                >
                  {stageDistributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Offers Over Time */}
        <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Offer Releases vs. Candidate Acceptances
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">Trailing 5 Months</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={offersOverTimeData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="currentColor" fontSize={11} opacity={0.6} />
                <YAxis stroke="currentColor" fontSize={11} opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="released"
                  stroke={THEME_COLORS.slate}
                  strokeWidth={2}
                  name="Offers Released"
                />
                <Line
                  type="monotone"
                  dataKey="accepted"
                  stroke={THEME_COLORS.teal}
                  strokeWidth={3}
                  name="Offers Accepted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: BGV Vendor SLA */}
        <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Background Verification Status by Vendor
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">Clearance vs. Flags</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bgvVendorData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="vendor" stroke="currentColor" fontSize={11} opacity={0.6} />
                <YAxis stroke="currentColor" fontSize={11} opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="clear" stackId="a" fill={THEME_COLORS.emerald} name="Clear" />
                <Bar
                  dataKey="inProgress"
                  stackId="a"
                  fill={THEME_COLORS.teal}
                  name="In Progress"
                />
                <Bar dataKey="discrepancy" stackId="a" fill={THEME_COLORS.rose} name="Discrepancy" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Document Rejections */}
        <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Primary Document Rejection Reasons
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">Quality Discrepancies</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={docRejectionData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="reason" stroke="currentColor" fontSize={11} opacity={0.6} />
                <YAxis stroke="currentColor" fontSize={11} opacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill={THEME_COLORS.rose} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Training Completion by Dept */}
        <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text)]">
              Compliance Completion Rate by Department
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">% Certified</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingByDeptData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="department" stroke="currentColor" fontSize={11} opacity={0.6} />
                <YAxis stroke="currentColor" fontSize={11} opacity={0.6} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="rate" fill={THEME_COLORS.indigo} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables: At-Risk Joiners & Overdue Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* At-Risk Joiners Table */}
        <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                At-Risk Joiners (Starts &lt; 7 Days &amp; &lt; 60% Done)
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Immediate intervention required before Day 1
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleExportAtRiskCsv}
            >
              <Download className="w-3 h-3 mr-1" /> Export CSV
            </Button>
          </div>

          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            {atRiskCandidates.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--color-text-muted)] italic">
                No candidates currently at risk. All near-term joiners on track!
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="p-2.5">Candidate</th>
                    <th className="p-2.5">Start Date</th>
                    <th className="p-2.5">Progress</th>
                    <th className="p-2.5">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {atRiskCandidates.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-[var(--color-surface-2)]/50 cursor-pointer transition-colors"
                      onClick={() => onOpenCandidateDrawer(c)}
                    >
                      <td className="p-2.5 font-semibold text-[var(--color-text)]">{c.name}</td>
                      <td className="p-2.5 text-red-600 font-mono font-medium">{c.startDate}</td>
                      <td className="p-2.5 font-bold text-amber-600">{c.overallProgress}%</td>
                      <td className="p-2.5 text-[var(--color-text-muted)]">{c.recruiterOwner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Overdue Tasks Table */}
        <div className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-red-500" />
                Overdue Operational Tasks
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Lapsed SLAs requiring follow-up
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={handleExportOverdueTasksCsv}
            >
              <Download className="w-3 h-3 mr-1" /> Export CSV
            </Button>
          </div>

          <div className="border border-[var(--color-border)] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            {overdueTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--color-text-muted)] italic">
                Zero overdue tasks across operations teams!
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="p-2.5">Task</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Due</th>
                    <th className="p-2.5">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {overdueTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-[var(--color-surface-2)]/50 transition-colors">
                      <td className="p-2.5 font-semibold text-[var(--color-text)]">{t.title}</td>
                      <td className="p-2.5">
                        <span className="text-[10px] text-teal-600 bg-teal-500/10 px-1.5 py-0.2 rounded font-medium">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-2.5 text-red-600 font-mono font-medium">{t.dueDate}</td>
                      <td className="p-2.5 text-[var(--color-text-muted)]">{t.assignee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
