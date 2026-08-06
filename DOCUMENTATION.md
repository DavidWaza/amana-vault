# Amana Vault — Product Documentation

> **Payment Protection You Can Trust.**
> Amana keeps money safe until the agreed work is completed, approved, or fairly resolved.
> Nigeria's first payment-protection platform built for the service and construction economy.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Who It's For — User Roles](#2-who-its-for--user-roles)
3. [Core Concepts](#3-core-concepts)
4. [Technology & Architecture](#4-technology--architecture)
5. [Application Map / Routes](#5-application-map--routes)
6. [Public Landing Site](#6-public-landing-site)
7. [Onboarding & Authentication](#7-onboarding--authentication)
8. [Artisan Portal](#8-artisan-portal)
9. [Client Portal](#9-client-portal)
10. [Architect Portal](#10-architect-portal)
11. [Disputes System](#11-disputes-system)
12. [Admin — Dispute Desk](#12-admin--dispute-desk)
13. [Data Model Reference](#13-data-model-reference)
14. [Status & Enum Reference](#14-status--enum-reference)
15. [Fees, Trust & Compliance](#15-fees-trust--compliance)
16. [Glossary](#16-glossary)

---

## 1. Product Overview

**Amana** ("trust" in Hausa/Arabic) is a payment-protection (escrow) platform that sits between the people who **pay for work** and the people who **do the work** in Nigeria's service economy. It launches Abuja-first (FCT).

The core promise: a client's money is held safely in escrow by a CBN-licensed partner bank until the agreed work is completed, approved, or fairly resolved through dispute arbitration. The artisan can *see* that the money is secured but cannot access it until the client approves — eliminating both "paid upfront and abandoned" and "did the work and never got paid".

**The platform supports two transaction sizes:**

- **Single-trade jobs** — plumbing, electrical, carpentry, solar, painting, AC, borehole, etc. Handled artisan-to-client with simple milestones.
- **Full construction/design projects** — a client builds a house or commercial property, assembling a *team* (architect → contractor → inspector), with phased vault milestones and independent inspection before each release.

**Key value propositions:**

| For Clients | For Artisans / Pros | For the Market |
| --- | --- | --- |
| Money protected until work approved | Guaranteed funds before starting | Evidence-based dispute resolution |
| Milestone-based releases | Build a verified reputation | Transparent agreements |
| Independent inspection on builds | Get discovered & recommended | A trust layer for the service economy |

> **Regulatory positioning:** Amana is a **technology platform, not a bank or financial institution**. All escrow custody is provided by CBN-licensed partner financial institution(s). This disclaimer appears across the landing page, auth screens, and payment surfaces.

---

## 2. Who It's For — User Roles

The platform has **four distinct user types**, each with its own portal, onboarding, and auth route.

| Role | Description | Entry point |
| --- | --- | --- |
| **Client** | Pays for work — homeowners, businesses, anyone building or hiring. | `/auth/client` → `/client/dashboard` |
| **Artisan** | A skilled-trade professional (plumber, electrician, etc.) doing single-trade jobs. | `/join-amana` (signup) / `/auth/artisan` → `/artisan/dashboard` |
| **Architect** | A design studio/firm offering design services and milestone-based projects. | `/architect/onboarding` / `/auth/architect` → `/architect/dashboard` |
| **Admin (Arbitrator)** | Amana staff who review escalated disputes and issue binding rulings. | `/admin/disputes` |

A fifth implied participant — the **Inspector** — is a third party assigned to construction milestones to validate work before funds are released. Inspectors appear as data within the client/build-team flows rather than having their own portal in this build.

---

## 3. Core Concepts

- **Escrow / Vault** — Funds the client deposits are locked ("secured") with a licensed partner bank. The artisan/contractor sees the money is available but cannot withdraw it until release conditions are met.
- **Agreement** — A defined scope, price, timeline, warranty, and change policy that both parties accept before any money moves.
- **Milestone** — A payable phase of work. Single-trade jobs use simple `AgreementMilestone`s; construction projects use `VaultMilestone`s that go through independent inspection.
- **Proof of Work** — Photos/videos/receipts an artisan uploads as completion evidence.
- **Release** — Moving secured funds from escrow to the worker's bank, triggered by client approval.
- **Dispute** — A structured disagreement raised by either party, resolved first by negotiation, then by Amana arbitration if needed.
- **Protection Fee** — Amana's fee on a protected payment (see [§15](#15-fees-trust--compliance)).
- **Verification** — Identity (NIN, selfie, ID), payout/bank, and (for architects) professional-license checks that unlock platform privileges.

### The universal job lifecycle

```
invitation_pending → awaiting_funding → funds_secured → in_progress
      → proof_submitted → released
                        ↘ disputed → (resolved → released / refunded / split)
  (terminal off-ramps: invitation_expired · declined · cancelled)
```

---

## 4. Technology & Architecture

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16.2.7** (App Router) |
| UI library | **React 19.2** |
| Language | **TypeScript 5** |
| Icons | `phosphor-react` + `@phosphor-icons/react` |
| PDF generation | `jspdf` (invoice/report downloads) |
| Fonts | Inter (via `next/font/google`) |
| Styling | Global CSS (`app/globals.css`) with design tokens / CSS variables |
| Linting | ESLint 9 + `eslint-config-next` |

**Architectural notes:**

- The app is organized by **portal**, each under its own route segment (`app/artisan`, `app/client`, `app/architect`, `app/admin`) with a matching component folder under `app/components/<portal>-dashboard`.
- Each portal wraps its pages in a **React context provider** (e.g. `ClientProfileProvider`, `ArtisanProfileProvider`, `ArchitectProfileProvider`) that holds the current profile and dashboard state.
- Domain data is currently driven by **`mock-data.ts`** files per portal (the app is a high-fidelity, front-end MVP/prototype). Types live in per-portal `types.ts`; the dispute model is shared in `app/components/disputes/types.ts`.
- Shared helpers: `utils.ts` per portal (currency/date formatting, status metadata, action resolvers) and `app/lib/phone.ts` (Nigerian phone validation, 11 digits).
- Sidebar collapse state and onboarding progress persist to **localStorage**.

> **Build note (`AGENTS.md`):** This project pins a specific Next.js version whose conventions may differ from older releases — consult `node_modules/next/dist/docs/` before changing framework-level code.

---

## 5. Application Map / Routes

| Route | Purpose |
| --- | --- |
| `/` | Public marketing landing page |
| `/waitlist` | Pre-launch waitlist signup (persisted to Supabase) |
| `/api/waitlist` | `POST` — validates and stores a waitlist signup |
| `/join-amana` | Artisan signup wizard (6 steps) |
| `/auth/client` | Client login / signup (phone + OTP) |
| `/auth/artisan` | Artisan login / signup (phone + OTP) |
| `/auth/architect` | Architect login / signup |
| `/client/dashboard` | Client portal |
| `/artisan/dashboard` | Artisan portal |
| `/artisan/pro` | Amana Pro — verification & visibility pricing |
| `/architect/onboarding` | Architect 5-step onboarding |
| `/architect/dashboard` | Architect portal |
| `/admin/disputes` | Admin arbitration desk |

---

## 6. Public Landing Site

The marketing page (`/`) communicates the value proposition and routes visitors into the correct signup path.

**Sections:**

1. **Navbar** — Sticky, scroll-aware. Logo + tagline *"Secure am, relax"*, anchor links (How It Works, Features, Trust, Testimonials, FAQ), and a **Get Started** CTA. Mobile hamburger menu.
2. **Hero** — Headline *"Payment Protection You Can Trust."* with two role-splitting CTAs: **"I'm paying for work"** (→ client auth) and **"I'm doing the work"** (→ join-amana). Includes the regulatory notice and a live **phone mockup** rendering a real artisan dashboard preview (wallet, escrow balance, secured jobs).
3. **How It Works** — Four steps: *Create Agreement → Secure Funds → Work Begins → Release or Resolve.*
4. **Features** — Payment Escrow, WhatsApp Invites, Fair Resolution, Proof of Work, Live Dashboard, Trust Ratings.
5. **Trust** — Abuja-first launch, built for Nigerians tired of failed agreements, early-access invitation.
6. **Use Cases** — Construction & Renovation, Solar & Electrical, Furniture & Interiors, General Artisan Services.
7. **FAQ** — What is Amana, how escrow works, disputes, fees (flat **2%** during MVP pilot per the FAQ), fund safety, inviting artisans.
8. **CTA + Footer** — Final conversion CTA and footer with product/company/support links plus the full CBN custody disclaimer.

> Testimonials were intentionally removed to keep all trust signals 100% real during the pilot.

### 6.1 Waitlist (`/waitlist`)

The pre-launch capture page, linked from the navbar CTA, the closing CTA block, and the footer. It uses the same split layout as `/join-amana`: forest-green hero on the left, white form card on the right.

**Fields:** full name and email (required), phone, role, city, referral source, and a free-text message (all optional). Role is one of `client`, `architect`, `contractor`, `artisan`, `supplier`, `partner`, `other`.

**Unlike the rest of the app, this is not mock data** — signups are persisted to the `waitlist` table in Supabase.

- `app/components/waitlist/validation.ts` is the single source of validation truth, run in the browser for inline feedback and again in the route handler, which never trusts the client.
- `POST /api/waitlist` writes via the **service role key**, so the table has RLS enabled with **no policies** — anon clients can neither read nor write it.
- A hidden honeypot field catches bots. It is treated as a **heuristic, not a verdict**: a filled honeypot is saved with `status = 'spam'` rather than discarded, because browser autofill and password managers fill hidden fields for real people. Review with `select * from waitlist where status = 'spam'`.
- Duplicate emails are matched case-insensitively and return the existing entry rather than an error, so a repeat signup sees "you're already on the list".
- Each row gets a sequential `position`, shown back to the user as their place in line.

**Required environment variables** (see `.env.example`):

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret.** Bypasses RLS — server-side only, never `NEXT_PUBLIC_` |

Without these the endpoint returns `503` and the form shows a friendly retry message.

---

## 7. Onboarding & Authentication

### 7.1 Authentication model

All portals use **phone-based authentication with OTP**:

- Phone numbers are Nigerian-format, **11 digits** (validated by `app/lib/phone.ts`), with a live digit counter (e.g. "8/11 digits").
- A **4-digit OTP** is entered into an auto-advancing grid.
- Auth screens toggle between **Login** and **Sign Up**; sign-up captures full name + phone (+ trade/category for artisans).
- CBN-licensed-partner trust messaging is shown on auth screens.
- On success, the user lands on their portal dashboard.

### 7.2 Artisan signup wizard (`/join-amana`)

A 6-step progressive wizard with per-step validation; partial progress is preserved.

| # | Step | Collects | Key validation |
| --- | --- | --- | --- |
| 1 | **Profile** | Full name, date of birth, phone, email, password + confirm | Name > 2 chars; **age ≥ 18**; password ≥ 8; passwords match |
| 2 | **Trade** | Service category (Borehole, Solar & Electrical, Plumbing, Carpentry & Furniture, Painting, POP Ceiling, Tiling & Flooring, Other), optional custom trade, short bio | Category required; "Other" needs custom text |
| 3 | **Location** | Primary area (Gwarinpa, Wuse, Maitama, Garki, Lugbe, Kubwa, Other), travel radius (5 km / 10 km / Abuja / FCT) | Area required |
| 4 | **Identity** | NIN (11 digits), government ID upload (JPG/PNG/PDF ≤ 10 MB), selfie, consent checkbox | NIN = 11 digits; both files required; consent required |
| 5 | **Bank** | Bank (GTBank, Access, Zenith, First Bank, UBA, Stanbic IBTC, Fidelity, Kuda, Opay, Palmpay), account number (10 digits), account name | 10-digit account; name ≥ 3 chars; must match ID |
| 6 | **Phone Verify** | 4-digit OTP | All 4 digits entered |

**Success state:** *"Application submitted!"* — confirms the team will review and reach out within 48 hours, with a CTA into the artisan portal.

### 7.3 Architect onboarding (`/architect/onboarding`)

A 5-step wizard with localStorage resume; rejected credentials can be resubmitted.

1. **Studio Profile** — studio/firm name, contact name, phone, email, location.
2. **Portfolio & Specialties** — one or more specialties, studio bio (≥ 20 chars), optional portfolio URL.
3. **Credentials** — **ARCON license number** (≥ 4 chars) + NIN (11 digits); verification begins as *pending*.
4. **Bank** — bank, 10-digit account number, account name matching government ID.
5. **Verify Phone** — 4-digit OTP.

On completion the profile is marked `onboardingComplete` and routed to the dashboard. **Release requests are blocked until both `verificationStatus` and `bankStatus` are `verified`.**

---

## 8. Artisan Portal

Route: `/artisan/dashboard` · Pricing: `/artisan/pro`

A job-management + payment-protection workspace for single-trade professionals. Header shows a time-based greeting, anchor nav (Jobs / Vault / Reviews), an Amana Pro link, chat inbox, notifications, and profile settings.

### 8.1 Amana Vault (wallet & escrow)

- **Balance card** — "Secured in Escrow" headline figure with breakdown: **Incoming** (funds on secured jobs awaiting release) and **Pending Release** (awaiting client approval).
- **Request Release** — opens a modal to request payout (enforces minimum withdrawal, available balance, and a verified bank account). Funds stay in escrow until the client approves; a release request posts a message to the job chat and creates an *awaiting approval* transaction.
- **Payout account** — linked bank with masked account number; managed in settings.
- **Transaction history** — description, date, signed amount, and status (*awaiting client approval / processing to bank / completed / failed*).
- Persistent disclaimer: never start work until funds show as secured; custody is held by the CBN-licensed partner.

### 8.2 Status banners & onboarding states

Contextual banners drive the artisan toward a fundable, hireable state:

- **Verification** — pay for checks → pay for badge → *pending* (48 h review) → *verified* / *rejected* (retry).
- **Profile completion** — prompts to add bio & service details.
- **Payout setup** — prompts to add or await verification of bank details (withdrawals paused while pending).
- **Growth** — once verified, suggests/extends a recommendation boost.

### 8.3 Dashboard stats

Four cards: **Secured in Escrow**, **Pending Release**, **Total Paid Out** (lifetime), **Active Jobs** (count, with invite count if any).

### 8.4 Jobs panel

Tabbed: **Active / Invitations / History** (with counts). Each **job card** shows title, client (+ verified badge), status badge, location, deadline (relative, e.g. "Due in 3d", "5d overdue"), protected amount, and contextual inline notices (e.g. *"Do not start work — client has not funded escrow yet"*, *"Funds secured by CBN-licensed partner. Safe to begin."*).

**Primary action by status:**

| Status | Action | Notes |
| --- | --- | --- |
| `invitation_pending` | Review Invite | accept → `awaiting_funding`, or decline |
| `awaiting_funding` | *Waiting for Client* (disabled) | do not start work |
| `funds_secured` | Start Work | → `in_progress` |
| `in_progress` | Upload Proof | → `proof_submitted` |
| `proof_submitted` | *Awaiting Client* (disabled) | client reviewing |
| `disputed` | View Dispute | opens dispute workspace |
| `released` | View Receipt | completed |

Secondary actions: **Create/View Invoice**, **Message**, **Dispute** (available on `funds_secured`/`in_progress`/`proof_submitted`), **Decline** (on invites).

### 8.5 Key artisan workflows

- **Review Invite modal** — job summary, agreement scope checklist, payment terms, milestone table; Accept / Decline / Message.
- **Create Agreement wizard** (FAB) — 5 steps: *Category → Details (scope checklist) → Terms (price, 5% fee auto-calc, dates, warranty, change policy) → Client (search & select) → Summary & Send.* Auto-generates milestones; on send, can immediately create an invoice or message the client.
- **Proof of Work upload** — camera or gallery, photos/videos (JPG/PNG/MP4, ≤ 10 MB each, up to 8 files), thumbnail previews; submit → `proof_submitted`.
- **Create Invoice** — auto-numbered, line items from scope, due date + notes; send (posts to chat) or download PDF.
- **Job Chat** — per-job slide-out thread shared with the client (Enter to send, Esc to close, auto-scroll). A chat inbox aggregates conversations with unread counts.

### 8.6 Reviews & profile

- **Reviews** — overall rating, star breakdown bars, filterable feed (All / 5★ / 4★ / Needs attention). Reviews are left by clients only after a job's funds are released.
- **Profile card** — avatar, name (+ Recommended badge if boosted), category, area, bio, stats (rating / completed / verification), contact details, settings & sign-out.
- **Profile settings** drawer — three tabs: **Profile** (avatar, name, bio, category, area, travel range), **Account** (phone, email, password change), **Payout** (bank, 10-digit NUBAN, account name — changing it re-triggers verification and pauses withdrawals).

### 8.7 Amana Pro (`/artisan/pro`)

A pay-for-visibility/verification product, separate from the escrow wallet:

| Plan | Price | Unlocks |
| --- | --- | --- |
| **Verification checks** | ₦2,500 | NIN match, selfie-to-ID, duplicate-account screening |
| **Verified artisan badge** | ₦4,500 | Verified badge, accept invites, eligible for escrow work (*requires checks first*) |
| **Recommendation boost** | ₦3,500 / 7 days | Top of client search, recommended badge (*verified artisans only; auto-renews weekly*) |

Includes a "How it works" path, FAQ, and a payment modal. A dashboard **Pro promo** card adapts its CTA to the artisan's current state (get verified → boost → manage plan).

---

## 9. Client Portal

Route: `/client/dashboard`

A construction/project command center. The shell has a **collapsible sidebar** (state persisted), a header with greeting (*"Your home in Nigeria is moving forward"*), chat inbox, notifications, profile menu, and a **project filter** to scope the dashboard to one project or all.

### 9.1 Navigation (sidebar views)

Dashboard · My Projects · Build Team · Vault · Payments · Approvals · Updates · Documents · Messages · Reviews · Find Professionals · Settings, plus a **Start New Build** CTA and a Help section.

### 9.2 Dashboard home

- **Active project hero** — title, location, total protected amount, released-vs-remaining, overall progress.
- **Progress stepper (5 phases)** — Foundation → Structure → Roofing → Finishing → Handover, each Completed / In Progress / Upcoming.
- **Metric cards** — Protected Balance, Current Phase, Project Team count, Next Action.
- **Build Team panel** — architect/contractor/inspector with role badges and message access.
- **Project Updates feed** — recent activity with role icons and photo counts.
- **Vault donut** — released vs protected, with legend percentages.
- **Pending Actions** — color-coded, clickable cards (or "All caught up").

### 9.3 Projects, team & professionals

- **My Projects** — tabbed **Active / Needs Action / History** with contextual project cards (status badge, building type, team, primary action, message, raise-concern).
- **Build Team** — team members grouped by project with role badges and per-person messaging.
- **Find Professionals** — **Architect Marketplace** (browse verified architects: bio, rating, specialty, services; View Profile / Request Proposal).
- **Contractor Proposals** — compare contractor bids side-by-side (price with materials/labor split, timeline, experience, rating, team size, fee structure); **Accept Proposal**.

### 9.4 Vault & payments

- **Vault summary** — Total Protected, Released, Remaining.
- **Per-project milestone tracker** — numbered milestones with status (Locked / Active / Inspection / Approved / Released) and assigned inspector; **Review & Approve** when in inspection.
- **Ready-to-fund queue** — projects awaiting vault activation.
- **Payment method** — current method + verification status; add/verify.
- **Escrow activity history** — deposits / releases / refunds with status.

### 9.5 Key client workflows

- **Start Project modal** — 4-step wizard: *What are you building?* (category + type) → *Location* (state, city, address, land status) → *Vision* (name + description) → *Current stage* (need architect / have drawings / have contractor). Creates a project and routes to the next step.
- **Fund Escrow modal** — shows agreement (contractor, amount, **5% protection fee**, total due), authorize-charge checkbox, Confirm & Fund → success ("Funds secured"), status → `funds_secured`.
- **Milestone Approval modal** — review contractor evidence + **independent inspector report** (Pass / Pass with concerns / Fail) and release amount; *Request more info* / *Raise a concern* / **Approve & Release** (→ milestone `released`, escrow updated).
- **Raise a concern / Dispute** — see [§11](#11-disputes-system).
- **Status banners** — drive identity verification, profile completion, and payment-method setup before funding is possible; a green banner confirms *"You're ready to build with confidence."*

### 9.6 Supporting features

- **Documents Center** — folders: All / Architect Documents / Contracts / Receipts / Inspection Reports / Payment Records, with download.
- **Project Updates** — full timeline with role, attachments, project name.
- **Reviews** — rate artisans after funds are released.
- **Notifications** — typed (success/warning/info/error) with actions that deep-link into the relevant view or settings.
- **Profile settings** drawer — Profile / Account / Payment (card or bank transfer) tabs.
- **Stats** — Active Projects, Total Vault Protected, Funds Released, Pending Actions.

---

## 10. Architect Portal

Routes: `/architect/onboarding`, `/architect/dashboard`

A design-focused marketplace + milestone-payment workspace for studios. Collapsible sidebar; header with greeting, **Download Report** (exports a .txt summary), **New Project**, notifications, and a profile menu (Architect Plan).

### 10.1 Dashboard home

- **Metric cards** (clickable) — Active Designs, Design Requests (new only), Proposals Sent, Earnings This Month (with MoM delta %).
- **Active design hero** — primary in-progress project with image, status, value, progress bar, and a **5-phase milestone stepper**: *Concept → Rendering → Drawings → BOQ → Handover.*
- **Vault card** — Total Contract Value with Released / Protected / Pending breakdown and **Request Release** (enabled only when verified architect + verified bank + funds pending).
- **Upcoming milestones** and a **recent activity** feed.

### 10.2 Navigation & panels

Dashboard · Projects · Design Requests · Proposals · Active Designs · Vault · Documents · Messages (coming soon) · Reviews · Settings. Sidebar shows verification badge, location/rating, and (Pro) subscription status with renewal.

- **Projects** — cards with image, status (Draft / In Progress / Completed / On Hold), value, progress.
- **Design Requests** — inbound client briefs (project type, location, **budget range**, received time); *Send Proposal* on new ones.
- **Proposals** — sent proposals with amount and status (Pending / Accepted / Declined).
- **Vault** — four stat cards + Request Release (with blocking-reason messaging).
- **Documents** / **Reviews** — shared deliverables and client testimonials.

### 10.3 Key architect workflows

- **Send Proposal modal** — title (pre-filled `Client — Project Type`), proposed fee (₦), optional timeline (weeks), cover note. On submit: creates a proposal, marks the request *responded*, notifies, toasts.
- **New Project modal** — title, client name, location, contract value → creates a `draft` project with default milestones.
- **Request Vault Release modal** — confirms pending amount; client may need to approve before bank transfer.
- **Studio Settings modal** — studio name, contact, email, location, bio.
- **Verification banner** — pending / rejected (with Resubmit) / no-bank states gate vault actions.

### 10.4 Marketplace & vault logic

Client brief → architect proposal (pending) → client accept/decline → accepted proposal becomes a **Project**. Vault tracks Total Contract Value, Released, Protected, and Pending Release; releases require verified credentials **and** a verified payout bank, with explicit blocking messages otherwise.

---

## 11. Disputes System

A shared, three-tier resolution model embedded on each job (mirroring how an invoice is attached), used identically by clients and artisans. Implemented in `app/components/disputes/`.

### 11.1 Raising a dispute (`RaiseDisputeModal`)

Perspective-aware form:

1. **Category** — clients: *Work not finished, Poor quality, Not as agreed, Abandoned/no-show, Property damage, Something else*; artisans: *Payment withheld, Not as agreed, Something else*.
2. **Reason** — free text, **minimum 10 characters**, with guidance that it's shared with the other party and Amana.
3. **Desired outcome** — clients: *Refund the client* / *Split*; artisans: *Release to the artisan* / *Split*.
4. **Evidence** (optional) — add file labels as removable chips.

On submit, the disputed amount is **locked in escrow**, the job's dispute stage becomes `open`, and both parties are notified. The modal nudges users to try messaging first.

### 11.2 Dispute workspace (`DisputeWorkspaceModal`)

Shared negotiation space showing a summary (raised by / issue / requested), a dynamic **stage banner**, a **case-file thread** of statements from both parties + Amana, an **evidence list** (attributed per party), and a response composer (text + evidence) while unresolved.

**Action buttons (context-sensitive):**

- *Raiser, negotiating:* **Withdraw dispute** or **Escalate to Amana**.
- *Counterparty, negotiating:* **Reject & escalate** or **Accept · [outcome]** (resolves to the raiser's requested outcome).
- *Escalated:* read-only "Amana reviewing" banner; funds remain protected.
- *Resolved:* success callout describing the outcome and reasoning.

### 11.3 Stage machine

```
open → responded → (escalated | resolved)
```

| Stage | Meaning |
| --- | --- |
| `open` | Raised; awaiting the other party's response. |
| `responded` | Both sides have stated their case; negotiating. |
| `escalated` | Handed to Amana; parties may keep adding evidence but can't escalate further. |
| `resolved` | Final outcome issued; escrow settled accordingly. |

### 11.4 Outcomes & fund handling

| Outcome | Effect on escrow |
| --- | --- |
| `refund_client` | 100% returned to client |
| `release_artisan` | 100% released to artisan |
| `split` | Divided per agreed/decided percentages |
| `withdrawn` | Dispute dropped; job continues as before |

While a dispute is `open` or `escalated`, the full disputed amount stays locked and no new payment processes on that milestone.

---

## 12. Admin — Dispute Desk

Route: `/admin/disputes`

Amana's arbitration console for **escalated** disputes only. Two-panel layout.

- **Header** — "Dispute Desk · Admin" with a queue count of cases awaiting a decision.
- **Case list (left)** — each item shows job title + badge, "Client vs Artisan", amount in escrow, and dispute category; click to select.
- **Case detail (right)** — parties, amount in escrow, summary cards (client / artisan / client's desired outcome), the **full statement thread**, and the complete **evidence list** with per-party attribution.

**Issue a decision:**

1. Choose **Refund the client**, **Release to the artisan**, or **Split**.
2. For a split, a **percentage slider** (5% steps) sets the artisan share; the UI shows the computed naira amounts (`artisanAmount = total × share%`, `clientAmount = remainder`).
3. Optionally add **reasoning** (shared with both parties).
4. **Issue binding decision** → stage `resolved`, records a `DisputeResolution` (outcome, `decidedBy: amana`, amounts, note, timestamp), posts an Amana statement, notifies both parties, and routes funds.

Admin decisions are **final and binding** within the system; the admin reviews evidence and agreed scope but cannot edit past rulings or upload evidence. Footer: *"Amana arbitration decisions are final for escrow release."*

---

## 13. Data Model Reference

The domain is currently typed in per-portal `types.ts` files; disputes are shared. Below are the principal entities and their key fields.

### Artisan / `ArtisanProfile`
`id, fullName, phone, email, category(+Label), otherTrade, bio, area(+Label), travelRadius, avatarUrl, rating (0–5 | null), completedJobs, verificationStatus, verificationNote?, payoutStatus, profileComplete, memberSince, growth, isRecommended`
`growth = { checksPaid, verificationPaid, boostActive, boostExpiresAt }`

### Job / `ArtisanJob`
`id, title, clientName, clientVerified, location, amount (₦), status, priority, createdAt, deadline, fundedAt?, proofDueAt?, disputeReason?, invitationExpiresAt?, agreementScope?, paymentTerms?, milestones?, sentByArtisan?, invoice?, dispute?, lastUpdated`

### Client / `ClientProfile`
`id, fullName, phone, email, countryOfResidence, area(+Label), avatarUrl, verificationStatus, verificationNote?, paymentMethodStatus, profileComplete, memberSince, projectsProtected, totalVaultProtected`

### Project / `ClientProject`
`id, title, buildingCategory, buildingType, location/city/state, landStatus, description, lifecycleStage, designStage?, architectName(+Verified), contractorName(+Verified), amount, protectionFee, status, priority, createdAt, deadline, fundedAt?, invitationExpiresAt?, agreementScope?, paymentTerms?, milestones?, vaultMilestones?, sentByArtisan?, sentByClient?, invoice?, releaseRequestAmount?, proofSubmittedAt?, proofNote?, dispute?, lastUpdated`

### Architect / `ArchitectProfile`
`studioName, contactName, phone, email, location, bio, specialties[], licenseNumber, rating | null, reviewCount, avatarUrl, verificationStatus, bankStatus, onboardingComplete, onboardingStep, subscriptionPlan, subscriptionRenewal?`

### Wallet / `ArtisanWallet`
`availableBalance, pendingWithdrawal, incomingBalance, bankAccount | null, transactions[], minWithdrawal`
`WalletTransaction = { id, type(credit|withdrawal), amount, status, description, date }`

### Escrow / `ClientEscrow`
`securedBalance, pendingFunding, pendingReleaseApproval, releasedTotal, paymentMethod, transactions[], minFunding`
`EscrowTransaction.type = deposit | release | refund`

### Vault Milestone / `VaultMilestone`
`id, name, label, amount, status, inspectionResult?, inspectorName, inspectorReport, contractorEvidence, dueDate`

### Invoice / `JobInvoice`
`id, jobId, invoiceNumber, clientName, lineItems[], subtotal, notes, dueDate, status(draft|sent|paid), sentAt?, createdAt`
`InvoiceLineItem = { id, description, amount }`

### Review / `ArtisanReview`
`id, clientName, clientVerified, jobTitle, jobId?, rating (1–5), comment, createdAt`

### Dispute (shared)
`id, category, raisedBy(client|artisan), reason, desiredOutcome, stage, amount, evidence[], statements[], resolution?, createdAt, updatedAt`
`DisputeEvidence = { id, party, label, kind(photo|video|document), uploadedAt }`
`DisputeStatement = { id, party(client|artisan|amana), text, createdAt }`
`DisputeResolution = { outcome, decidedBy, clientAmount, artisanAmount, note?, decidedAt }`

### Notification / Alert
`id, type(warning|info|error|success), title, message, actionLabel?, actionHref?, actionType?, actionJobId?, settingsTab?` — `Notification` adds `createdAt, read`.

---

## 14. Status & Enum Reference

| Entity · Field | Values |
| --- | --- |
| **Job · status** | `invitation_pending`, `invitation_expired`, `awaiting_funding`, `funds_secured`, `in_progress`, `proof_submitted`, `released`, `disputed`, `cancelled`, `declined` |
| Job · priority | `normal`, `urgent` |
| Verification status (all roles) | `unverified`, `pending`, `verified`, `rejected` |
| Artisan payout status | `not_set`, `pending`, `verified` |
| Client payment-method status | `not_set`, `pending`, `verified` |
| Architect bank status | `none`, `pending`, `verified` |
| Architect subscription | `free`, `pro` |
| **Project · lifecycleStage** | `vision`, `architect_selection`, `design`, `contractor_bidding`, `vault_setup`, `construction`, `completed` |
| Project · designStage | `initial_consultation`, `concept_design`, `client_review`, `final_documents`, `ready_for_bidding` |
| Project · buildingCategory | `residential`, `religious`, `commercial`, `community` |
| Project · buildingType | `bungalow`, `duplex`, `mansion`, `family_compound`, `church`, `mosque`, `worship_center`, `office`, `plaza`, `rental_property`, `school`, `nonprofit` |
| Project · landStatus | `own`, `family_owns`, `purchasing`, `need_assistance` |
| **VaultMilestone · status** | `locked`, `active`, `inspection`, `approved`, `released` |
| VaultMilestone · inspectionResult | `pass`, `pass_with_concerns`, `fail` |
| Invoice · status | `draft`, `sent`, `paid` |
| **Dispute · category** | `incomplete_work`, `quality`, `not_as_agreed`, `no_show`, `damage`, `payment_withheld`, `other` |
| Dispute · stage | `open`, `responded`, `escalated`, `resolved` |
| Dispute · outcome | `refund_client`, `release_artisan`, `split`, `withdrawn` |
| Wallet txn · type / status | `credit`/`withdrawal` · `completed`/`awaiting_approval`/`pending`/`failed` |
| Escrow txn · type / status | `deposit`/`release`/`refund` · `completed`/`pending`/`awaiting_approval`/`failed` |
| Design Request · status | `new`, `responded`, `declined` |
| Architect Proposal · status | `pending`, `accepted`, `declined` |
| Architect Project · status | `draft`, `in_progress`, `completed`, `on_hold` |

**Job status labels & tone** (`JOB_STATUS_META`): New Invite (warning), Invite Expired (muted), Awaiting Funding (muted), Funds Secured (secure), In Progress (progress), Awaiting Approval (warning), Paid Out (success), In Dispute (danger), Cancelled/Declined (muted).

---

## 15. Fees, Trust & Compliance

- **Protection fee** — The product surfaces a **5% protection fee** in the artisan agreement builder and the client funding modal (`total due = amount + 5%`). The marketing FAQ references a **flat 2%** MVP-pilot fee. *(These two figures differ in the current build and should be reconciled to a single source of truth before launch.)*
- **Custody** — All escrowed funds are held by **CBN-licensed partner financial institution(s)**, not by Amana. Amana is a technology platform, not a bank, escrow agent, or financial institution. This disclaimer is repeated on the landing page, auth screens, wallet, and funding surfaces.
- **Verification gates** — Artisans must pay for and pass identity checks to accept escrow work; architects need verified credentials **and** bank before releases; clients need verified identity + payment method before funding.
- **Currency & locale** — All amounts are Nigerian Naira, formatted via `Intl.NumberFormat("en-NG", { currency: "NGN" })` → e.g. `₦85,000`. Phone numbers are 11-digit NG format.

---

## 16. Glossary

| Term | Meaning |
| --- | --- |
| **Amana** | The platform; "trust" in Hausa/Arabic. |
| **Vault / Escrow** | Secured holding of client funds until release conditions are met. |
| **Agreement** | Scope + price + timeline + warranty + change policy accepted by both parties. |
| **Milestone** | A payable phase of work; construction milestones pass independent inspection. |
| **Proof of Work** | Completion evidence (photos/videos/receipts) uploaded by the worker. |
| **Release** | Transfer of secured funds to the worker after client approval. |
| **Dispute** | Structured disagreement resolved by negotiation then Amana arbitration. |
| **Protection fee** | Amana's fee on a protected payment. |
| **NUBAN** | 10-digit Nigerian bank account number. |
| **NIN** | National Identification Number (11 digits). |
| **ARCON** | Architects Registration Council of Nigeria (license source). |
| **CBN** | Central Bank of Nigeria (regulator of the partner bank). |
| **Inspector** | Independent third party validating construction milestones. |

---

*Generated from the Amana Vault codebase. This MVP is a high-fidelity front-end prototype driven by mock data; figures and copy reflect the current build and should be validated against production data sources and business rules before release.*
