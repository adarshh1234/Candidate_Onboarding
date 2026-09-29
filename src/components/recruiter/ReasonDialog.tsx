import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Tag } from 'lucide-react';

interface ReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  presets?: string[];
  placeholder?: string;
  confirmLabel?: string;
}

export const ReasonDialog: React.FC<ReasonDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  presets = [
    'Blurry or unreadable scan',
    'Expired document / Invalid validity date',
    'Wrong document uploaded',
    'Missing official stamp or seal',
    'Four corners not completely visible',
    'Name mismatch with government records',
  ],
  placeholder = 'Describe the exact reason so the candidate can resolve this immediately...',
  confirmLabel = 'Reject & Notify Candidate',
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A specific reason is required.');
      return;
    }
    onConfirm(reason.trim());
    setReason('');
    setError(null);
    onClose();
  };

  const handleSelectPreset = (preset: string) => {
    setReason(preset);
    setError(null);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {description}
        </p>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400" />
            <span>Select Preset Reason:</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all text-left ${
                  reason === p
                    ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Reason Textarea */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Rejection Explanation <span className="text-rose-500">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            rows={3}
            className="text-xs"
          />
          {error && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            size="sm"
          >
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
