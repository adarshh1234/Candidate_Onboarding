import React, { useState, useMemo } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useHiringStore } from '@/store/hiring.store';
import { ProvisionCategory, ProvisionStatus } from '@/types';
import { PROVISION_TABS, ProvisionTabId, ProvisionTabConfig } from '../provisions.constants';
import { toast } from '@/components/ui/toast';

interface AssignAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ProvisionTabId;
}

export const AssignAssetDialog: React.FC<AssignAssetDialogProps> = ({
  isOpen,
  onClose,
  activeTab,
}) => {
  const candidates = useHiringStore((state) => state.candidates);
  const updateCandidate = useHiringStore((state) => state.updateCandidate);
  const appendActivity = useHiringStore((state) => state.appendActivity);

  const fallbackTab = PROVISION_TABS[0] as ProvisionTabConfig;
  const currentTabConfig: ProvisionTabConfig = useMemo(
    () => PROVISION_TABS.find((t) => t.id === activeTab) ?? fallbackTab,
    [activeTab, fallbackTab]
  );

  const [candidateId, setCandidateId] = useState<string>(candidates[0]?.id || '');
  const [itemName, setItemName] = useState<string>(currentTabConfig.suggestedItems[0] || '');
  const [customItem, setCustomItem] = useState<string>('');
  const [category, setCategory] = useState<ProvisionCategory>(
    currentTabConfig.category === 'All' ? 'IT' : (currentTabConfig.category as ProvisionCategory)
  );
  const [status, setStatus] = useState<ProvisionStatus>('Requested');
  const [assignedTo, setAssignedTo] = useState<string>('IT Operations Team');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId) {
      toast.error('Please select a candidate');
      return;
    }

    const effectiveItem = customItem.trim() || itemName;
    if (!effectiveItem) {
      toast.error('Please specify an asset name');
      return;
    }

    const targetCand = candidates.find((c) => c.id === candidateId);
    if (!targetCand) return;

    const newProvision = {
      id: `prov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      item: effectiveItem,
      category,
      status,
      dueDate,
      assignedTo,
    };

    const existingProvisions = targetCand.provisions || [];
    updateCandidate(candidateId, {
      provisions: [...existingProvisions, newProvision],
    });

    appendActivity({
      actor: 'Recruiter Operations',
      candidateId,
      candidateName: targetCand.name,
      action: 'Asset Requisitioned',
      details: `Requisitioned ${effectiveItem} (${category}) for ${targetCand.name}.`,
      type: 'provision',
    });

    toast.success('Asset Assigned', `${effectiveItem} assigned to ${targetCand.name}.`);
    onClose();
    setCustomItem('');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={`Requisition & Assign Asset (${currentTabConfig.shortLabel})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Select Candidate *
          </label>
          <Select
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="w-full text-xs"
            required
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.role} — {c.department})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Suggested Asset Templates
          </label>
          <Select
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value);
              setCustomItem('');
            }}
            className="w-full text-xs"
          >
            {currentTabConfig.suggestedItems.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            <option value="">Custom Item...</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Asset Name / Specification
          </label>
          <Input
            value={customItem || itemName}
            onChange={(e) => setCustomItem(e.target.value)}
            placeholder="e.g. MacBook Pro M3 Max 64GB"
            className="w-full text-xs"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProvisionCategory)}
              className="w-full text-xs"
            >
              <option value="IT">IT Hardware & Cloud</option>
              <option value="Office Furniture">Office Furniture</option>
              <option value="Stationary">Stationary & Admin</option>
              <option value="Car">Company Car & Fleet</option>
              <option value="Home">Home Setup & Remote</option>
              <option value="Miscellaneous Assets">Miscellaneous Assets</option>
              <option value="Facilities">Facilities & Badging</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Status
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProvisionStatus)}
              className="w-full text-xs"
            >
              <option value="Requested">Requested</option>
              <option value="In Progress">In Progress</option>
              <option value="Ready">Ready for Handover</option>
              <option value="Delivered">Delivered / Deployed</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Owner / Assignee
            </label>
            <Input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. Facilities Admin"
              className="w-full text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target SLA / Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="bg-teal-700 hover:bg-teal-800 text-white"
          >
            Requisition Asset
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
