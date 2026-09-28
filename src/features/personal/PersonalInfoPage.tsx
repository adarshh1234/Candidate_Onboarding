import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Home,
  Shield,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useOnboardingStore } from '@/store/onboarding.store';
import { personalInfoSchema, PersonalInfoFormData } from './personal.schema';
import { PageHeader } from '@/components/layout/PageHeader';
import { StepFooter } from '@/components/layout/StepFooter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { StatusBadge } from '@/components/common/StatusBadge';

export const PersonalInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const candidate = useOnboardingStore((state) => state.candidate);
  const stepStatus = useOnboardingStore((state) => state.stepStatus);
  const personalDraft = useOnboardingStore((state) => state.personalDraft);
  const savePersonalDraft = useOnboardingStore((state) => state.savePersonalDraft);
  const setStepStatus = useOnboardingStore((state) => state.setStepStatus);
  const setCandidate = useOnboardingStore((state) => state.setCandidate);

  const defaultValues: PersonalInfoFormData = {
    fullName: personalDraft.fullName || candidate.name || '',
    email: personalDraft.email || candidate.email || '',
    phone: personalDraft.phone || '+91 9876543210',
    dob: personalDraft.dob || '1996-05-18',
    gender: personalDraft.gender ?? 'male',
    address: personalDraft.address || '402, Green Glen Layout, Bellandur Outer Ring Road',
    city: personalDraft.city || 'Bengaluru',
    state: personalDraft.state || 'Karnataka',
    pincode: personalDraft.pincode || '560103',
    country: personalDraft.country || 'India',
    emergencyName: personalDraft.emergencyName || 'Kavita Sharma',
    emergencyRelation: personalDraft.emergencyRelation || 'Mother',
    emergencyPhone: personalDraft.emergencyPhone || '+91 9845012345',
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
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
        savePersonalDraft(formValues);
      }, 600);
    }
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [formValues, isDirty, savePersonalDraft]);

  const onSubmit = (data: PersonalInfoFormData) => {
    savePersonalDraft(data);
    setCandidate({
      name: data.fullName,
      email: data.email,
    });
    setStepStatus('personal', 'completed');
    toast.success('Personal Info Saved', 'Your personal and emergency records are updated.');
    navigate('/documents');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        stepId="personal"
        title="Personal Profile & Contacts"
        description="Submit your legal identity information, residential coordinates, and emergency contact for official records."
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
            <StatusBadge status={stepStatus.personal} size="md" />
          </div>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
        {/* Section 1: Basic Identity */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                Primary Candidate Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your legal name must match your government photo identification.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Legal Name"
              required
              leftIcon={<User className="w-4 h-4" />}
              placeholder="e.g. Aarav Sharma"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Official Email Address"
              required
              type="email"
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="e.g. name@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number (Indian)"
              required
              leftIcon={<Phone className="w-4 h-4" />}
              placeholder="+91 9876543210"
              helperText="10 digits with optional +91 prefix"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Date of Birth"
              required
              type="date"
              leftIcon={<Calendar className="w-4 h-4" />}
              helperText="Must be 18 years or older"
              error={errors.dob?.message}
              {...register('dob')}
            />

            <div className="sm:col-span-2">
              <Select
                label="Gender Identity"
                required
                error={errors.gender?.message}
                {...register('gender')}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non_binary">Non-Binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Section 2: Residential Address */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Home className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                Current Residential Address
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Used for dispatching official IT equipment and welcome kit.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Textarea
              label="Street Address / Building / Flat No."
              required
              rows={2}
              placeholder="House/Apt No., Building, Street Name, Area"
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="City"
                required
                placeholder="e.g. Bengaluru"
                error={errors.city?.message}
                {...register('city')}
              />

              <Input
                label="State"
                required
                placeholder="e.g. Karnataka"
                error={errors.state?.message}
                {...register('state')}
              />

              <Input
                label="Pincode (6 digits)"
                required
                placeholder="e.g. 560103"
                error={errors.pincode?.message}
                {...register('pincode')}
              />

              <Input
                label="Country"
                required
                placeholder="e.g. India"
                error={errors.country?.message}
                {...register('country')}
              />
            </div>
          </div>
        </Card>

        {/* Section 3: Emergency Contact */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100">
                Emergency Contact Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized primary contact in case of an urgent medical or workplace emergency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Contact Person Name"
              required
              placeholder="e.g. Kavita Sharma"
              error={errors.emergencyName?.message}
              {...register('emergencyName')}
            />

            <Input
              label="Relationship"
              required
              placeholder="e.g. Spouse / Parent / Sibling"
              error={errors.emergencyRelation?.message}
              {...register('emergencyRelation')}
            />

            <Input
              label="Emergency Phone"
              required
              leftIcon={<Phone className="w-4 h-4" />}
              placeholder="+91 9845012345"
              error={errors.emergencyPhone?.message}
              {...register('emergencyPhone')}
            />
          </div>
        </Card>

        {/* Step Footer */}
        <StepFooter
          backTo="/welcome"
          canContinue={true}
          isSubmitting={isSubmitting}
          continueText="Save & Continue to Documents"
        />
      </form>
    </div>
  );
};
