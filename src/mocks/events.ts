import { CalendarEvent } from '@/types';

export const mockUpcomingEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Orientation & Company All-Hands Welcome',
    date: '2026-10-15',
    time: '10:00 AM - 10:45 AM',
    type: 'social',
    organizer: 'People Operations',
    locationOrUrl: 'Google Meet: meet.google.com/xyz-core-abc',
  },
  {
    id: 'evt-2',
    title: 'Manager 1:1 Intro with Sarah Jenkins',
    date: '2026-10-15',
    time: '11:00 AM - 11:45 AM',
    type: 'meeting',
    organizer: 'Sarah Jenkins',
    locationOrUrl: 'Zoom: Meeting ID 832 9491 1902',
  },
  {
    id: 'evt-3',
    title: 'IT Hardware & Security Setup Walkthrough',
    date: '2026-10-15',
    time: '01:30 PM - 02:15 PM',
    type: 'training',
    organizer: 'David O’Connor',
    locationOrUrl: 'Zoom: Meeting ID 719 3219 4001',
  },
  {
    id: 'evt-4',
    title: 'Buddy Pairing: Local Frontend Architecture Tour',
    date: '2026-10-16',
    time: '02:00 PM - 03:00 PM',
    type: 'training',
    organizer: 'Vikram Patel',
    locationOrUrl: 'Google Meet: meet.google.com/vpt-pair-dev',
  },
];
