import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { loginSchema, LoginFormValues } from './schema';
import { useAuthStore, DEMO_CREDENTIALS } from '@/store/auth.store';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const [role, setRole] = useState<UserRole>('candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoBox, setShowDemoBox] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: DEMO_CREDENTIALS.candidate.email,
      password: DEMO_CREDENTIALS.candidate.password,
      rememberMe: true,
    },
  });

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setAuthError(null);
    setValue('email', DEMO_CREDENTIALS[newRole].email);
    setValue('password', DEMO_CREDENTIALS[newRole].password);
  };

  const handleAutofill = (targetRole: UserRole) => {
    setRole(targetRole);
    setAuthError(null);
    setValue('email', DEMO_CREDENTIALS[targetRole].email);
    setValue('password', DEMO_CREDENTIALS[targetRole].password);
    toast.info(
      'Demo Credentials Loaded',
      `Filled ${targetRole === 'candidate' ? 'Aarav Sharma' : 'Recruiter'} credentials.`,
    );
  };

  const onSubmit = (data: LoginFormValues) => {
    setAuthError(null);
    const success = login(role, data.email, data.password);

    if (success) {
      toast.success(
        'Welcome to Onboardly',
        `Authenticated as ${role === 'candidate' ? 'Candidate' : 'Recruiter'}.`,
      );
      const stateFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;
      if (stateFrom && !stateFrom.includes('/login')) {
        navigate(stateFrom, { replace: true });
      } else {
        navigate(role === 'candidate' ? '/candidate' : '/recruiter/final-list', { replace: true });
      }
    } else {
      setAuthError(`Invalid credentials or role mismatch for ${role} portal.`);
      setShakeKey((prev) => prev + 1);
    }
  };

  const isRecruiter = role === 'recruiter';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top right floating theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Brand Panel */}
        <div
          className={cn(
            'lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between text-white transition-all duration-500 relative overflow-hidden',
            isRecruiter
              ? 'bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900'
              : 'bg-gradient-to-br from-indigo-600 via-purple-700 to-slate-900',
          )}
        >
          {/* Subtle decorative circles */}
          <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          {/* Brand header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="font-heading text-2xl font-black tracking-tight text-white block leading-none">
                  Onboardly
                </span>
                <span className="text-[11px] font-semibold text-white/70 uppercase tracking-widest mt-1 block">
                  Enterprise Onboarding
                </span>
              </div>
            </div>

            <div className="pt-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                {isRecruiter
                  ? 'Candidate Pipelines & Readiness at Scale'
                  : 'Start Your Career Journey on Day 1'}
              </h2>
              <p className="mt-3 text-sm text-white/80 leading-relaxed font-normal">
                {isRecruiter
                  ? 'Track background verification, offer releases, hardware provisioning, and Day-1 compliance in one unified console.'
                  : 'Complete paperwork, review company policies, connect with your mentor, and get ready for Day 1 with zero friction.'}
              </p>
            </div>
          </div>

          {/* 3 Value Bullets */}
          <div className="relative z-10 py-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Real-Time Two-Way Sync</h4>
                <p className="text-[11px] text-white/70">
                  Candidate submissions reflect immediately in recruiter queues.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Enterprise Compliance</h4>
                <p className="text-[11px] text-white/70">
                  SOC-2 compliant BGV checks, document review & tax declarations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Users className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Warm Team Integration</h4>
                <p className="text-[11px] text-white/70">
                  Buddy matching, direct manager sync, and orientation modules.
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-white/60">
            <span>© 2026 Apex Global Technologies</span>
            <span className="font-medium text-white/80">v2.4 Enterprise</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Role segmented toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Role
                </label>
                <span
                  className={cn(
                    'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
                    isRecruiter
                      ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                  )}
                >
                  {isRecruiter ? 'Recruiter Admin' : 'New Hire'}
                </span>
              </div>

              <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 border border-slate-200/80 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleRoleChange('candidate')}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2',
                    role === 'candidate'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200',
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('recruiter')}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2',
                    role === 'recruiter'
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200',
                  )}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Recruiter
                </button>
              </div>
            </div>

            {/* Heading & helper */}
            <div className="space-y-1">
              <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-slate-100">
                {isRecruiter ? 'Recruiter Portal Access' : 'Welcome back, Candidate'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRecruiter
                  ? 'Sign in to access candidate pipelines, BGV, offers, and reports.'
                  : 'Sign in with your registered email to continue your onboarding steps.'}
              </p>
            </div>

            {/* Collapsible Demo Access Box */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowDemoBox((prev) => !prev)}
                className="w-full flex items-center justify-between p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Demo Credentials (Instant Access)</span>
                </div>
                {showDemoBox ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showDemoBox && (
                <div className="p-3 pt-0 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleAutofill('candidate')}
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all',
                        role === 'candidate'
                          ? 'border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400">
                          Candidate
                        </span>
                        {role === 'candidate' && <CheckCircle2 className="w-3 h-3 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] font-medium truncate mt-0.5">aarav.sharma@email.com</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Demo@1234</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAutofill('recruiter')}
                      className={cn(
                        'p-2.5 rounded-xl border text-left transition-all',
                        role === 'recruiter'
                          ? 'border-teal-400 bg-teal-50/70 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-teal-600 dark:text-teal-400">
                          Recruiter
                        </span>
                        {role === 'recruiter' && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                      </div>
                      <p className="text-[11px] font-medium truncate mt-0.5">recruiter@apex.com</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">Demo@1234</p>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message with Shake Animation */}
            <AnimatePresence>
              {authError && (
                <motion.div
                  key={shakeKey}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -6, 6, -2, 2, 0] }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{authError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  {...register('email')}
                  className={cn(
                    'w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all',
                    errors.email
                      ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
                      : isRecruiter
                        ? 'border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20',
                  )}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    {...register('password')}
                    className={cn(
                      'w-full pl-3.5 pr-10 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all',
                      errors.password
                        ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
                        : isRecruiter
                          ? 'border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-teal-500/20'
                          : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className={cn(
                      'rounded border-slate-300 dark:border-slate-700',
                      isRecruiter ? 'text-teal-600 focus:ring-teal-500' : 'text-indigo-600 focus:ring-indigo-500',
                    )}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      'Password Reset Stub',
                      'In this demo, please use Demo@1234 or one-click autofill.',
                    )
                  }
                  className={cn(
                    'text-xs font-semibold hover:underline',
                    isRecruiter
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-indigo-600 dark:text-indigo-400',
                  )}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all duration-150 text-white',
                  isRecruiter
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-teal-500/25'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25',
                )}
              >
                <span>Sign In as {isRecruiter ? 'Recruiter' : 'Candidate'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
