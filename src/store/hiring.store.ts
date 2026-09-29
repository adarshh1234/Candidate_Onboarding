import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  RecruiterCandidate,
  Employee,
  MiscTask,
  ActivityLogItem,
  CandidateOffer,
  UploadedDoc,
  BGVCheckType,
  ProvisionStatus,
  BuddyManagerAssignment,
  TrainingBundle,
  VisaStage,
  VisaCase,
  MiscTaskStatus,
  AssessmentType,
  AssessmentResult,
  CandidateAssessment,
} from '@/types';
import { initialMockCandidates } from '@/mocks/recruiterCandidates';
import { initialMockAssessments } from '@/mocks/seedAssessments';
import { mockEmployees } from '@/mocks/employees';
import { initialMiscTasks } from '@/mocks/miscTasks';
import { useOnboardingStore } from './onboarding.store';

const seededCandidates: RecruiterCandidate[] = initialMockCandidates.map((c) => {
  const matching = initialMockAssessments.filter((a) => a.candidateId === c.id);
  return {
    ...c,
    assessments: matching.length > 0 ? matching : (c.assessments || []),
  };
});

export interface HiringState {
  candidates: RecruiterCandidate[];
  employees: Employee[];
  miscTasks: MiscTask[];
  activityLog: ActivityLogItem[];

  // Candidate Queries & Actions
  getCandidate: (id: string) => RecruiterCandidate | undefined;
  addCandidate: (candidateData: Partial<RecruiterCandidate>) => RecruiterCandidate;
  updateCandidate: (id: string, updates: Partial<RecruiterCandidate>) => void;
  deleteCandidate: (id: string) => void;

  // Offer Pipeline
  createOffer: (candidateId: string, offer: Partial<CandidateOffer>) => void;
  submitOfferForApproval: (candidateId: string) => void;
  approveOffer: (candidateId: string) => void;
  releaseOffer: (candidateId: string) => void;
  acceptOfferByCandidate: (candidateId: string) => void;
  withdrawOffer: (candidateId: string) => void;
  reviseOffer: (candidateId: string, updates: Partial<CandidateOffer>) => void;

  // Documents Queue
  approveDocument: (candidateId: string, docId: string) => void;
  rejectDocument: (candidateId: string, docId: string, reason: string) => void;
  uploadCandidateDocument: (candidateId: string, doc: UploadedDoc) => void;
  bulkApproveDocuments: (candidateId: string) => void;

  // BGV
  initiateBGV: (candidateId: string, vendor: string) => void;
  updateBGVCheck: (
    candidateId: string,
    checkType: BGVCheckType,
    status: 'Pending' | 'In Progress' | 'Clear' | 'Discrepancy' | 'Failed',
    remarks?: string,
  ) => void;
  escalateBGV: (candidateId: string) => void;
  closeBGVCase: (candidateId: string, status: 'Clear' | 'Failed') => void;

  // Assessments
  assignAssessment: (
    candidateIds: string[],
    data: {
      title: string;
      type: AssessmentType;
      dueDate?: string;
      dueAt?: string;
      passThreshold?: number;
      passMark?: number;
      maxScore?: number;
      evaluatorId?: string;
      instructions?: string;
      meta?: Record<string, unknown>;
    },
  ) => void;
  evaluateAssessment: (
    candidateId: string,
    assessmentId: string,
    evaluation:
      | {
          score?: number;
          result?: AssessmentResult;
          remarks?: string;
          comments?: string;
          evaluatorId?: string;
          evaluatorName?: string;
          meta?: Record<string, unknown>;
        }
      | number,
    legacyComments?: string,
  ) => void;
  extendAssessmentDueDate: (
    candidateId: string,
    assessmentId: string,
    newDueDate: string,
  ) => void;
  sendAssessmentReminder: (
    candidateId: string,
    assessmentId: string,
  ) => void;
  reassignAssessmentEvaluator: (
    candidateId: string,
    assessmentId: string,
    evaluatorId: string,
    evaluatorName: string,
  ) => void;
  cancelAssessment: (
    candidateId: string,
    assessmentId: string,
  ) => void;

  // Provisions
  updateProvisionStatus: (
    candidateId: string,
    provisionId: string,
    status: ProvisionStatus,
  ) => void;
  toggleProvisionBlock: (
    candidateId: string,
    provisionId: string,
    blocked: boolean,
    reason?: string,
  ) => void;
  provisionStandardKit: (candidateId: string) => void;

  // Buddy & Manager
  assignBuddyAndManager: (
    candidateId: string,
    assignment: BuddyManagerAssignment,
  ) => void;

  // Training
  assignTrainingBundle: (
    candidateIds: string[],
    bundle: TrainingBundle,
    dueDate: string,
  ) => void;
  waiveTraining: (
    candidateId: string,
    assignmentId: string,
    reason: string,
  ) => void;

  // Visa & Immigration
  addVisaCase: (candidateId: string, visaData: Partial<VisaCase>) => void;
  updateVisaStage: (candidateId: string, stage: VisaStage) => void;
  toggleVisaChecklistItem: (candidateId: string, checkId: string) => void;
  addVisaNote: (candidateId: string, text: string) => void;

  // Insurance
  sendInsuranceInvite: (candidateId: string) => void;
  bulkSendInsuranceInvite: (candidateIds: string[]) => void;
  approveInsuranceEnrolment: (candidateId: string) => void;
  waiveInsurance: (candidateId: string) => void;

  // Miscellaneous Tasks
  addMiscTask: (task: Omit<MiscTask, 'id' | 'comments'>) => void;
  updateMiscTaskStatus: (taskId: string, status: MiscTaskStatus) => void;
  addMiscComment: (taskId: string, text: string, author: string) => void;
  deleteMiscTask: (taskId: string) => void;

  // Notes & Activity
  addCandidateNote: (candidateId: string, text: string, author?: string) => void;
  appendActivity: (
    item: Omit<ActivityLogItem, 'id' | 'timestamp'>,
  ) => void;

  // Reset
  resetDemo: () => void;
}

const initialActivityLog: ActivityLogItem[] = [
  {
    id: 'act-1',
    timestamp: '2026-09-28T09:30:00Z',
    actor: 'Candidate (Aarav Sharma)',
    candidateId: 'CAND-001',
    candidateName: 'Aarav Sharma',
    action: 'Document Uploaded',
    details: 'Uploaded Aadhaar_Card_Front_Back.pdf for identity verification.',
    type: 'doc',
  },
  {
    id: 'act-2',
    timestamp: '2026-09-27T10:00:00Z',
    actor: 'Recruiter (Priya Nair)',
    candidateId: 'CAND-001',
    candidateName: 'Aarav Sharma',
    action: 'Offer Released',
    details: 'Formal employment offer v1 released with CTC ₹34,50,000 INR.',
    type: 'offer',
  },
  {
    id: 'act-3',
    timestamp: '2026-09-26T15:20:00Z',
    actor: 'System',
    candidateId: 'CAND-002',
    candidateName: 'Ananya Iyer',
    action: 'BGV Cleared',
    details: 'All background checks passed with clear report from AuthBridge.',
    type: 'bgv',
  },
];

export const useHiringStore = create<HiringState>()(
  persist(
    (set, get) => ({
      candidates: seededCandidates,
      employees: mockEmployees,
      miscTasks: initialMiscTasks,
      activityLog: initialActivityLog,

      getCandidate: (id) => {
        return get().candidates.find((c) => c.id === id);
      },

      appendActivity: (item) => {
        const newEntry: ActivityLogItem = {
          ...item,
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          activityLog: [newEntry, ...state.activityLog],
        }));
      },

      addCandidate: (data) => {
        const id = `CAND-${String(get().candidates.length + 1).padStart(3, '0')}`;
        const newCandidate: RecruiterCandidate = {
          id,
          candidateCode: id,
          name: data.name || 'New Candidate',
          email: data.email || 'candidate@example.com',
          phone: data.phone || '+91 90000 00000',
          role: data.role || 'Software Engineer',
          department: data.department || 'Engineering',
          team: data.team || 'Core Team',
          company: 'Apex Technologies',
          location: data.location || 'Bengaluru, India',
          startDate: data.startDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          avatar: data.avatar || `https://images.unsplash.com/photo-${1534528741775 + get().candidates.length}?w=150&auto=format&fit=crop&q=80`,
          stage: 'Selected',
          recruiterOwner: data.recruiterOwner || 'Priya Nair',
          overallProgress: 0,
          lastActivity: 'Just now',
          stepProgress: {
            welcome: 'not_started',
            personal: 'not_started',
            documents: 'not_started',
            bank: 'not_started',
            policies: 'not_started',
            training: 'not_started',
            team: 'not_started',
            checklist: 'not_started',
          },
          offer: {
            role: data.role || 'Software Engineer',
            band: 'L4 - Mid Level',
            department: data.department || 'Engineering',
            location: data.location || 'Bengaluru, India',
            annualCTC: '₹24,00,000 INR',
            joiningBonus: '₹2,00,000 INR',
            equityGrant: '500 Stock Options',
            joiningDate: data.startDate || 'October 20, 2026',
            reportingManager: 'Sarah Jenkins',
            expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
            status: 'Draft',
            version: 1,
          },
          documents: [],
          bgv: {
            vendor: 'AuthBridge',
            tatDueDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
            status: 'Not Initiated',
            escalated: false,
            checks: [],
          },
          assessments: [],
          provisions: [],
          buddyManager: {},
          training: [],
          insurance: {
            plan: 'Basic',
            dependents: [],
            enrolmentStatus: 'Not Started',
            provider: 'Star Health',
            deadlineDate: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
            ecardIssued: false,
          },
          notes: [],
        };

        set((state) => ({
          candidates: [newCandidate, ...state.candidates],
        }));

        get().appendActivity({
          actor: 'Recruiter',
          candidateId: id,
          candidateName: newCandidate.name,
          action: 'Candidate Added',
          details: `Candidate profile created for ${newCandidate.role} in ${newCandidate.department}.`,
          type: 'system',
        });

        return newCandidate;
      },

      updateCandidate: (id, updates) => {
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, ...updates, lastActivity: 'Just now' } : c,
          ),
        }));
      },

      deleteCandidate: (id) => {
        const candidate = get().candidates.find((c) => c.id === id);
        set((state) => ({
          candidates: state.candidates.filter((c) => c.id !== id),
        }));
        if (candidate) {
          get().appendActivity({
            actor: 'Recruiter',
            candidateId: id,
            candidateName: candidate.name,
            action: 'Candidate Removed',
            details: `Candidate record deleted.`,
            type: 'system',
          });
        }
      },

      // Offer actions
      createOffer: (candidateId, offerData) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const updatedOffer: CandidateOffer = {
          ...candidate.offer,
          ...offerData,
          status: 'Draft',
          version: candidate.offer.version + 1,
        };

        get().updateCandidate(candidateId, {
          offer: updatedOffer,
          stage: 'Offer Pending',
        });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Offer Draft Created',
          details: `Offer v${updatedOffer.version} prepared with annual compensation ${updatedOffer.annualCTC}.`,
          type: 'offer',
        });
      },

      submitOfferForApproval: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        get().updateCandidate(candidateId, {
          offer: { ...candidate.offer, status: 'Pending Approval' },
        });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Offer Submitted for Approval',
          details: `Sent to Finance & VP Engineering for sign-off.`,
          type: 'offer',
        });
      },

      approveOffer: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        get().updateCandidate(candidateId, {
          offer: { ...candidate.offer, status: 'Draft' },
        });

        get().appendActivity({
          actor: 'Approver (Sarah Jenkins)',
          candidateId,
          candidateName: candidate.name,
          action: 'Offer Approved',
          details: `Employment offer signed off and ready for release.`,
          type: 'offer',
        });
      },

      releaseOffer: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const now = new Date().toISOString();
        get().updateCandidate(candidateId, {
          offer: {
            ...candidate.offer,
            status: 'Released',
            releasedAt: now,
          },
          stage: 'Offer Released',
          stepProgress: {
            ...candidate.stepProgress,
            welcome: 'in_progress',
          },
        });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Offer Released to Candidate',
          details: `Formal offer letter published. Candidate portal notified.`,
          type: 'offer',
        });

        // If candidate is Aarav Sharma (portal driver), notify candidate store
        if (candidateId === 'CAND-001') {
          useOnboardingStore.setState((s) => ({
            notifications: [
              {
                id: `notif-${Date.now()}`,
                title: 'Official Offer Letter Released!',
                description: `Your formal employment offer for ${candidate.offer.role} is ready for review and acceptance.`,
                time: 'Just now',
                read: false,
                type: 'info',
              },
              ...s.notifications,
            ],
          }));
        }
      },

      acceptOfferByCandidate: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const now = new Date().toISOString();
        get().updateCandidate(candidateId, {
          offer: {
            ...candidate.offer,
            status: 'Accepted',
            acceptedAt: now,
          },
          stage: 'Offer Accepted',
          stepProgress: {
            ...candidate.stepProgress,
            welcome: 'completed',
            personal: 'in_progress',
          },
          overallProgress: Math.max(candidate.overallProgress, 25),
        });

        get().appendActivity({
          actor: `Candidate (${candidate.name})`,
          candidateId,
          candidateName: candidate.name,
          action: 'Offer Formally Accepted',
          details: `Candidate electronically signed and accepted the employment contract.`,
          type: 'offer',
        });
      },

      withdrawOffer: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        get().updateCandidate(candidateId, {
          offer: { ...candidate.offer, status: 'Draft' },
          stage: 'Selected',
        });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Offer Withdrawn',
          details: `Offer reverted to draft status.`,
          type: 'offer',
        });
      },

      reviseOffer: (candidateId, updates) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const nextVersion = candidate.offer.version + 1;
        get().updateCandidate(candidateId, {
          offer: {
            ...candidate.offer,
            ...updates,
            version: nextVersion,
            status: 'Draft',
          },
          stage: 'Offer Pending',
        });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Offer Revised',
          details: `Created offer version v${nextVersion}.`,
          type: 'offer',
        });
      },

      // Document Actions
      approveDocument: (candidateId, docId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const doc = candidate.documents.find((d) => d.id === docId);
        const now = new Date().toISOString();

        const updatedDocs = candidate.documents.map((d) =>
          d.id === docId
            ? { ...d, status: 'verified' as const, reviewedAt: now, rejectionReason: undefined }
            : d,
        );

        get().updateCandidate(candidateId, { documents: updatedDocs });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Document Verified',
          details: `Verified ${doc ? doc.name : 'credential'}.`,
          type: 'doc',
        });

        // Cross-portal coupling if Aarav Sharma
        if (candidateId === 'CAND-001') {
          useOnboardingStore.setState((s) => ({
            uploadedDocs: s.uploadedDocs.map((d) =>
              d.id === docId ? { ...d, status: 'verified', rejectionReason: undefined } : d,
            ),
            notifications: [
              {
                id: `notif-${Date.now()}`,
                title: 'Document Approved',
                description: `Your uploaded document (${doc?.name || 'file'}) was verified by recruiting compliance.`,
                time: 'Just now',
                read: false,
                type: 'success',
              },
              ...s.notifications,
            ],
          }));
        }
      },

      rejectDocument: (candidateId, docId, reason) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const doc = candidate.documents.find((d) => d.id === docId);
        const now = new Date().toISOString();

        const updatedDocs = candidate.documents.map((d) =>
          d.id === docId
            ? { ...d, status: 'rejected' as const, rejectionReason: reason, reviewedAt: now }
            : d,
        );

        get().updateCandidate(candidateId, { documents: updatedDocs });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Document Rejected',
          details: `Rejected ${doc ? doc.name : 'document'}. Reason: "${reason}".`,
          type: 'doc',
        });

        // Cross-portal coupling if Aarav Sharma
        if (candidateId === 'CAND-001') {
          useOnboardingStore.setState((s) => ({
            uploadedDocs: s.uploadedDocs.map((d) =>
              d.id === docId ? { ...d, status: 'rejected', rejectionReason: reason } : d,
            ),
            notifications: [
              {
                id: `notif-${Date.now()}`,
                title: 'Action Required: Document Rejected',
                description: `Your ${doc?.name || 'document'} was rejected: ${reason}. Please re-upload.`,
                time: 'Just now',
                read: false,
                type: 'alert',
              },
              ...s.notifications,
            ],
          }));
        }
      },

      uploadCandidateDocument: (candidateId, doc) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const docWithStatus: UploadedDoc = {
          ...doc,
          status: 'pending_review',
        };

        const filtered = candidate.documents.filter((d) => d.type !== doc.type);
        get().updateCandidate(candidateId, {
          documents: [...filtered, docWithStatus],
        });

        get().appendActivity({
          actor: `Candidate (${candidate.name})`,
          candidateId,
          candidateName: candidate.name,
          action: 'Document Uploaded',
          details: `Uploaded ${doc.name} for verification.`,
          type: 'doc',
        });
      },

      bulkApproveDocuments: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const now = new Date().toISOString();
        const updatedDocs = candidate.documents.map((d) => ({
          ...d,
          status: 'verified' as const,
          reviewedAt: now,
          rejectionReason: undefined,
        }));

        get().updateCandidate(candidateId, { documents: updatedDocs });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Bulk Document Verification',
          details: `All ${updatedDocs.length} pending documents approved in batch.`,
          type: 'doc',
        });

        if (candidateId === 'CAND-001') {
          useOnboardingStore.setState((s) => ({
            uploadedDocs: s.uploadedDocs.map((d) => ({
              ...d,
              status: 'verified',
              rejectionReason: undefined,
            })),
            notifications: [
              {
                id: `notif-${Date.now()}`,
                title: 'All Documents Approved!',
                description: 'Your uploaded credentials and proofs have all been approved.',
                time: 'Just now',
                read: false,
                type: 'success',
              },
              ...s.notifications,
            ],
          }));
        }
      },

      // BGV actions
      initiateBGV: (candidateId, vendor) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const now = new Date().toISOString().slice(0, 10);
        const tat = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);

        get().updateCandidate(candidateId, {
          stage: 'BGV In Progress',
          bgv: {
            vendor,
            initiatedDate: now,
            tatDueDate: tat,
            status: 'In Progress',
            escalated: false,
            checks: [
              { type: 'Identity', status: 'In Progress', remarks: 'Aadhaar / Passport validation' },
              { type: 'Address', status: 'Pending', remarks: 'Physical address check' },
              { type: 'Education', status: 'Pending', remarks: 'University transcript verification' },
              { type: 'Employment history', status: 'Pending', remarks: 'Past employer relieving check' },
              { type: 'Criminal record', status: 'In Progress', remarks: 'Court records check' },
              { type: 'Reference', status: 'Pending', remarks: 'Professional referee feedback' },
            ],
          },
        });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'BGV Initiated',
          details: `Background verification initiated with ${vendor} (TAT due: ${tat}).`,
          type: 'bgv',
        });
      },

      updateBGVCheck: (candidateId, checkType, status, remarks) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const updatedChecks = candidate.bgv.checks.map((chk) =>
          chk.type === checkType
            ? {
                ...chk,
                status,
                remarks: remarks || chk.remarks,
                verifiedDate: status === 'Clear' ? new Date().toISOString().slice(0, 10) : chk.verifiedDate,
              }
            : chk,
        );

        const hasFailed = updatedChecks.some((c) => c.status === 'Failed');
        const hasDiscrepancy = updatedChecks.some((c) => c.status === 'Discrepancy');
        const allClear = updatedChecks.length > 0 && updatedChecks.every((c) => c.status === 'Clear');

        const overallStatus = hasFailed
          ? 'Failed'
          : hasDiscrepancy
            ? 'Discrepancy'
            : allClear
              ? 'Clear'
              : 'In Progress';

        get().updateCandidate(candidateId, {
          bgv: {
            ...candidate.bgv,
            checks: updatedChecks,
            status: overallStatus,
          },
        });

        get().appendActivity({
          actor: 'Recruiter / Vendor',
          candidateId,
          candidateName: candidate.name,
          action: `BGV ${checkType} Check: ${status}`,
          details: remarks || `Status marked as ${status}.`,
          type: 'bgv',
        });
      },

      escalateBGV: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        get().updateCandidate(candidateId, {
          bgv: { ...candidate.bgv, escalated: true },
        });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'BGV Case Escalated',
          details: `TAT risk escalated to vendor account manager.`,
          type: 'bgv',
        });
      },

      closeBGVCase: (candidateId, status) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        get().updateCandidate(candidateId, {
          bgv: { ...candidate.bgv, status },
          stage: status === 'Clear' ? 'Onboarding' : candidate.stage,
        });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: `BGV Case Closed (${status})`,
          details: `Overall background check finalized.`,
          type: 'bgv',
        });
      },

      // Assessment actions
      assignAssessment: (candidateIds, data) => {
        const candidates = get().candidates;
        const now = new Date().toISOString().slice(0, 10);
        const dueAt = data.dueAt || data.dueDate || now;
        const passMark = data.passMark ?? data.passThreshold ?? 70;
        const maxScore = data.maxScore ?? 100;

        candidateIds.forEach((cid) => {
          const candidate = candidates.find((c) => c.id === cid);
          if (!candidate) return;

          const newAssessment: CandidateAssessment = {
            id: `asm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            candidateId: cid,
            title: data.title,
            type: data.type,
            assignedAt: now,
            dueAt,
            assignedDate: now,
            dueDate: dueAt,
            status: 'assigned',
            maxScore,
            passMark,
            passThreshold: passMark,
            evaluatorId: data.evaluatorId,
            remarks: data.instructions,
            meta: data.meta || {},
          };

          get().updateCandidate(cid, {
            assessments: [newAssessment, ...(candidate.assessments || [])],
          });

          get().appendActivity({
            actor: 'Recruiter',
            candidateId: cid,
            candidateName: candidate.name,
            action: 'Assessment Assigned',
            details: `Assigned "${data.title}" (${data.type}, due ${dueAt}).`,
            type: 'system',
          });

          if (cid === 'CAND-001') {
            useOnboardingStore.setState((s) => ({
              notifications: [
                {
                  id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  title: `${data.title} Assigned`,
                  description: `New ${data.type} assessment assigned, due ${dueAt}.`,
                  time: 'Just now',
                  read: false,
                  type: 'info',
                },
                ...s.notifications,
              ],
            }));
          }
        });
      },

      evaluateAssessment: (candidateId, assessmentId, evaluation, legacyComments) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        let evalScore: number | undefined;
        let evalResult: AssessmentResult | undefined;
        let evalRemarks: string | undefined;
        let evalMeta: Record<string, unknown> | undefined;
        let evalEvaluatorId: string | undefined;
        let evalEvaluatorName: string | undefined;

        if (typeof evaluation === 'number') {
          evalScore = evaluation;
          evalRemarks = legacyComments;
        } else {
          evalScore = evaluation.score;
          evalResult = evaluation.result;
          evalRemarks = evaluation.remarks || evaluation.comments;
          evalMeta = evaluation.meta;
          evalEvaluatorId = evaluation.evaluatorId;
          evalEvaluatorName = evaluation.evaluatorName;
        }

        const updated = (candidate.assessments || []).map((a) => {
          if (a.id === assessmentId) {
            const finalScore = evalScore !== undefined ? evalScore : a.score;
            const finalResult =
              evalResult !== undefined
                ? evalResult
                : finalScore !== undefined
                ? finalScore >= (a.passMark ?? a.passThreshold ?? 70)
                  ? 'pass'
                  : 'fail'
                : 'review';

            return {
              ...a,
              status: 'evaluated' as const,
              score: finalScore,
              result: finalResult,
              remarks: evalRemarks !== undefined ? evalRemarks : a.remarks,
              comments: evalRemarks !== undefined ? evalRemarks : a.comments,
              evaluatorId: evalEvaluatorId || a.evaluatorId,
              evaluatorName: evalEvaluatorName || a.evaluatorName,
              meta: evalMeta ? { ...a.meta, ...evalMeta } : a.meta,
            };
          }
          return a;
        });

        get().updateCandidate(candidateId, { assessments: updated });

        const targetAsm = candidate.assessments?.find((a) => a.id === assessmentId);
        const title = targetAsm?.title || 'Assessment';

        get().appendActivity({
          actor: 'Evaluator',
          candidateId,
          candidateName: candidate.name,
          action: 'Assessment Evaluated',
          details: `Evaluated "${title}" — Score: ${evalScore ?? 'N/A'}. Result: ${evalResult ?? 'Recorded'}.`,
          type: 'system',
        });

        if (candidateId === 'CAND-001') {
          useOnboardingStore.setState((s) => ({
            notifications: [
              {
                id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: `${title} Results Released`,
                description: `Your assessment evaluation has been completed. Score: ${evalScore ?? 'Verified'}.`,
                time: 'Just now',
                read: false,
                type: 'success',
              },
              ...s.notifications,
            ],
          }));
        }
      },

      extendAssessmentDueDate: (candidateId, assessmentId, newDueDate) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const updated = (candidate.assessments || []).map((a) => {
          if (a.id === assessmentId) {
            return {
              ...a,
              dueAt: newDueDate,
              dueDate: newDueDate,
            };
          }
          return a;
        });

        get().updateCandidate(candidateId, { assessments: updated });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Assessment Due Date Extended',
          details: `Due date extended to ${newDueDate}.`,
          type: 'system',
        });

        if (candidateId === 'CAND-001') {
          useOnboardingStore.setState((s) => ({
            notifications: [
              {
                id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: 'Assessment Deadline Extended',
                description: `Your submission deadline has been extended to ${newDueDate}.`,
                time: 'Just now',
                read: false,
                type: 'info',
              },
              ...s.notifications,
            ],
          }));
        }
      },

      sendAssessmentReminder: (candidateId, assessmentId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;
        const asm = candidate.assessments?.find((a) => a.id === assessmentId);

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Assessment Reminder Sent',
          details: `Sent automated reminder for "${asm?.title || 'Assessment'}".`,
          type: 'system',
        });

        if (candidateId === 'CAND-001') {
          useOnboardingStore.setState((s) => ({
            notifications: [
              {
                id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: 'Assessment Reminder',
                description: `Friendly reminder to submit "${asm?.title || 'Assessment'}" by ${asm?.dueAt || asm?.dueDate}.`,
                time: 'Just now',
                read: false,
                type: 'alert',
              },
              ...s.notifications,
            ],
          }));
        }
      },

      reassignAssessmentEvaluator: (candidateId, assessmentId, evaluatorId, evaluatorName) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const updated = (candidate.assessments || []).map((a) => {
          if (a.id === assessmentId) {
            return {
              ...a,
              evaluatorId,
              evaluatorName,
            };
          }
          return a;
        });

        get().updateCandidate(candidateId, { assessments: updated });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Evaluator Reassigned',
          details: `Reassigned review to ${evaluatorName}.`,
          type: 'system',
        });
      },

      cancelAssessment: (candidateId, assessmentId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const updated = (candidate.assessments || []).map((a) => {
          if (a.id === assessmentId) {
            return {
              ...a,
              status: 'expired' as const,
            };
          }
          return a;
        });

        get().updateCandidate(candidateId, { assessments: updated });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Assessment Cancelled / Expired',
          details: `Assessment expired / cancelled by recruiter.`,
          type: 'system',
        });
      },

      // Provisions actions
      updateProvisionStatus: (candidateId, provisionId, status) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const updated = candidate.provisions.map((p) =>
          p.id === provisionId ? { ...p, status } : p,
        );

        get().updateCandidate(candidateId, { provisions: updated });

        get().appendActivity({
          actor: 'IT / Facilities',
          candidateId,
          candidateName: candidate.name,
          action: 'Provision Status Updated',
          details: `Asset marked as ${status}.`,
          type: 'provision',
        });
      },

      toggleProvisionBlock: (candidateId, provisionId, blocked, reason) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const updated = candidate.provisions.map((p) =>
          p.id === provisionId ? { ...p, blocked, blockReason: blocked ? reason : undefined } : p,
        );

        get().updateCandidate(candidateId, { provisions: updated });

        get().appendActivity({
          actor: 'IT Ops',
          candidateId,
          candidateName: candidate.name,
          action: blocked ? 'Provision Item Blocked' : 'Provision Item Unblocked',
          details: reason || 'Block status updated.',
          type: 'provision',
        });
      },

      provisionStandardKit: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const standardItems = [
          { id: `prov-${Date.now()}-1`, item: 'Laptop' as const, category: 'IT' as const, status: 'In Progress' as const, dueDate: candidate.startDate, assignedTo: 'Sameer Qureshi' },
          { id: `prov-${Date.now()}-2`, item: 'Email & Slack' as const, category: 'IT' as const, status: 'Ready' as const, dueDate: candidate.startDate, assignedTo: 'Sameer Qureshi' },
          { id: `prov-${Date.now()}-3`, item: 'GitHub/Jira/AWS access' as const, category: 'IT' as const, status: 'In Progress' as const, dueDate: candidate.startDate, assignedTo: 'Sameer Qureshi' },
          { id: `prov-${Date.now()}-4`, item: 'ID badge' as const, category: 'Facilities' as const, status: 'Requested' as const, dueDate: candidate.startDate, assignedTo: 'Facilities Admin' },
          { id: `prov-${Date.now()}-5`, item: 'Desk/seat' as const, category: 'Facilities' as const, status: 'Ready' as const, dueDate: candidate.startDate, assignedTo: 'Facilities Admin' },
        ];

        get().updateCandidate(candidateId, { provisions: standardItems });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Standard Kit Provisioned',
          details: `Requested standard 5-point hardware and credentials package.`,
          type: 'provision',
        });
      },

      // Buddy & Manager actions
      assignBuddyAndManager: (candidateId, assignment) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        get().updateCandidate(candidateId, {
          buddyManager: {
            ...candidate.buddyManager,
            ...assignment,
          },
        });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Buddy / Manager Assigned',
          details: `Assigned Manager: ${assignment.managerName || 'Unchanged'}, Buddy: ${assignment.buddyName || 'Unchanged'}.`,
          type: 'team',
        });

        // Cross-portal coupling if Aarav Sharma
        if (candidateId === 'CAND-001') {
          if (assignment.managerName) {
            useOnboardingStore.setState((s) => ({
              candidate: {
                ...s.candidate,
                manager: {
                  ...s.candidate.manager,
                  name: assignment.managerName || s.candidate.manager.name,
                  role: assignment.managerRole || s.candidate.manager.role,
                  email: assignment.managerEmail || s.candidate.manager.email,
                  avatar: assignment.managerAvatar || s.candidate.manager.avatar,
                },
              },
              notifications: [
                {
                  id: `notif-${Date.now()}`,
                  title: 'Team Updates: Buddy & Manager Assigned',
                  details: `Your manager (${assignment.managerName}) and peer buddy (${assignment.buddyName || 'Peer'}) are set.`,
                  description: `Your manager (${assignment.managerName}) and peer buddy (${assignment.buddyName || 'Peer'}) have been assigned!`,
                  time: 'Just now',
                  read: false,
                  type: 'info',
                },
                ...s.notifications,
              ],
            }));
          }
        }
      },

      // Training actions
      assignTrainingBundle: (candidateIds, bundle, dueDate) => {
        const candidates = get().candidates;
        candidateIds.forEach((cid) => {
          const candidate = candidates.find((c) => c.id === cid);
          if (!candidate) return;

          const newModule = {
            id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            moduleId: `mod-${bundle.toLowerCase()}`,
            title: `${bundle} Onboarding Track`,
            bundle,
            dueDate,
            progress: 0,
            isCompleted: false,
          };

          get().updateCandidate(cid, {
            training: [...candidate.training, newModule],
          });

          get().appendActivity({
            actor: 'Recruiter',
            candidateId: cid,
            candidateName: candidate.name,
            action: 'Training Track Assigned',
            details: `Assigned ${bundle} track due on ${dueDate}.`,
            type: 'training',
          });
        });
      },

      waiveTraining: (candidateId, assignmentId, reason) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const updated = candidate.training.map((t) =>
          t.id === assignmentId ? { ...t, isWaived: true, waiveReason: reason, isCompleted: true } : t,
        );

        get().updateCandidate(candidateId, { training: updated });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Training Module Waived',
          details: `Waived with reason: ${reason}`,
          type: 'training',
        });
      },

      // Visa actions
      addVisaCase: (candidateId, visaData) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const newCase: VisaCase = {
          needsVisa: true,
          fromCountry: visaData.fromCountry || 'India',
          toCountry: visaData.toCountry || 'United Kingdom',
          visaType: visaData.visaType || 'Work Permit',
          stage: 'Documents Collection',
          lawyerVendor: visaData.lawyerVendor || 'Fragomen Global LLP',
          filingDate: visaData.filingDate || new Date().toISOString().slice(0, 10),
          expectedDecision: visaData.expectedDecision || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          startRisk: false,
          relocationSupport: {
            flightBooked: false,
            housingAssisted: true,
            relocationAllowance: true,
          },
          checklist: [
            { id: 'v-1', task: 'Valid International Passport', completed: true },
            { id: 'v-2', task: 'Degree & Marksheets Notarization', completed: false },
            { id: 'v-3', task: 'Medical Examination & Biometrics', completed: false },
            { id: 'v-4', task: 'Work Authorization Issuance', completed: false },
          ],
          notes: [],
        };

        get().updateCandidate(candidateId, { visa: newCase });

        get().appendActivity({
          actor: 'Recruiter',
          candidateId,
          candidateName: candidate.name,
          action: 'Visa Case Created',
          details: `Initiated ${newCase.visaType} filing to ${newCase.toCountry}.`,
          type: 'system',
        });
      },

      updateVisaStage: (candidateId, stage) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate || !candidate.visa) return;

        get().updateCandidate(candidateId, {
          visa: { ...candidate.visa, stage },
        });

        get().appendActivity({
          actor: 'Immigration Counsel',
          candidateId,
          candidateName: candidate.name,
          action: `Visa Stage: ${stage}`,
          details: `Immigration pipeline updated to ${stage}.`,
          type: 'system',
        });
      },

      toggleVisaChecklistItem: (candidateId, checkId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate || !candidate.visa) return;

        const updated = candidate.visa.checklist.map((item) =>
          item.id === checkId ? { ...item, completed: !item.completed } : item,
        );

        get().updateCandidate(candidateId, {
          visa: { ...candidate.visa, checklist: updated },
        });
      },

      addVisaNote: (candidateId, text) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate || !candidate.visa) return;

        const newNote = {
          id: `vn-${Date.now()}`,
          author: 'Immigration Team',
          text,
          date: new Date().toISOString().slice(0, 10),
        };

        get().updateCandidate(candidateId, {
          visa: { ...candidate.visa, notes: [newNote, ...candidate.visa.notes] },
        });
      },

      // Insurance actions
      sendInsuranceInvite: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        get().updateCandidate(candidateId, {
          insurance: { ...candidate.insurance, enrolmentStatus: 'Invited' },
        });

        get().appendActivity({
          actor: 'Benefits Ops',
          candidateId,
          candidateName: candidate.name,
          action: 'Insurance Enrolment Invited',
          details: `Group health cover invite dispatched.`,
          type: 'system',
        });
      },

      bulkSendInsuranceInvite: (candidateIds) => {
        candidateIds.forEach((cid) => get().sendInsuranceInvite(cid));
      },

      approveInsuranceEnrolment: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        get().updateCandidate(candidateId, {
          insurance: {
            ...candidate.insurance,
            enrolmentStatus: 'Active',
            ecardIssued: true,
            effectiveDate: candidate.startDate,
          },
        });

        get().appendActivity({
          actor: 'Benefits Ops',
          candidateId,
          candidateName: candidate.name,
          action: 'Insurance Enrolment Approved',
          details: `E-card issued under ${candidate.insurance.provider}.`,
          type: 'system',
        });
      },

      waiveInsurance: (candidateId) => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        get().updateCandidate(candidateId, {
          insurance: { ...candidate.insurance, enrolmentStatus: 'Waived' },
        });

        get().appendActivity({
          actor: 'Benefits Ops',
          candidateId,
          candidateName: candidate.name,
          action: 'Insurance Waived',
          details: `Candidate opted out of group coverage.`,
          type: 'system',
        });
      },

      // Misc Tasks actions
      addMiscTask: (taskData) => {
        const id = `misc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newTask: MiscTask = {
          ...taskData,
          id,
          comments: [],
        };

        set((state) => ({
          miscTasks: [newTask, ...state.miscTasks],
        }));

        get().appendActivity({
          actor: 'Recruiter',
          candidateId: taskData.candidateId || 'N/A',
          candidateName: taskData.candidateId
            ? get().getCandidate(taskData.candidateId)?.name || 'General'
            : 'General Task',
          action: 'Miscellaneous Task Created',
          details: `Created task "${taskData.title}".`,
          type: 'system',
        });
      },

      updateMiscTaskStatus: (taskId, status) => {
        set((state) => ({
          miscTasks: state.miscTasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        }));
      },

      addMiscComment: (taskId, text, author) => {
        const comment = {
          id: `mc-${Date.now()}`,
          author,
          text,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          miscTasks: state.miscTasks.map((t) =>
            t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t,
          ),
        }));
      },

      deleteMiscTask: (taskId) => {
        set((state) => ({
          miscTasks: state.miscTasks.filter((t) => t.id !== taskId),
        }));
      },

      // Notes
      addCandidateNote: (candidateId, text, author = 'Priya Nair') => {
        const candidate = get().getCandidate(candidateId);
        if (!candidate) return;

        const newNote = {
          id: `note-${Date.now()}`,
          author,
          text,
          date: new Date().toISOString().slice(0, 10),
        };

        get().updateCandidate(candidateId, {
          notes: [newNote, ...candidate.notes],
        });
      },

      // Reset Demo State
      resetDemo: () => {
        set({
          candidates: seededCandidates,
          employees: mockEmployees,
          miscTasks: initialMiscTasks,
          activityLog: initialActivityLog,
        });
        useOnboardingStore.getState().resetOnboarding();
      },
    }),
    {
      name: 'onboardly-hiring-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
