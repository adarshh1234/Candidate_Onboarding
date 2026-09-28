import React, { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/toast';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Sync initial theme
    const stored = localStorage.getItem('onboardly-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <ToastProvider>{children}</ToastProvider>;
};
