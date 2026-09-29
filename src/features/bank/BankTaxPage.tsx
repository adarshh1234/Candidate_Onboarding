import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreditCard,
  ShieldCheck,
  Building,
  Eye,
  EyeOff,
  Lock,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding.store';
import { bankTaxSchema, BankTaxFormData } from './bank.schema';
import { maskAccountNumber, maskPan } from '@/lib/mask';
import { PageHeader } from '@/components/layout/PageHeader';
import { StepFooter } from '@/components/layout/StepFooter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { StatusBadge } from '@/components/common/StatusBadge';

export const BankTaxPage: React.FC = () => {
  const navigate = useNavigate();
  const candidate = useOnboardingStore((state) => state.candidate);
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const bankDraft = useOnboardingStore((state) => state.bankDraft);
  const saveBankDraft = useOnboardingStore((state) => state.saveBankDraft);
  const setStepStatus = useOnboardingStore((state) => state.setStepStatus);

  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showPan, setShowPan] = useState(false);
  const [isAccountFocused, setIsAccountFocused] = useState(false);
  const [isPanFocused, setIsPanFocused] = useState(false);

  const defaultValues: BankTaxFormData = {
    accountHolder: bankDraft.accountHolder || candidate.name || '',
    accountNumber: bankDraft.accountNumber || '5010023910842',
    confirmAccountNumber: bankDraft.confirmAccountNumber || '5010023910842',
    ifscCode: bankDraft.ifscCode || 'HDFC0001234',
    bankName: bankDraft.bankName || 'HDFC Bank',
    branchName: bankDraft.branchName || 'Koramangala 4th Block, Bengaluru',
    accountType: bankDraft.accountType ?? 'Savings',
    panNumber: bankDraft.panNumber || 'ABCDE1234F',
    uanNumber: bankDraft.uanNumber || '101294827103',
    taxRegime: bankDraft.taxRegime ?? 'New Regime',
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<BankTaxFormData>({
    resolver: zodResolver(bankTaxSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const formValues = watch();
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced Autosave
  useEffect(() => {
    if (isDirty) {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(() => {
        saveBankDraft(formValues);
      }, 600);
    }
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [formValues, isDirty, saveBankDraft]);

  const onSubmit = (data: BankTaxFormData) => {
    saveBankDraft(data);
    setStepStatus('bank', 'completed');
    toast.success('Bank & Tax Saved', 'Direct deposit and tax compliance details submitted.');
    navigate('/candidate/policies');
  };

  const currentAccountNumber = watch('accountNumber') || '';
  const currentPan = watch('panNumber') || '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        stepId="bank"
        title="Direct Deposit & Tax Declaration"
        description="Provide Indian banking details for monthly payroll disbursement, PAN identification, and select your tax withholding regime."
        badge={
          <div className="flex items-center gap-2">
            {isDirty ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <Save className="w-3 h-3 animate-pulse" /> Autosaving...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}
            <StatusBadge status={stepStatus.bank} size="md" />
          </div>
        }
      />

      {/* Security Banner */}
      <Card className="p-4 bg-gradient-to-r from-emerald-50/70 to-teal-50/40 dark:from-slate-900 dark:to-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60 text-left">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-heading text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Bank-Grade 256-Bit Data Encryption
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your financial identifiers are tokenized using AES-256 encryption. Details are strictly
              utilized by Finance & Payroll for statutory salary credits and Form 16 TDS filings.
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
        {/* Section 1: Bank Account Details */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                Salary Disbursement Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Must be an active Indian bank account registered under your legal name.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Account Holder Name (As per Bank Records)"
                required
                placeholder="e.g. Aarav Sharma"
                error={errors.accountHolder?.message}
                {...register('accountHolder')}
              />
            </div>

            {/* Account Number with Masking */}
            <div>
              <Input
                label="Bank Account Number"
                required
                placeholder="Enter 9 to 18 digit account number"
                type={showAccountNumber || isAccountFocused ? 'text' : 'password'}
                value={
                  !showAccountNumber && !isAccountFocused && currentAccountNumber
                    ? maskAccountNumber(currentAccountNumber)
                    : currentAccountNumber
                }
                onFocus={() => setIsAccountFocused(true)}
                onBlur={() => setIsAccountFocused(false)}
                onChange={(e) => {
                  setValue('accountNumber', e.target.value, { shouldValidate: true, shouldDirty: true });
                }}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber((prev) => !prev)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showAccountNumber ? 'Hide account number' : 'Show account number'}
                  >
                    {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                error={errors.accountNumber?.message}
              />
            </div>

            {/* Confirm Account Number */}
            <Input
              label="Confirm Bank Account Number"
              required
              type="password"
              placeholder="Re-enter bank account number"
              error={errors.confirmAccountNumber?.message}
              {...register('confirmAccountNumber')}
            />

            {/* IFSC Code */}
            <Input
              label="IFSC Code"
              required
              placeholder="e.g. HDFC0001234"
              helperText="11-character alphanumeric code"
              error={errors.ifscCode?.message}
              {...register('ifscCode', {
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
            />

            {/* Account Type */}
            <Select
              label="Account Type"
              required
              error={errors.accountType?.message}
              {...register('accountType')}
            >
              <option value="Savings">Savings Account</option>
              <option value="Current">Current Account</option>
            </Select>

            {/* Bank Name */}
            <Input
              label="Bank Name"
              required
              placeholder="e.g. HDFC Bank / ICICI Bank / SBI"
              error={errors.bankName?.message}
              {...register('bankName')}
            />

            {/* Branch Name */}
            <Input
              label="Branch Name & Location"
              required
              placeholder="e.g. Koramangala 4th Block, Bengaluru"
              error={errors.branchName?.message}
              {...register('branchName')}
            />
          </div>
        </Card>

        {/* Section 2: Statutory Tax & Identity */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                Tax Identification & PF Declaration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Permanent Account Number (PAN) and Universal Account Number (UAN) for EPFO.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PAN Number with Masking */}
            <div>
              <Input
                label="PAN (Permanent Account Number)"
                required
                placeholder="e.g. ABCDE1234F"
                type={showPan || isPanFocused ? 'text' : 'password'}
                value={
                  !showPan && !isPanFocused && currentPan ? maskPan(currentPan) : currentPan
                }
                onFocus={() => setIsPanFocused(true)}
                onBlur={() => setIsPanFocused(false)}
                onChange={(e) => {
                  const upper = e.target.value.toUpperCase();
                  setValue('panNumber', upper, { shouldValidate: true, shouldDirty: true });
                }}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPan((prev) => !prev)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPan ? 'Hide PAN' : 'Show PAN'}
                  >
                    {showPan ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                helperText="10-digit alphanumeric tax identifier"
                error={errors.panNumber?.message}
              />
            </div>

            {/* UAN Optional */}
            <Input
              label="UAN - Universal Account Number (Optional)"
              placeholder="12-digit EPFO number"
              helperText="Only if previously enrolled in Provident Fund (PF)"
              error={errors.uanNumber?.message}
              {...register('uanNumber')}
            />

            {/* Tax Regime Selection */}
            <div className="sm:col-span-2">
              <Select
                label="Preferred Income Tax Regime"
                required
                helperText="Can be adjusted during annual income tax declarations in April"
                error={errors.taxRegime?.message}
                {...register('taxRegime')}
              >
                <option value="New Regime">New Tax Regime (Lower slab rates, default u/s 115BAC)</option>
                <option value="Old Regime">Old Tax Regime (Allows 80C, 80D, HRA deductions)</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Step Footer */}
        <StepFooter
          backTo="/candidate/documents"
          canContinue={true}
          isSubmitting={isSubmitting}
          continueText="Save & Continue to Policies"
        />
      </form>
    </div>
  );
};
