import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, UserRole } from '@/types';

export const DEMO_CREDENTIALS = {
  candidate: {
    email: 'aarav.sharma@email.com',
    password: 'Demo@1234',
    user: {
      id: 'CAND-001',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@email.com',
      role: 'candidate' as UserRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  },
  recruiter: {
    email: 'recruiter@apex.com',
    password: 'Demo@1234',
    user: {
      id: 'REC-001',
      name: 'Priya Nair',
      email: 'recruiter@apex.com',
      role: 'recruiter' as UserRole,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  },
};

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  login: (role: UserRole, email: string, pass: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,

      login: (role, email, pass) => {
        const target = DEMO_CREDENTIALS[role];
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedTargetEmail = target.email.toLowerCase();

        if (normalizedEmail === normalizedTargetEmail && pass === target.password) {
          set({
            user: target.user,
            role,
          });
          return true;
        }

        return false;
      },

      logout: () => {
        set({
          user: null,
          role: null,
        });
      },
    }),
    {
      name: 'onboardly-auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
