import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Candidate,
  ChecklistItem,
  PersonalInfoFormValues,
  BankTaxFormValues,
  StepId,
  StepProgressState,
  StepStatus,
  TrainingModule,
  UploadedDoc,
} from '@/types';
import { mockCandidate } from '@/mocks/candidate';
import { mockPolicies } from '@/mocks/policies';
import { mockTrainingModules } from '@/mocks/modules';
import { mockChecklistItems } from '@/mocks/checklist';
import { STEP_ORDER } from '@/lib/constants';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}

interface OnboardingState {
  candidate: Candidate;
  stepStatus: StepProgressState;
  offerAccepted: boolean;
  offerAcceptedDate?: string;
  
  // Drafts for autosave
  personalDraft: Partial<PersonalInfoFormValues>;
  bankDraft: Partial<BankTaxFormValues>;
  
  // Documents
  uploadedDocs: UploadedDoc[];
  
  // Policies
  readPolicyIds: string[];
  acknowledgedPolicyIds: string[];
  
  // Training
  trainingModules: TrainingModule[];
  
  // Checklist
  checklist: ChecklistItem[];
  
  // Notifications
  notifications: NotificationItem[];
  
  // Final submission state
  isSubmitted: boolean;
  submittedAt?: string;

  // Actions
  setCandidate: (candidate: Partial<Candidate>) => void;
  setStepStatus: (stepId: StepId, status: StepStatus) => void;
  acceptOffer: () => void;
  savePersonalDraft: (draft: Partial<PersonalInfoFormValues>) => void;
  saveBankDraft: (draft: Partial<BankTaxFormValues>) => void;
  addUploadedDoc: (doc: UploadedDoc) => void;
  removeUploadedDoc: (docId: string) => void;
  markPolicyAsRead: (policyId: string) => void;
  acknowledgePolicy: (policyId: string) => void;
  acknowledgeAllPolicies: () => void;
  updateTrainingProgress: (moduleId: string, progress: number, completed?: boolean) => void;
  toggleChecklistItem: (itemId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  submitOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialStepStatus: StepProgressState = {
  welcome: 'not_started',
  personal: 'not_started',
  documents: 'not_started',
  bank: 'not_started',
  policies: 'not_started',
  training: 'not_started',
  team: 'not_started',
  checklist: 'not_started',
};

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Offer Letter Available',
    description: 'Please review and accept your official offer letter to initiate onboarding.',
    time: '10 mins ago',
    read: false,
    type: 'info',
  },
  {
    id: 'notif-2',
    title: 'IT Asset Dispatched',
    description: 'Your MacBook Pro M3 and YubiKey have been dispatched via express courier.',
    time: '2 hours ago',
    read: false,
    type: 'success',
  },
  {
    id: 'notif-3',
    title: 'Welcome Buddy Assigned',
    description: 'Vikram Patel has been assigned as your peer buddy for the first 90 days.',
    time: '1 day ago',
    read: true,
    type: 'info',
  },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      candidate: mockCandidate,
      stepStatus: initialStepStatus,
      offerAccepted: false,
      offerAcceptedDate: undefined,
      personalDraft: {},
      bankDraft: {
        taxRegime: 'New Regime',
        accountType: 'Savings',
      },
      uploadedDocs: [],
      readPolicyIds: [],
      acknowledgedPolicyIds: [],
      trainingModules: mockTrainingModules,
      checklist: mockChecklistItems,
      notifications: initialNotifications,
      isSubmitted: false,
      submittedAt: undefined,

      setCandidate: (candidateData) =>
        set((state) => ({
          candidate: { ...state.candidate, ...candidateData },
        })),

      setStepStatus: (stepId, status) =>
        set((state) => ({
          stepStatus: {
            ...state.stepStatus,
            [stepId]: status,
          },
        })),

      acceptOffer: () => {
        const now = new Date().toISOString();
        set((state) => ({
          offerAccepted: true,
          offerAcceptedDate: now,
          stepStatus: {
            ...state.stepStatus,
            welcome: 'completed',
            personal: state.stepStatus.personal === 'not_started' ? 'in_progress' : state.stepStatus.personal,
          },
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: 'Offer Accepted Successfully',
              description: 'You have officially accepted the offer. Proceed to Personal Info.',
              time: 'Just now',
              read: false,
              type: 'success',
            },
            ...state.notifications,
          ],
        }));
      },

      savePersonalDraft: (draft) =>
        set((state) => ({
          personalDraft: { ...state.personalDraft, ...draft },
          stepStatus: {
            ...state.stepStatus,
            personal: state.stepStatus.personal === 'completed' ? 'completed' : 'in_progress',
          },
        })),

      saveBankDraft: (draft) =>
        set((state) => ({
          bankDraft: { ...state.bankDraft, ...draft },
          stepStatus: {
            ...state.stepStatus,
            bank: state.stepStatus.bank === 'completed' ? 'completed' : 'in_progress',
          },
        })),

      addUploadedDoc: (newDoc) =>
        set((state) => {
          // Replace if already uploaded for this type
          const filtered = state.uploadedDocs.filter((d) => d.type !== newDoc.type);
          const updated = [...filtered, newDoc];
          return {
            uploadedDocs: updated,
            stepStatus: {
              ...state.stepStatus,
              documents: state.stepStatus.documents === 'completed' ? 'completed' : 'in_progress',
            },
          };
        }),

      removeUploadedDoc: (docId) =>
        set((state) => ({
          uploadedDocs: state.uploadedDocs.filter((d) => d.id !== docId),
        })),

      markPolicyAsRead: (policyId) =>
        set((state) => {
          if (state.readPolicyIds.includes(policyId)) return state;
          return {
            readPolicyIds: [...state.readPolicyIds, policyId],
          };
        }),

      acknowledgePolicy: (policyId) =>
        set((state) => {
          const acked = state.acknowledgedPolicyIds.includes(policyId)
            ? state.acknowledgedPolicyIds
            : [...state.acknowledgedPolicyIds, policyId];
          const allAcked = mockPolicies.every((p) => acked.includes(p.id));
          return {
            acknowledgedPolicyIds: acked,
            stepStatus: {
              ...state.stepStatus,
              policies: allAcked ? 'completed' : 'in_progress',
            },
          };
        }),

      acknowledgeAllPolicies: () =>
        set((state) => {
          const allIds = mockPolicies.map((p) => p.id);
          return {
            readPolicyIds: allIds,
            acknowledgedPolicyIds: allIds,
            stepStatus: {
              ...state.stepStatus,
              policies: 'completed',
            },
          };
        }),

      updateTrainingProgress: (moduleId, progress, completed = false) =>
        set((state) => {
          const updated = state.trainingModules.map((m) => {
            if (m.id === moduleId) {
              const isDone = completed || progress >= 100;
              return {
                ...m,
                progress: isDone ? 100 : Math.max(m.progress, progress),
                isCompleted: isDone,
              };
            }
            return m;
          });
          const allCompleted = updated.every((m) => m.isCompleted);
          return {
            trainingModules: updated,
            stepStatus: {
              ...state.stepStatus,
              training: allCompleted ? 'completed' : 'in_progress',
            },
          };
        }),

      toggleChecklistItem: (itemId) =>
        set((state) => {
          const updated = state.checklist.map((item) =>
            item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item,
          );
          const allCompleted = updated.every((item) => item.isCompleted);
          return {
            checklist: updated,
            stepStatus: {
              ...state.stepStatus,
              checklist: allCompleted ? 'completed' : 'in_progress',
            },
          };
        }),

      markNotificationAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n,
          ),
        })),

      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      submitOnboarding: () =>
        set((state) => ({
          isSubmitted: true,
          submittedAt: new Date().toISOString(),
          stepStatus: {
            ...state.stepStatus,
            checklist: 'completed',
          },
          notifications: [
            {
              id: `notif-${Date.now()}`,
              title: 'Onboarding Completed!',
              description: 'All your onboarding prerequisites have been successfully verified.',
              time: 'Just now',
              read: false,
              type: 'success',
            },
            ...state.notifications,
          ],
        })),

      resetOnboarding: () =>
        set({
          candidate: mockCandidate,
          stepStatus: initialStepStatus,
          offerAccepted: false,
          offerAcceptedDate: undefined,
          personalDraft: {},
          bankDraft: {
            taxRegime: 'New Regime',
            accountType: 'Savings',
          },
          uploadedDocs: [],
          readPolicyIds: [],
          acknowledgedPolicyIds: [],
          trainingModules: mockTrainingModules.map((m) => ({ ...m, progress: 0, isCompleted: false })),
          checklist: mockChecklistItems.map((c, i) => ({ ...c, isCompleted: i === 0 })),
          notifications: initialNotifications,
          isSubmitted: false,
          submittedAt: undefined,
        }),
    }),
    {
      name: 'onboardly-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stepStatus: state.stepStatus,
        offerAccepted: state.offerAccepted,
        offerAcceptedDate: state.offerAcceptedDate,
        personalDraft: state.personalDraft,
        bankDraft: state.bankDraft,
        uploadedDocs: state.uploadedDocs,
        readPolicyIds: state.readPolicyIds,
        acknowledgedPolicyIds: state.acknowledgedPolicyIds,
        trainingModules: state.trainingModules,
        checklist: state.checklist,
        notifications: state.notifications,
        isSubmitted: state.isSubmitted,
        submittedAt: state.submittedAt,
      }),
    },
  ),
);

/**
 * Derived selector for overall progress (0 to 100).
 * Overall progress = completed steps / 8 * 100
 */
export const selectOverallProgress = (state: OnboardingState): number => {
  const steps = STEP_ORDER;
  const completedCount = steps.filter((stepId) => state.stepStatus[stepId] === 'completed').length;
  return Math.round((completedCount / steps.length) * 100);
};

export const selectCompletedStepsCount = (state: OnboardingState): number => {
  return STEP_ORDER.filter((stepId) => state.stepStatus[stepId] === 'completed').length;
};

export const selectInProgressStepsCount = (state: OnboardingState): number => {
  return STEP_ORDER.filter((stepId) => state.stepStatus[stepId] === 'in_progress').length;
};

export const selectPendingStepsCount = (state: OnboardingState): number => {
  return STEP_ORDER.filter((stepId) => state.stepStatus[stepId] === 'not_started').length;
};

/**
 * Route guard helper:
 * Steps 3-8 are locked until previous required step completed.
 * Steps order:
 * 1. welcome (required)
 * 2. personal (required)
 * 3. documents (required)
 * 4. bank (required)
 * 5. policies (required)
 * 6. training (optional: unlocked after policies, can continue to next step even if incomplete)
 * 7. team (optional: unlocked after policies)
 * 8. checklist (unlocked after previous steps)
 */
export const isStepLocked = (stepId: StepId, stepStatus: StepProgressState): boolean => {
  switch (stepId) {
    case 'welcome':
      return false; // Step 1 is always unlocked
    case 'personal':
      // Requires welcome to be completed
      return stepStatus.welcome !== 'completed';
    case 'documents':
      // Requires personal to be completed
      return stepStatus.personal !== 'completed';
    case 'bank':
      // Requires documents to be completed
      return stepStatus.documents !== 'completed';
    case 'policies':
      // Requires bank to be completed
      return stepStatus.bank !== 'completed';
    case 'training':
      // Requires policies to be completed
      return stepStatus.policies !== 'completed';
    case 'team':
      // Requires policies to be completed
      return stepStatus.policies !== 'completed';
    case 'checklist':
      // Requires previous required steps to be completed
      return (
        stepStatus.welcome !== 'completed' ||
        stepStatus.personal !== 'completed' ||
        stepStatus.documents !== 'completed' ||
        stepStatus.bank !== 'completed' ||
        stepStatus.policies !== 'completed'
      );
    default:
      return false;
  }
};
