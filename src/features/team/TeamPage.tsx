import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MessageSquare,
  Linkedin,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding.store';
import { mockTeamMembers } from '@/mocks/team';
import { PageHeader } from '@/components/layout/PageHeader';
import { StepFooter } from '@/components/layout/StepFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TeamMember } from '@/types';

export const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const setStepStatus = useOnboardingStore((state) => state.setStepStatus);

  const [teamList, setTeamList] = useState<TeamMember[]>(mockTeamMembers);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [meetingDate, setMeetingDate] = useState('2026-10-16');
  const [meetingTime, setMeetingTime] = useState('03:00 PM');
  const [meetingTopic, setMeetingTopic] = useState('Introductory Sync & Onboarding Questions');

  const manager = teamList.find((m) => m.isManager) || teamList[0]!;
  const peers = teamList.filter((m) => !m.isManager);

  const handleMessage = (member: TeamMember) => {
    toast.info('Message Sent', `Direct message opened with ${member.name} (${member.email})`);
  };

  const handleLinkedIn = (member: TeamMember) => {
    window.open(member.linkedinUrl, '_blank', 'noopener,noreferrer');
    toast.info('LinkedIn Profile', `Opening ${member.name}'s profile in a new tab.`);
  };

  const handleOpenScheduleModal = (member: TeamMember) => {
    setSelectedMember(member);
    setMeetingTopic(`Introductory 1:1 with ${member.name}`);
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setTeamList((prev) =>
      prev.map((m) =>
        m.id === selectedMember.id
          ? {
              ...m,
              scheduledMeeting: {
                date: meetingDate,
                time: meetingTime,
                topic: meetingTopic,
              },
            }
          : m,
      ),
    );

    toast.success(
      'Meeting Scheduled!',
      `Invitation sent to ${selectedMember.name} for ${meetingDate} at ${meetingTime}.`,
    );
    setSelectedMember(null);
  };

  const handleContinue = () => {
    setStepStatus('team', 'completed');
    toast.success('Team Section Complete', 'Moving to Day-1 Checklist.');
    navigate('/checklist');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        stepId="team"
        title="Meet Your Engineering Team"
        description="Connect with your leadership, buddy, and cross-functional partners. Schedule 1:1 check-ins ahead of your first week."
        badge={<StatusBadge status={stepStatus.team} size="md" />}
      />

      {/* 1. Manager Highlight Card */}
      <Card className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 border-indigo-200/80 dark:border-indigo-900/80 text-left">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600 text-white font-heading font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                {manager.avatarInitials}
              </div>
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900">
                <UserCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Reporting Manager
                </span>
                <span className="text-xs text-slate-400">{manager.department}</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-slate-100">
                {manager.name}
              </h3>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {manager.role}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed pt-1">
                {manager.bio}
              </p>
            </div>
          </div>

          {/* Manager Action & Meeting Info */}
          <div className="flex flex-col sm:items-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200/60 dark:border-slate-800">
            {manager.scheduledMeeting ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>
                  Confirmed: {manager.scheduledMeeting.date} ({manager.scheduledMeeting.time})
                </span>
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleOpenScheduleModal(manager)}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule 1:1 with Manager
              </Button>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMessage(manager)}
                className="text-xs gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Slack Ping
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleLinkedIn(manager)}
                className="text-xs gap-1.5"
              >
                <Linkedin className="w-3.5 h-3.5" />
                LinkedIn
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Team Grid */}
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-slate-100">
              Teammates & Collaboration Partners
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Engineers, product designers, and QA leads you will be working closely with.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {peers.length} Colleagues
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {peers.map((member) => (
            <Card
              key={member.id}
              className="flex flex-col justify-between p-5 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-heading font-bold text-sm ${member.avatarColor} shadow-sm`}
                    >
                      {member.avatarInitials}
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {member.department}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {member.role}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {member.bio}
                </p>

                {/* Scheduled meeting chip if exists */}
                {member.scheduledMeeting && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-100 dark:border-indigo-900/50">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      Sync: {member.scheduledMeeting.date} ({member.scheduledMeeting.time})
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenScheduleModal(member)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {member.scheduledMeeting ? 'Reschedule' : 'Book 1:1'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMessage(member)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label={`Ping ${member.name}`}
                    title="Slack direct message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLinkedIn(member)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label={`LinkedIn for ${member.name}`}
                    title="LinkedIn profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Step Footer */}
      <StepFooter
        backTo="/training"
        nextTo="/checklist"
        canContinue={true}
        onContinue={handleContinue}
        continueText="Continue to Day-1 Checklist"
      />

      {/* Schedule 1:1 Dialog */}
      {selectedMember && (
        <Dialog
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={`Schedule 1:1 with ${selectedMember.name}`}
          description={`Role: ${selectedMember.role} • ${selectedMember.email}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmSchedule} className="space-y-4 text-left">
            <Input
              label="Meeting Topic / Agenda"
              required
              value={meetingTopic}
              onChange={(e) => setMeetingTopic(e.target.value)}
              placeholder="e.g. Welcome Coffee Chat & Architecture Overview"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                required
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
              />

              <Select
                label="Time Slot"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
              >
                <option value="10:00 AM">10:00 AM - 10:30 AM</option>
                <option value="11:30 AM">11:30 AM - 12:00 PM</option>
                <option value="02:00 PM">02:00 PM - 02:30 PM</option>
                <option value="03:00 PM">03:00 PM - 03:30 PM</option>
                <option value="04:30 PM">04:30 PM - 05:00 PM</option>
              </Select>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 space-y-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Platform: Google Meet
              </span>
              <p>Calendar invitation and video link will be synced automatically.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedMember(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Confirm Invitation
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
};
