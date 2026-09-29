import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  FileCheck2,
  FileClock,
  FileX,
  FileQuestion,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  Download,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useHiringStore } from '@/store/hiring.store';
import { RecruiterCandidate, UploadedDoc, DocType } from '@/types';
import { RecruiterPageHeader } from '@/components/recruiter/RecruiterPageHeader';
import { StatCardRow, StatItem } from '@/components/recruiter/StatCardRow';
import { FilterBar, FilterState } from '@/components/recruiter/FilterBar';
import { DataTable } from '@/components/recruiter/DataTable';
import { StatusPill } from '@/components/recruiter/StatusPill';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ReasonDialog } from '@/components/recruiter/ReasonDialog';
import { toast } from '@/components/ui/toast';
import { formatFileSize } from '@/lib/utils';

type DocTab = 'pending_review' | 'verified' | 'rejected' | 'missing';

interface FlatDocRow {
  id: string; // docId or composite
  docId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar: string;
  department: string;
  docType: DocType;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'pending_review' | 'verified' | 'rejected' | 'missing';
  rejectionReason?: string;
  candidateRef: RecruiterCandidate;
  docRef?: UploadedDoc;
}

const REQUIRED_DOC_TYPES: { id: DocType; label: string }[] = [
  { id: 'govt_id', label: 'Government ID' },
  { id: 'photo', label: 'Passport Photo' },
  { id: 'degree', label: 'Degree Certificate' },
  { id: 'experience', label: 'Experience Letter' },
  { id: 'payslips', label: 'Past Payslips' },
  { id: 'medical', label: 'Medical Fitness' },
];

export const DocumentsReviewPage: React.FC = () => {
  const { onOpenCandidateDrawer } = useOutletContext<{
    onOpenCandidateDrawer: (candidate: RecruiterCandidate) => void;
  }>();

  const candidates = useHiringStore((state) => state.candidates);
  const approveDocument = useHiringStore((state) => state.approveDocument);
  const rejectDocument = useHiringStore((state) => state.rejectDocument);
  const bulkApproveDocuments = useHiringStore((state) => state.bulkApproveDocuments);

  const [activeTab, setActiveTab] = useState<DocTab>('pending_review');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    department: '',
    location: '',
    dateRange: '',
  });
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');

  // Review Sheet State
  const [reviewingRow, setReviewingRow] = useState<FlatDocRow | null>(null);

  // Reject Dialog State
  const [rejectingRow, setRejectingRow] = useState<FlatDocRow | null>(null);

  // Flatten all documents + compute missing required documents
  const allDocRows = useMemo<FlatDocRow[]>(() => {
    const list: FlatDocRow[] = [];

    candidates.forEach((cand) => {
      const uploadedMap = new Map<DocType, UploadedDoc>();
      cand.documents.forEach((d) => {
        uploadedMap.set(d.type, d);
        list.push({
          id: `${cand.id}-${d.id}`,
          docId: d.id,
          candidateId: cand.id,
          candidateName: cand.name,
          candidateEmail: cand.email,
          candidateAvatar: cand.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2),
          department: cand.department,
          docType: d.type,
          fileName: d.name,
          fileSize: d.size,
          uploadedAt: d.uploadedAt,
          status: d.status || 'pending_review',
          rejectionReason: d.rejectionReason,
          candidateRef: cand,
          docRef: d,
        });
      });

      // Check missing documents
      REQUIRED_DOC_TYPES.forEach((req) => {
        if (!uploadedMap.has(req.id)) {
          list.push({
            id: `${cand.id}-missing-${req.id}`,
            docId: `missing-${req.id}`,
            candidateId: cand.id,
            candidateName: cand.name,
            candidateEmail: cand.email,
            candidateAvatar: cand.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2),
            department: cand.department,
            docType: req.id,
            fileName: 'Not Uploaded Yet',
            fileSize: 0,
            uploadedAt: '—',
            status: 'missing',
            candidateRef: cand,
          });
        }
      });
    });

    return list;
  }, [candidates]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      pending_review: allDocRows.filter((d) => d.status === 'pending_review').length,
      verified: allDocRows.filter((d) => d.status === 'verified').length,
      rejected: allDocRows.filter((d) => d.status === 'rejected').length,
      missing: allDocRows.filter((d) => d.status === 'missing').length,
    };
  }, [allDocRows]);

  // KPI Stat Cards
  const stats = useMemo<StatItem[]>(() => {
    const total = allDocRows.length;
    const verifiedRate = total > 0 ? Math.round((tabCounts.verified / total) * 100) : 0;

    return [
      {
        id: 'total-docs',
        label: 'Total Tracked Docs',
        value: total,
        subtitle: 'Across all required sets',
        icon: FileText,
      },
      {
        id: 'pending-review',
        label: 'Pending Review',
        value: tabCounts.pending_review,
        subtitle: 'Awaiting recruiter verification',
        icon: FileClock,
        variant: 'teal',
      },
      {
        id: 'verified',
        label: 'Verified & Approved',
        value: tabCounts.verified,
        subtitle: `${verifiedRate}% verification rate`,
        icon: FileCheck2,
        variant: 'success',
      },
      {
        id: 'rejected-missing',
        label: 'Action Required',
        value: tabCounts.rejected + tabCounts.missing,
        subtitle: `${tabCounts.rejected} rejected, ${tabCounts.missing} missing`,
        icon: FileX,
        variant: 'danger',
      },
    ];
  }, [allDocRows, tabCounts]);

  // Filtered rows for current tab
  const tabFilteredRows = useMemo(() => {
    return allDocRows.filter((row) => {
      if (row.status !== activeTab) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchName = row.candidateName.toLowerCase().includes(q);
        const matchFile = row.fileName.toLowerCase().includes(q);
        const matchDocType = row.docType.toLowerCase().includes(q);
        if (!matchName && !matchFile && !matchDocType) return false;
      }
      if (filters.department && row.department !== filters.department) return false;
      if (selectedTypeFilter && row.docType !== selectedTypeFilter) return false;
      return true;
    });
  }, [allDocRows, activeTab, filters, selectedTypeFilter]);

  const columns = useMemo<ColumnDef<FlatDocRow>[]>(
    () => [
      {
        id: 'candidate',
        header: 'Candidate',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onOpenCandidateDrawer(item.candidateRef)}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                {item.candidateAvatar}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--color-text)] group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {item.candidateName}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{item.department}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'docType',
        header: 'Document Type',
        cell: ({ row }) => {
          const label = REQUIRED_DOC_TYPES.find((r) => r.id === row.original.docType)?.label || row.original.docType;
          return <span className="font-medium text-xs text-[var(--color-text)]">{label}</span>;
        },
      },
      {
        id: 'fileName',
        header: 'File Name',
        cell: ({ row }) => {
          const item = row.original;
          if (item.status === 'missing') {
            return <span className="text-xs text-[var(--color-text-muted)] italic">Not uploaded</span>;
          }
          return (
            <div className="max-w-[220px]">
              <p className="text-xs font-mono truncate text-[var(--color-text)]" title={item.fileName}>
                {item.fileName}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {formatFileSize(item.fileSize)}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'uploadedAt',
        header: 'Uploaded On',
        cell: ({ row }) => (
          <span className="text-xs text-[var(--color-text-muted)]">
            {row.original.uploadedAt !== '—'
              ? new Date(row.original.uploadedAt).toLocaleDateString()
              : '—'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div>
              <StatusPill status={item.status} />
              {item.rejectionReason && (
                <p className="text-[10px] text-red-600 dark:text-red-400 italic mt-0.5 max-w-[180px] truncate" title={item.rejectionReason}>
                  "{item.rejectionReason}"
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const item = row.original;

          if (item.status === 'missing') {
            return (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                  onClick={() => {
                    toast.info(`Sent upload reminder email to ${item.candidateName}`);
                  }}
                >
                  <Send className="w-3 h-3 mr-1" /> Send Reminder
                </Button>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs hover:border-teal-500 hover:text-teal-600"
                onClick={() => setReviewingRow(item)}
              >
                <Eye className="w-3.5 h-3.5 mr-1" /> Review File
              </Button>

              {item.status === 'pending_review' && (
                <>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-teal-600 hover:bg-teal-700 text-white"
                    onClick={() => {
                      approveDocument(item.candidateId, item.docId);
                      toast.success(`Approved ${item.fileName}`);
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => setRejectingRow(item)}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [onOpenCandidateDrawer, approveDocument]
  );

  const handleBulkApproveForCandidate = (selectedRows: FlatDocRow[]) => {
    const candidateIds = Array.from(new Set(selectedRows.map((r) => r.candidateId)));
    candidateIds.forEach((id) => {
      bulkApproveDocuments(id);
    });
    toast.success(`Bulk approved documents for ${candidateIds.length} candidate(s).`);
  };

  const handleConfirmReject = (reason: string) => {
    if (!rejectingRow) return;
    rejectDocument(rejectingRow.candidateId, rejectingRow.docId, reason);
    toast.error(`Rejected ${rejectingRow.fileName}. Reason sent to candidate.`);
    setRejectingRow(null);
    if (reviewingRow?.id === rejectingRow.id) {
      setReviewingRow(null);
    }
  };

  const handleBulkRemindMissing = () => {
    const missingCandidates = Array.from(
      new Set(allDocRows.filter((d) => d.status === 'missing').map((d) => d.candidateName))
    );
    toast.info(`Sent missing documents reminder notification to ${missingCandidates.length} candidate(s).`);
  };

  return (
    <div className="space-y-6">
      <RecruiterPageHeader
        title="Document Review Queue"
        subtitle="Verify submitted certificates, identities, and tax documents, or flag discrepancies for re-upload."
        breadcrumb="Documents"
        actions={
          <div className="flex items-center gap-2">
            {tabCounts.missing > 0 && (
              <Button
                variant="outline"
                className="text-xs text-amber-600 border-amber-500/30 hover:bg-amber-500/10 gap-1.5"
                onClick={handleBulkRemindMissing}
              >
                <Send className="w-3.5 h-3.5" /> Remind All Missing ({tabCounts.missing})
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Cards */}
      <StatCardRow stats={stats} />

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('pending_review')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'pending_review'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
          }`}
        >
          <FileClock className="w-3.5 h-3.5" />
          Pending Review
          <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-full text-[10px]">
            {tabCounts.pending_review}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verified')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'verified'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          Verified
          <span className="bg-teal-500/20 text-teal-800 dark:text-teal-200 px-1.5 py-0.2 rounded-full text-[10px]">
            {tabCounts.verified}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'rejected'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
          }`}
        >
          <FileX className="w-3.5 h-3.5" />
          Rejected
          <span className="bg-red-500/20 text-red-800 dark:text-red-200 px-1.5 py-0.2 rounded-full text-[10px]">
            {tabCounts.rejected}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('missing')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'missing'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
          }`}
        >
          <FileQuestion className="w-3.5 h-3.5" />
          Missing / Unsubmitted
          <span className="bg-amber-500/20 text-amber-800 dark:text-amber-200 px-1.5 py-0.2 rounded-full text-[10px]">
            {tabCounts.missing}
          </span>
        </button>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        searchPlaceholder="Search candidate, file name..."
      />

      {/* Doc Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['', 'Government Photo ID', 'Passport Size Photograph', 'Degree Certificate / Convocation', 'Experience & Relieving Letters', 'Recent Payslips', 'Medical Fitness Certificate'].map((t) => (
          <button
            key={t || 'all'}
            type="button"
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedTypeFilter === t
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
            onClick={() => setSelectedTypeFilter(t)}
          >
            {t || 'All Doc Types'}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <DataTable
        data={tabFilteredRows}
        columns={columns}
        searchKey="candidate"
        bulkActions={
          activeTab === 'pending_review'
            ? [
                {
                  label: 'Bulk Approve All Selected',
                  icon: CheckCircle2,
                  onClick: handleBulkApproveForCandidate,
                },
              ]
            : undefined
        }
      />

      {/* Document Review Dialog / Sheet */}
      <Dialog
        isOpen={!!reviewingRow}
        onClose={() => setReviewingRow(null)}
        title={`Review File: ${reviewingRow?.fileName}`}
        size="lg"
      >
        {reviewingRow && (
          <div className="space-y-5 pt-2">
            {/* Metadata Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[var(--color-surface-2)] p-3 rounded-xl text-xs">
              <div>
                <span className="text-[var(--color-text-muted)] block">Candidate:</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {reviewingRow.candidateName}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Category:</span>
                <span className="font-semibold text-[var(--color-text)]">
                  {REQUIRED_DOC_TYPES.find((r) => r.id === reviewingRow.docType)?.label}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">File Size:</span>
                <span className="font-mono text-[var(--color-text)]">
                  {formatFileSize(reviewingRow.fileSize)}
                </span>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)] block">Current Status:</span>
                <StatusPill status={reviewingRow.status} />
              </div>
            </div>

            {/* Document Preview Pane */}
            <div className="border border-[var(--color-border)] rounded-xl bg-[var(--color-surface-2)]/40 p-6 flex flex-col items-center justify-center min-h-[300px] text-center space-y-3 relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
                <FileText className="w-8 h-8" />
              </div>

              <div>
                <p className="font-semibold text-sm text-[var(--color-text)]">
                  {reviewingRow.fileName}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Uploaded {new Date(reviewingRow.uploadedAt).toLocaleString()}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-xs bg-[var(--color-surface)] px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)]">
                <span>PDF Document • 300 DPI Verified • Digital Signature Valid</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => toast.info(`Downloaded mock file ${reviewingRow.fileName}`)}
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => toast.info('Opened in new tab')}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open Full Screen
                </Button>
              </div>
            </div>

            {/* Review Decision Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
              <Button variant="ghost" onClick={() => setReviewingRow(null)}>
                Close Preview
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="text-red-600 border-red-500/30 hover:bg-red-500/10 text-xs"
                  onClick={() => setRejectingRow(reviewingRow)}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject & Request Re-upload
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                  onClick={() => {
                    approveDocument(reviewingRow.candidateId, reviewingRow.docId);
                    toast.success(`Approved ${reviewingRow.fileName}`);
                    setReviewingRow(null);
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve Document
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Reject Reason Dialog */}
      <ReasonDialog
        isOpen={!!rejectingRow}
        onClose={() => setRejectingRow(null)}
        onConfirm={handleConfirmReject}
        title={`Reject Document: ${rejectingRow?.fileName}`}
        description="Provide a clear rejection reason. The candidate will see this reason in their portal alongside a Re-upload prompt."
        presets={[
          'Blurry or unreadable scan',
          'Expired document / validity date lapsed',
          'Document type mismatch (e.g. Passport instead of Degree)',
          'Missing back side or required annexures',
          'Candidate legal name does not match record',
        ]}
      />
    </div>
  );
};
