import { describe, it, expect, beforeEach } from 'vitest';
import { useHiringStore } from '@/store/hiring.store';
import { useOnboardingStore } from '@/store/onboarding.store';

describe('Hiring Store & Cross-Portal Reactivity', () => {
  beforeEach(() => {
    useHiringStore.getState().resetDemo();
    useOnboardingStore.getState().resetOnboarding();
  });

  it('recruiter releasing offer reflects in candidate data and activity log', () => {
    const store = useHiringStore.getState();
    const candidateId = 'CAND-001';

    // Initial offer state
    let candidate = store.getCandidate(candidateId);
    expect(candidate).toBeDefined();

    // Recruiter releases the offer
    store.releaseOffer(candidateId);

    // Verify candidate offer is now Released
    candidate = useHiringStore.getState().getCandidate(candidateId);
    expect(candidate?.offer?.status).toBe('Released');
    expect(candidate?.stage).toBe('Offer Released');

    // Verify activity log captured the action
    const activity = useHiringStore.getState().activityLog;
    const releaseLog = activity.find(
      (a) => a.candidateId === candidateId && a.action === 'Offer Released'
    );
    expect(releaseLog).toBeDefined();
  });

  it('candidate accepting offer updates recruiter offer pipeline to Accepted', () => {
    const store = useHiringStore.getState();
    const candidateId = 'CAND-001';

    // Candidate accepts offer
    store.acceptOfferByCandidate(candidateId);

    const candidate = useHiringStore.getState().getCandidate(candidateId);
    expect(candidate?.offer?.status).toBe('Accepted');
    expect(candidate?.stage).toBe('Offer Accepted');
    expect(candidate?.offer?.acceptedAt).toBeDefined();

    // Verify activity log
    const activity = useHiringStore.getState().activityLog;
    const acceptLog = activity.find(
      (a) => a.candidateId === candidateId && a.action.includes('Accepted')
    );
    expect(acceptLog).toBeDefined();
  });

  it('candidate uploading doc sets pending review; recruiter reject stores reason and notifies candidate', () => {
    const store = useHiringStore.getState();
    const candidateId = 'CAND-001';

    // Candidate uploads a new document
    store.uploadCandidateDocument(candidateId, {
      id: 'doc-test-1',
      type: 'degree',
      name: 'BTech_Degree_Certificate.pdf',
      size: 1024 * 1024,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
    });

    let candidate = useHiringStore.getState().getCandidate(candidateId);
    const uploadedDoc = candidate?.documents.find((d) => d.id === 'doc-test-1');
    expect(uploadedDoc).toBeDefined();
    expect(uploadedDoc?.status).toBe('pending_review');

    // Recruiter rejects document with reason
    const reason = 'Blurry scan of degree certificate. Please provide a clear 300 DPI color scan.';
    store.rejectDocument(candidateId, 'doc-test-1', reason);

    candidate = useHiringStore.getState().getCandidate(candidateId);
    const rejectedDoc = candidate?.documents.find((d) => d.id === 'doc-test-1');
    expect(rejectedDoc?.status).toBe('rejected');
    expect(rejectedDoc?.rejectionReason).toBe(reason);

    // Verify candidate received notification in onboarding store
    const notifications = useOnboardingStore.getState().notifications;
    const notif = notifications.find((n) => n.title.includes('Document Rejected'));
    expect(notif).toBeDefined();
    expect(notif?.description).toContain(reason);
  });

  it('recruiter approving document marks status as verified', () => {
    const store = useHiringStore.getState();
    const candidateId = 'CAND-001';

    // Candidate uploads document
    store.uploadCandidateDocument(candidateId, {
      id: 'doc-pan-1',
      type: 'govt_id',
      name: 'PAN_Card.pdf',
      size: 500000,
      mimeType: 'application/pdf',
      uploadedAt: new Date().toISOString(),
    });

    // Recruiter approves document
    store.approveDocument(candidateId, 'doc-pan-1');

    const candidate = useHiringStore.getState().getCandidate(candidateId);
    const doc = candidate?.documents.find((d) => d.id === 'doc-pan-1');
    expect(doc?.status).toBe('verified');
  });

  it('assigning buddy and manager updates candidate profile', () => {
    const store = useHiringStore.getState();
    const candidateId = 'CAND-001';

    store.assignBuddyAndManager(candidateId, {
      managerId: 'EMP-101',
      managerName: 'Sarah Jenkins',
      managerRole: 'VP of Engineering',
      managerEmail: 'sarah.jenkins@apex.com',
      buddyId: 'EMP-102',
      buddyName: 'Vikram Patel',
      buddyRole: 'Staff Frontend Engineer',
      buddyEmail: 'vikram.patel@apex.com',
    });

    const candidate = useHiringStore.getState().getCandidate(candidateId);
    expect(candidate?.buddyManager.managerName).toBe('Sarah Jenkins');
    expect(candidate?.buddyManager.buddyName).toBe('Vikram Patel');
  });
});
