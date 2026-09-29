# Onboardly - Enterprise Candidate & Recruiter Onboarding Platform

A production-grade, enterprise recruitment and candidate onboarding web application built with **React 18**, **TypeScript (Strict mode with `noUncheckedIndexedAccess`)**, **Vite**, **Tailwind CSS**, **shadcn/ui**, **Zustand**, **React Hook Form + Zod**, **TanStack Table v8**, **dnd-kit**, **Recharts**, and **Framer Motion**.

---

## 🔐 Roles & Demo Access

Onboardly features full role-based authentication with mock credentials, one-click demo autofill, and route guards (`RequireAuth`).

| Role | Email | Password | Default Home | Primary Accent |
| :--- | :--- | :--- | :--- | :--- |
| **Candidate** | `aarav.sharma@email.com` | `Demo@1234` | `/candidate` | Indigo / Violet (`#667eea` → `#764ba2`) |
| **Recruiter** | `recruiter@apex.com` | `Demo@1234` | `/recruiter/final-list` | Teal (`#0D9488` → `#0F766E`) |

- **Login Page (`/login`)**: Split-card layout with brand highlights on the left and form on the right. Segmented toggle (`Candidate | Recruiter`) switches role context, field accents, and demo autofill options.
- **Route Guards**: Unauthenticated users visiting protected routes are redirected to `/login`. Logged-in users attempting to access routes belonging to the other role are automatically redirected to their respective home portal.
- **Root Route (`/`)**: Dynamically resolves based on role: Candidate → `/candidate`, Recruiter → `/recruiter/final-list`.

---

## 🗺️ Route Map

```
/login                               # Public auth & role selector
/                                    # Root redirect based on active role

/candidate                           # Candidate Hub (Overview dashboard)
├── /candidate/welcome               # Step 1: Offer Letter Review & Acceptance
├── /candidate/personal              # Step 2: Personal & Emergency Contact Information
├── /candidate/documents             # Step 3: Document Verification Vault
├── /candidate/bank                  # Step 4: Direct Deposit & Tax (PAN/IFSC) Setup
├── /candidate/policies              # Step 5: Corporate Policies & Code of Conduct
├── /candidate/training              # Step 6: Orientation & Compliance Video Modules
├── /candidate/team                  # Step 7: Team Introductions & 1:1 Booking
└── /candidate/checklist             # Step 8: Day-1 Readiness Checklist & Confetti

/recruiter                           # Recruiter Portal Shell (Teal Theme)
├── /recruiter/final-list            # 5.1 Master candidate table, progress & pipeline
├── /recruiter/background-verification # 5.2 BGV checks, vendors, TAT SLAs, escalation
├── /recruiter/assessments           # 5.3 Skills, coding, aptitude & review scoring
├── /recruiter/offers                # 5.4 Multi-step offer generator, approval & Kanban
├── /recruiter/documents             # 5.5 Document verification queue, preview & reject
├── /recruiter/provisions            # 5.6 Hardware, SaaS, Badging & IT standard kits
├── /recruiter/buddy-manager         # 5.7 Manager & Buddy directory, rules & load limits
├── /recruiter/training              # 5.8 Mandatory training curriculum & completion matrix
├── /recruiter/visa-immigration      # 5.9 Work permits, H-1B, international relocations
├── /recruiter/insurance             # 5.10 Group health insurance & nominee tracker
├── /recruiter/miscellaneous         # 5.11 Drag-and-drop logistics Kanban (dnd-kit)
└── /recruiter/reports               # 5.12 Recharts executive analytics, funnel & CSV exports
```

---

## 🔄 Cross-Portal Reactive Data Flow

Recruiter actions and Candidate actions share a unified reactive state layer in `hiring.store.ts` (persisted via `localStorage`), enabling real-time cross-portal updates in the same browser.

```
       +-------------------------------------------------------------------+
       |                       SHARED HIRING STORE                         |
       |                      (src/store/hiring.store.ts)                  |
       |  - 24 Candidates (Aarav Sharma CAND-001 drives candidate portal)  |
       |  - Real-time Activity Log (who, what, when)                       |
       |  - 30 Directory Employees & Buddy Load Balancer                   |
       |  - Cross-portal synchronized mutations                            |
       +-----------------+-------------------------------+-----------------+
                         |                               |
       Recruiter Actions v                               v Candidate Actions
+------------------------------------+          +------------------------------------+
| • Releases/Revises Offer           |          | • Views released offer details     |
|   (Syncs CTC, bonus, options)      | -------> |   (Or sees "Offer Pending" state)  |
| • Approves/Rejects Documents       |          | • Submits acceptance & signature   |
|   (Provides rejection reason)      | -------> | • Sees "Verified" / "Rejected"     |
| • Assigns Manager & Buddy          |          |   with reason + Re-upload CTA      |
| • Assigns Curriculum & Due Dates   | -------> | • Team page shows assigned buddy   |
| • IT Provisions Hardware & Badges  |          | • Training page updates modules    |
+------------------------------------+          +------------------------------------+
                         ^                               |
                         |  Candidate Document Upload /  |
                         +-------------------------------+
                            Offer Acceptance Mutation
```

### Key Integration Scenarios:
1. **Offer Release**: When the recruiter releases or revises Aarav Sharma's offer, the candidate portal's Welcome page switches from "Offer Pending" to displaying the live offer letter, CTC, joining bonus, and signature pad. When Aarav accepts, the recruiter portal shows the status as `Accepted` with exact timestamp.
2. **Document Verification**: When Aarav uploads identity/degree documents, they appear in the Recruiter Documents Queue under `Pending Review`. Approving or rejecting (with presets like "Blurry scan", "Expired document") immediately updates Aarav's document cards with status pills, rejection banners, and re-upload triggers.
3. **Team & Buddy Assignments**: Recruiter directory assignment updates Aarav's Team page in real time with buddy avatar, contact info, and 1:1 booking.
4. **Activity Log & Notifications**: Every mutation appends an entry to `activityLog`, firing toast alerts in the recruiter portal and populating the candidate notification center.

---

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript 5 (Strict Mode, `noUncheckedIndexedAccess: true`)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS with CSS Variables design tokens (`[data-portal="recruiter"]` swaps theme to Teal)
- **State Management**: Zustand with `persist` middleware for cross-portal reactivity
- **Data Table**: TanStack Table v8 with sorting, column filters, pagination, row selection, and CSV export
- **Charts**: Recharts (Funnel bar, stage donut, offer trends, BGV stacked bar, SLA lines)
- **Drag & Drop**: `@dnd-kit/core` for Kanban boards (Miscellaneous tasks)
- **Validation**: React Hook Form + Zod v3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library (8 test suites, 45 tests)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or later)
- npm or pnpm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### Running Test Suites

```bash
npm test
```

### Linting & Code Quality

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

---

## ♿ Accessibility & Quality Standards

- WCAG AA compliant contrast ratios across both light and dark themes.
- Full keyboard operability (`Cmd/Ctrl+K` global command palette, focus traps in dialogs/drawers).
- Screen-reader friendly semantic HTML5 and `aria-live` polite toast notifications.
- Print stylesheets (`@media print`) on Reports dashboard for PDF audit exports.
