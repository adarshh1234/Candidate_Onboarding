import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Calendar,
  Send,
  UserCheck,
  Plus,
} from 'lucide-react';
import { RecruiterCandidate } from '@/types';
import { useHiringStore } from '@/store/hiring.store';
import { StatusPill } from './StatusPill';
import { ProgressRing } from '@/components/common/ProgressRing';
import { TimelineList } from './TimelineList';
import { ReasonDialog } from './ReasonDialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { cn, formatBytes } from '@/lib/utils';

interface CandidateDrawerProps {
  candidate: RecruiterCandidate | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAssignDialog?: (type: 'manager' | 'buddy') => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
  candidate,
  isOpen,
  onClose,
  onOpenAssignDialog,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents' | 'notes'>('overview');
  const [newNoteText, setNewNoteText] = useState('');
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);

  const approveDocument = useHiringStore((state) => state.approveDocument);
  const rejectDocument = useHiringStore((state) => state.rejectDocument);
  const addCandidateNote = useHiringStore((state) => state.addCandidateNote);
  const releaseOffer = useHiringStore((state) => state.releaseOffer);
  const activityLog = useHiringStore((state) => state.activityLog);

  if (!candidate) return null;

  const candidateTimeline = activityLog.filter(
    (item) => item.candidateId === candidate.id,
  );

  const handleApproveDoc = (docId: string) => {
    approveDocument(candidate.id, docId);
    toast.success('Document Verified', 'Marked official proof as verified.');
  };

  const handleConfirmRejectDoc = (reason: string) => {
    if (!rejectingDocId) return;
    rejectDocument(candidate.id, rejectingDocId, reason);
    toast.info('Document Rejected', 'Rejection reason logged and candidate notified.');
    setRejectingDocId(null);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    addCandidateNote(candidate.id, newNoteText.trim());
    setNewNoteText('');
    toast.success('Note Added', 'Recruiter note recorded on candidate file.');
  };

  const handleReleaseOfferQuick = () => {
    releaseOffer(candidate.id);
    toast.success('Offer Released', `Published offer for ${candidate.name}.`);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              aria-hidden="true"
            />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="w-screen max-w-2xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col text-left"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-500/20 shadow-md shrink-0"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading text-xl font-extrabold text-slate-900 dark:text-slate-100 truncate">
                            {candidate.name}
                          </h3>
                          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                            {candidate.candidateCode}
                          </span>
                          <StatusPill status={candidate.stage} size="md" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {candidate.role} • {candidate.department}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {candidate.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Starts {candidate.startDate}
                          </span>
                          <span>•</span>
                          <span>Owner: {candidate.recruiterOwner}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-center">
                        <ProgressRing progress={candidate.overallProgress} size={52} strokeWidth={5} />
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">Ready</span>
                      </div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Close candidate sheet"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 flex-wrap">
                    {candidate.offer.status !== 'Released' && candidate.offer.status !== 'Accepted' && (
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleReleaseOfferQuick}
                        className="text-xs bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white gap-1.5 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Release Offer
                      </Button>
                    )}
                    {onOpenAssignDialog && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenAssignDialog('manager')}
                          className="text-xs gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {candidate.buddyManager.managerName ? 'Change Manager' : 'Assign Manager'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onOpenAssignDialog('buddy')}
                          className="text-xs gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {candidate.buddyManager.buddyName ? 'Change Buddy' : 'Assign Buddy'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                  <div className="flex gap-6">
                    {(['overview', 'timeline', 'documents', 'notes'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          'py-3.5 text-xs font-bold capitalize border-b-2 transition-all',
                          activeTab === tab
                            ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300',
                        )}
                      >
                        {tab === 'documents'
                          ? `Documents (${candidate.documents.length})`
                          : tab === 'notes'
                            ? `Notes (${candidate.notes.length})`
                            : tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Compensation Card */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Offer & Compensation
                          </h4>
                          <StatusPill status={candidate.offer.status} size="sm" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-slate-400 text-[11px] block">Annual CTC</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{candidate.offer.annualCTC}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Joining Bonus</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{candidate.offer.joiningBonus}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Equity / ESOP</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{candidate.offer.equityGrant}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[11px] block">Version</span>
                            <span className="font-bold text-slate-900 dark:text-slate-100">v{candidate.offer.version}</span>
                          </div>
                        </div>
                      </div>

                      {/* Team & Leadership */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Direct Manager & Buddy
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-indigo-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Direct Manager</span>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {candidate.buddyManager.managerName || 'Unassigned'}
                              </p>
                              {candidate.buddyManager.managerRole && (
                                <p className="text-[11px] text-slate-400 truncate">{candidate.buddyManager.managerRole}</p>
                              )}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-teal-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Peer Buddy</span>
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {candidate.buddyManager.buddyName || 'Unassigned'}
                              </p>
                              {candidate.buddyManager.buddyRole && (
                                <p className="text-[11px] text-slate-400 truncate">{candidate.buddyManager.buddyRole}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Background Verification summary */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Background Verification (TAT Due: {candidate.bgv.tatDueDate})
                          </h4>
                          <StatusPill status={candidate.bgv.status} size="sm" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {candidate.bgv.checks.map((chk) => (
                            <div key={chk.type} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                              <span className="text-[10px] text-slate-400 block">{chk.type}</span>
                              <div className="mt-0.5">
                                <StatusPill status={chk.status} size="sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Provisions summary */}
                      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          IT & Facilities Provisions
                        </h4>
                        <div className="space-y-1.5 text-xs">
                          {candidate.provisions.length === 0 ? (
                            <p className="text-xs text-slate-400">Standard provisioning kit not yet triggered.</p>
                          ) : (
                            candidate.provisions.map((prov) => (
                              <div key={prov.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{prov.item}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">{prov.category}</span>
                                  <StatusPill status={prov.status} size="sm" />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: TIMELINE */}
                  {activeTab === 'timeline' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Candidate Activity Audit Trail
                      </h4>
                      <TimelineList items={candidateTimeline} />
                    </div>
                  )}

                  {/* TAB 3: DOCUMENTS */}
                  {activeTab === 'documents' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Uploaded Credentials
                        </h4>
                        <span className="text-xs text-slate-400">{candidate.documents.length} files on record</span>
                      </div>

                      {candidate.documents.length === 0 ? (
                        <p className="py-8 text-center text-xs text-slate-400">No documents uploaded yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {candidate.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                    {doc.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    {formatBytes(doc.size)} • Type: {doc.type.replace('_', ' ')}
                                  </p>
                                </div>
                                <StatusPill status={doc.status || 'pending_review'} size="sm" />
                              </div>

                              {doc.rejectionReason && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                                  <strong>Reason:</strong> {doc.rejectionReason}
                                </p>
                              )}

                              {doc.status !== 'verified' && (
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                                  <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setRejectingDocId(doc.id)}
                                    className="text-xs"
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleApproveDoc(doc.id)}
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    Approve & Verify
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: NOTES */}
                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      {/* Add note form */}
                      <form onSubmit={handleAddNote} className="space-y-2">
                        <Textarea
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="Log interview feedback, relocation queries, or hiring manager remarks..."
                          rows={3}
                          className="text-xs"
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={!newNoteText.trim()}
                            className="text-xs bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Note
                          </Button>
                        </div>
                      </form>

                      {/* Notes list */}
                      <div className="space-y-3 pt-2">
                        {candidate.notes.length === 0 ? (
                          <p className="py-6 text-center text-xs text-slate-400">No notes recorded yet.</p>
                        ) : (
                          candidate.notes.map((note) => (
                            <div
                              key={note.id}
                              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1"
                            >
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{note.author}</span>
                                <span>{note.date}</span>
                              </div>
                              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                                {note.text}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Document Reason Dialog */}
      {rejectingDocId && (
        <ReasonDialog
          isOpen={!!rejectingDocId}
          onClose={() => setRejectingDocId(null)}
          onConfirm={handleConfirmRejectDoc}
          title="Reject Document & Request Re-upload"
          description="Provide a clear, specific reason so the candidate understands what needs correction."
        />
      )}
    </>
  );
};
