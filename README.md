# Onboardly - Candidate Onboarding Portal

A production-grade, enterprise candidate onboarding web application built with **React 18**, **TypeScript (Strict mode with `noUncheckedIndexedAccess`)**, **Vite**, **Tailwind CSS**, and **Zustand**.

---

## 🌟 Features & Highlights

- **Modern SaaS Glassmorphism UI**: Curated indigo-to-purple gradient palette (`#667eea` → `#764ba2`), soft rounded-2xl cards, layered shadows, and responsive layouts.
- **Light & Dark Mode**: Persistent theme switcher (`class` strategy) with auto-detection of `prefers-color-scheme`.
- **Dynamic Wizard & Route Guard**: Steps 3–8 are locked until previous required steps are fulfilled. Locked sidebar entries show tooltip explanations.
- **Reactive Zustand Store with Persistence**: All candidate information, form drafts, document metadata, policy reads, and checklist items persist across reloads via `localStorage`. Includes a 1-click **Reset Demo** button in the topbar.
- **Robust Forms with RHF & Zod**:
  - **Personal Info**: E.164-ish Indian phone validation, 18+ DOB calculation, 6-digit pincode validation, and debounced draft autosaving.
  - **Direct Deposit & Tax**: Account confirmation matching, IFSC code format (`^[A-Z]{4}0[A-Z0-9]{6}$`), PAN validation (`^[A-Z]{5}[0-9]{4}[A-Z]$`), and interactive show/hide masking toggles.
- **Drag & Drop Document Vault**: Simulated upload progress, file type/size validation, thumbnail previews, replace/remove, and mock download triggers.
- **Compliance & Policy Gateway**: Multi-policy reader requiring full scroll-through before unlocking acknowledgment checkboxes, and gated "Acknowledge All".
- **Interactive Orientation Video Player**: Simulated video playback with timer, scrubbing, and completion tracking.
- **Team Introductions & 1:1 Booking**: Manager highlight, teammate profiles with avatar initials, direct Slack/LinkedIn links, and modal meeting scheduler.
- **Day-1 Readiness Timeline & Celebration**: Category filtering, interactive task toggles, and celebratory `canvas-confetti` bursts on 100% completion.

---

## 🏗️ Project Architecture

```
Candidate_Onboarding/
├── src/
│   ├── app/
│   │   ├── App.tsx             # Root application wrapper
│   │   ├── providers.tsx       # Toast and theme initialization
│   │   └── router.tsx          # React Router v6 createBrowserRouter, lazy routes & guards
│   ├── types/
│   │   └── index.ts            # Core TypeScript models, step IDs, statuses, and forms
│   ├── store/
│   │   └── onboarding.store.ts # Zustand persisted store with derived selectors
│   ├── lib/
│   │   ├── constants.ts        # Step config, doc configs, offer details
│   │   ├── mask.ts             # Account & PAN masking utilities
│   │   ├── utils.ts            # Tailwind merger (cn), formatting, and date calculations
│   │   └── validators.ts       # Zod schemas (PAN, IFSC, pincode, DOB, forms)
│   ├── mocks/
│   │   ├── candidate.ts        # Typed candidate profile (Aarav Sharma)
│   │   ├── tasks.ts            # 8 step tasks metadata
│   │   ├── team.ts             # Team members & manager
│   │   ├── policies.ts         # 6 corporate compliance policies
│   │   ├── modules.ts          # 4 onboarding video modules
│   │   ├── checklist.ts        # Day-1 preparation items
│   │   └── events.ts           # Schedule & upcoming calendar events
│   ├── hooks/
│   │   ├── useDropzone.ts      # Drag-and-drop file ingestion hook
│   │   ├── useMediaQuery.ts    # Responsive viewport matcher
│   │   └── useOnboardingProgress.ts # Computed onboarding stats hook
│   ├── components/
│   │   ├── ui/                 # Accessible button, input, select, textarea, checkbox,
│   │   │                       # progress, badge, card, dialog, tabs, tooltip, toast
│   │   ├── layout/             # AppShell, Sidebar, Topbar, MobileNav, PageHeader, StepFooter
│   │   └── common/             # StatCard, TaskCard, FileDropzone, ProgressRing,
│   │                           # StatusBadge, EmptyState, ThemeToggle, ErrorBoundary
│   ├── features/               # 9 step views (dashboard, welcome, personal, documents,
│   │                           # bank, policies, training, team, checklist)
│   └── test/                   # Vitest unit & integration test suites
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or later)
- npm or pnpm

### Installation

```bash
# Install all dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Building for Production

```bash
# Typecheck & build distribution bundle
npm run build
```

### Running Linter & Code Quality

```bash
# Run ESLint across TypeScript codebase
npm run lint
```

### Running Test Suites

```bash
# Run Vitest test runner
npm test
```

---

## 📸 Screenshots

*(Place application screenshots here)*

- **Dashboard**: Overview banner, StatCards, ProgressRing, and TaskGrid.
- **Offer Acceptance**: Compensation summary, document preview dialog, and digital sign-off.
- **Personal & Emergency Contact**: Form with Indian phone formatting and 18+ validation.
- **Document Vault**: Real drag-and-drop dropzones with progress simulation and preview thumbnails.
- **Bank & Tax Setup**: Sensitive field masking with eye toggles and IFSC/PAN regex verification.
- **Policies**: Scroll-to-unlock policy dialogs with gated "Acknowledge All".
- **Day-1 Checklist**: Dynamic timeline with confetti celebration on submission.

---

## ♿ Accessibility & Standards

- Semantic HTML5 structure with single `h1` per page.
- Accessible ARIA labels on all modal dialogs, icon buttons, and navigation drawers.
- WCAG AA compliant contrast ratios across both light and dark themes.
- Dedicated `aria-live` polite announcements for toasts.
- Full keyboard operability and visible focus rings (`focus-visible`).
