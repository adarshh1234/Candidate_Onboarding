import {
  Boxes,
  Laptop,
  Building2,
  BookOpen,
  Car,
  Home,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { ProvisionCategory } from '@/types';

export type ProvisionTabId =
  | 'assets_assignments'
  | 'it_assets'
  | 'office_furniture'
  | 'stationary'
  | 'car'
  | 'home'
  | 'misc_assets';

export interface ProvisionTabConfig {
  id: ProvisionTabId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  description: string;
  category?: ProvisionCategory | 'All';
  keywords: string[];
  suggestedItems: string[];
}

export const PROVISION_TABS: ProvisionTabConfig[] = [
  {
    id: 'assets_assignments',
    label: 'Assets Assignments:',
    shortLabel: 'All Assignments',
    icon: Boxes,
    description: 'Master ledger of all candidate equipment requisitions, allocations, and handover milestones.',
    category: 'All',
    keywords: [],
    suggestedItems: ['Standard Equipment Kit', 'Executive Kit', 'Remote Worker Kit'],
  },
  {
    id: 'it_assets',
    label: 'IT Assets:',
    shortLabel: 'IT Assets',
    icon: Laptop,
    description: 'Developer machines, laptops, displays, cloud access credentials, and communications hardware.',
    category: 'IT',
    keywords: ['laptop', 'macbook', 'slack', 'github', 'jira', 'aws', 'sim', 'phone', 'display', 'monitor', 'it'],
    suggestedItems: [
      'MacBook Pro M3 Max (36GB/1TB)',
      'Dell XPS 15 Developer Edition',
      'Dual 27-inch 4K Monitors',
      'Email, Slack & 1Password Access',
      'AWS / GitHub Org Developer Seat',
      'Corporate 5G SIM & Device',
    ],
  },
  {
    id: 'office_furniture',
    label: 'office + office furniture',
    shortLabel: 'Office & Furniture',
    icon: Building2,
    description: 'Physical workplace seats, ergonomic task chairs, sit-stand desks, and locker allocations.',
    category: 'Office Furniture',
    keywords: ['desk', 'seat', 'chair', 'furniture', 'standing', 'pedestal', 'locker', 'office', 'facilities'],
    suggestedItems: [
      'Herman Miller Aeron Ergonomic Chair',
      'Electric Dual-Motor Standing Desk',
      'Dedicated Ergonomic Pod Seat (Floor 4)',
      'Executive Cabin Workspace',
      'Smart Lock Locker & Filing Pedestal',
    ],
  },
  {
    id: 'stationary',
    label: 'Stationary',
    shortLabel: 'Stationary',
    icon: BookOpen,
    description: 'Executive stationery starter boxes, notebooks, pen sets, branded lanyards, and business cards.',
    category: 'Stationary',
    keywords: ['stationary', 'stationery', 'notebook', 'pen', 'badge', 'card', 'lanyard', 'pack', 'admin'],
    suggestedItems: [
      'Welcome Executive Stationery Kit',
      'Custom Moleskine Journal & Pen Set',
      'NFC RFID Smart ID Badge & Lanyard',
      'Engraved Acrylic Desk Nameplate',
      '500x Premium Business Cards Pack',
    ],
  },
  {
    id: 'car',
    label: 'Car',
    shortLabel: 'Car & Fleet',
    icon: Car,
    description: 'Company vehicle allocations, executive EV leases, priority parking bays, and fuel allowances.',
    category: 'Car',
    keywords: ['car', 'vehicle', 'ev', 'parking', 'fuel', 'sedan', 'chauffeur', 'fleet', 'transport'],
    suggestedItems: [
      'Tesla Model 3 Long Range EV',
      'BMW i4 eDrive40 Executive Sedan',
      'Covered Executive Parking Bay Pass (P1-14)',
      'Shell Fleet Fuel & EV Fast-Charging Card',
      'Executive Chauffeur Allowance Plan',
    ],
  },
  {
    id: 'home',
    label: 'Home',
    shortLabel: 'Home Setup',
    icon: Home,
    description: 'Work-From-Home ergonomics, remote broadband stipends, secondary monitors, and home office grants.',
    category: 'Home',
    keywords: ['home', 'wfh', 'remote', 'broadband', 'stipend', 'headset', 'router', 'allowance'],
    suggestedItems: [
      'Home Ergonomic Setup Grant ($1,500)',
      'Dell UltraSharp 32-inch 4K USB-C Hub Monitor',
      'Sony WH-1000XM5 Noise-Cancelling Headset',
      'High-Speed Gigabit Broadband Reimbursement',
      'Logitech MX Master 3S Mouse & Keys Bundle',
    ],
  },
  {
    id: 'misc_assets',
    label: 'Miscellaneous Assets',
    shortLabel: 'Misc Assets',
    icon: Sparkles,
    description: 'Hardware security keys (YubiKey), corporate charge cards, wellness club passes, and company swag.',
    category: 'Miscellaneous Assets',
    keywords: ['misc', 'miscellaneous', 'yubikey', 'credit', 'card', 'gym', 'club', 'swag', 'token', 'access'],
    suggestedItems: [
      'YubiKey 5C NFC Dual Security Keys',
      'Amex Corporate Platinum Card',
      'Virgin Active / Equinox Executive Club Pass',
      'Premium Onboardly Swag Hoodie & Backpack',
      'International Travel Insurance & Roaming Pass',
    ],
  },
];

export const DEFAULT_PROVISION_TAB_ID: ProvisionTabId = 'assets_assignments';

export const VALID_PROVISION_TAB_IDS: ProvisionTabId[] = PROVISION_TABS.map((t) => t.id);
