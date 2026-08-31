# My Celerity — Product Spec

## 1. Vision

Celerity Fiber sells fiber connectivity to properties and communities, but the residents living in those units have no self-service way to see their own service, pay their bill, or get help without calling in. **My Celerity** is that missing layer: a resident-facing account portal that makes Celerity Fiber feel like a modern telecom/SaaS product, not a phone-support-only ISP.

It should answer, in under 5 seconds of looking at it, the five questions every resident actually has:

1. Is my internet working?
2. What speed do I have?
3. What do I owe, and when?
4. Is anything wrong with my service right now?
5. How do I get help?

## 2. Users

| User | Context | Primary jobs |
|---|---|---|
| Resident / customer | Lives in a Celerity-served unit (MDU, HOA, single property) | Check status, pay bill, upgrade plan, get support, manage devices |
| Resident with multiple accounts | Owns/rents more than one Celerity-served property | Switch between accounts without separate logins |
| Property manager (future) | Manages a building on Celerity | Not this app's audience yet — see Phase 3 |

The app is written for **non-technical end users** (docs/brand/BRAND-CONTEXT.md §4: residents want "reliable WiFi, streaming, video calls, gaming, remote work" translated from tech specs, not GPON/XGS-PON jargon). Every screen is designed so a resident with zero technical background can use it without instructions.

## 3. Problems this solves

- No visibility into service status → residents call support for things a dashboard could answer instantly.
- No self-service billing → missed payments, avoidable past-due status, support call volume for "how much do I owe."
- No self-service troubleshooting → every WiFi hiccup becomes a support ticket, even when a gateway restart would fix it.
- No place to see plan options → upgrade conversations only happen through outbound sales, not resident-initiated.
- Multi-property residents (see docs/brand/BRAND-CONTEXT.md — bulk/MDU business model) have no single login for more than one Celerity account.

## 4. Brand research (Phase 1 of this build)

Before writing any code, the live site and existing brand assets in this repo were inspected directly (not guessed):

- **celerityfiber.com** (via live DOM inspection): dark hero (`rgb(8,5,20)` background), bold headline font `"D-Din Regular"`, primary CTA gradient `linear-gradient(129deg, #0087AD 0%, #582C83 72%)`, pill-shaped buttons (`border-radius: 20px`), a dotted fiber-network motif in the logo and hero background, confirmed claims: **99.97% uptime**, **symmetrical speeds up to 10 Gbps**, **no data caps**, **no equipment fees**, **24/7 local support**.
- **`docs/brand/`** in this repo (BRAND-CONTEXT.md, FACT-SHEET.md, COPY-GUIDELINES.md): positioning ("boutique fiber ISP, white-glove, South Florida"), tone rules (benefit before spec, no "always on"/"guaranteed" claims, Grade 8–10 reading level), and confirmed facts used directly in this app's mock data (e.g. the property "The Grande Condo" is a real, published Celerity case study, not invented).
- **`Schedule/celerity-marketing-workspace/`** in this repo: an existing internal Celerity tool with an already-established Tailwind design-token system (brand purple/teal palette, radius scale, shadow tokens) — reused verbatim rather than inventing a second, competing token set.
- **Logo**: the real Celerity Fiber wordmark PNG, already present in this repo, reused as-is.

## 5. Features (this version)

See the README's "What's implemented" section for the concrete list. In product terms, the MVP surface is:

- **Dashboard** — status-first home screen
- **My Internet** — service detail, live-feeling speed test, connected device management
- **Plans** — current plan + property-available upgrades + a real comparison/upgrade flow
- **Billing** — balance, current bill breakdown, AutoPay, payment methods, full pay flow, payment history with receipts
- **Support** — guided self-service troubleshooting (not just "call us"), ticket creation with a real status timeline, floating chat entry point
- **Account** — profile, notifications, settings, multi-account switching, customer-status-aware banners

## 6. Features deliberately deferred

See [docs/ROADMAP.md](ROADMAP.md) for the phased breakdown. Notably **not** built in this version: real authentication/backend, real payment processing, AI support, proactive diagnostics, usage analytics/insights, property-manager tooling.

## 7. Architecture

- **Framework**: Next.js (App Router) + TypeScript + Tailwind CSS v4.
- **UI kit**: a small internal component library modeled on shadcn/ui conventions (Radix UI primitives + Tailwind), not a heavyweight external design system.
- **State**: React state/context only — no global store. Auth is a React context (`src/lib/auth.tsx`) backed by `localStorage` for session persistence.
- **Data**: a single API layer (`src/lib/api.ts`) is the only thing pages/components call. It currently resolves against in-memory mock data (`src/data/*`) with simulated network latency, but every function's signature and return shape is what a real backend call would look like — see [docs/INTEGRATIONS.md](INTEGRATIONS.md).
- **Types**: one shared type module (`src/types/index.ts`) mirrors [docs/DATA_MODEL.md](DATA_MODEL.md) so the mock layer and a future real API speak the same shapes.

This separation (UI → API layer → mock data today / real services tomorrow) is the whole point of the architecture: replacing mocks with real integrations should be additive, not a rewrite.

## 8. Future integrations (summary)

Full detail in [docs/INTEGRATIONS.md](INTEGRATIONS.md). At a glance: **GLDS** (billing source of truth), **Salesforce** (CRM/account data), a **payment gateway** (Stripe or similar, PCI-compliant), and **network monitoring** (for real device/uptime/speed-test data instead of simulated numbers).
