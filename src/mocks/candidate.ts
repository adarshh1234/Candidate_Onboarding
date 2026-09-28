import { Candidate } from '@/types';

export const mockCandidate: Candidate = {
  id: 'cand_984120',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.com',
  role: 'Senior Frontend Engineer',
  department: 'Product & Design',
  team: 'Core Platform & Experience',
  company: 'Apex Technologies',
  startDate: '2026-10-15',
  location: 'Bengaluru, KA, India',
  manager: {
    name: 'Sarah Jenkins',
    role: 'VP of Engineering',
    email: 'sarah.jenkins@apextech.io',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    slackHandle: '@sarah.j',
  },
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};
