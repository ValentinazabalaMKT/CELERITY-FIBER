# My Celerity

*[Leer esto en español](README.es.md)*

**Your internet. Your account. One place.**

A customer self-service portal for **Celerity Fiber** residents — check service status, manage plans, pay bills, run a speed test, manage connected devices, and get support, all from one app. Conceptually inspired by carrier apps like Mi Claro, but designed to feel like a modern SaaS product (Stripe / Linear / Apple-grade), and built 100% around Celerity Fiber's real brand (colors, gradient, wordmark, tone — see [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) for the brand research this was built from).

This first version runs entirely on **mock data** — no backend, no credentials required. Every data-fetching function lives behind a small API layer (`src/lib/api.ts`) shaped like the real calls this app will eventually make, so swapping mocks for a real backend later shouldn't touch any page or component.

## Live deployment

**https://my-celerity.vercel.app** — deployed on Vercel, auto-redeploys on every push to `main` (via the CELERITY-FIBER repo's Vercel GitHub integration, with `my-celerity/` set as the project's root directory). No environment variables required — see the note in "Environment variables" below.

## Quick start

```bash
cd my-celerity
npm install   # already run if you're reading this from a fresh clone of this repo
npm run dev -- -p 3200
```

Open **http://localhost:3200** — the sign-in screen loads first.

### Demo login

```
Email:    demo@celerityfiber.com
Password: Celerity123!
```

Click **"Use demo credentials"** on the login screen to fill these in automatically. This is a **mock, client-side-only auth check** for development — see [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for how this gets replaced by real authentication (Supabase Auth is the proposed target).

The demo customer (Michael Anderson) has **two accounts** you can switch between from the sidebar/header account switcher:
- **Apartment** — The Grande Condo, Unit 1204 — Active, 1 Gig plan, current on billing.
- **Vacation property** — The Wave, Unit 512 — Past Due, 500 Mbps plan, and has an active outage banner — useful for seeing the non-happy-path states (past-due banner, outage banner, degraded quick actions) without touching code.

## Project structure

```
src/
  app/
    login/                 Public login route
    (portal)/              Everything behind auth, wrapped by a shared shell
      layout.tsx            Auth guard + sidebar/header/mobile-nav/chat widget
      dashboard/            Home
      internet/             Service details, speed test, connected devices
      plans/                Current plan + available upgrades + comparison
      billing/               Current bill, AutoPay, payment methods
      billing/history/       Payment History
      support/               Quick actions, troubleshooting, tickets
      profile/               Account/contact/property info
      notifications/         Notification center
      settings/              Security, notification prefs, billing prefs, privacy
      outages/[id]/          Outage detail
  components/
    ui/                     Small internal component kit (shadcn/ui-style):
                             Button, Card, Dialog, Tabs, Select, Switch, etc.
    layout/                 AppSidebar, MobileNav, TopHeader, AccountSwitcher,
                             NotificationBell
    dashboard/ internet/ plans/ billing/ support/ outages/
                             Feature components used by the pages above
  data/                     Centralized mock data (mockCustomer.ts, mockInternet.ts,
                             mockBilling.ts, mockSupport.ts, mockNotifications.ts,
                             mockOutages.ts) -- the only place fake data lives
  lib/
    api.ts                  The API layer -- every data call the app makes,
                             backed by mocks today (see docs/INTEGRATIONS.md)
    auth.tsx                Demo AuthProvider / useAuth()
    utils.ts, nav.ts, status-meta.ts, notification-meta.ts, greeting.ts
  types/index.ts             Shared domain types (mirrors docs/DATA_MODEL.md)
  hooks/useAccountContext.ts  Loads account+property+unit for the active account
```

## Design system

- **Colors**: Celerity purple (`#582C83`) and fiber-teal (`#0087AD`), including the exact `linear-gradient(129deg, #0087AD 0%, #582C83 72%)` used for primary CTAs on celerityfiber.com — confirmed by inspecting the live site, not guessed. Full palette in `src/app/globals.css`, matching the palette already established in this repo's other Celerity tool (`Schedule/celerity-marketing-workspace`).
- **Logo**: the real Celerity Fiber wordmark (`public/brand/celerity-logo.png`, copied from that same existing tool in this repo).
- **Typography**: the live site uses a licensed font ("D-Din Regular") for headlines that isn't available in this repo or as a free/redistributable font. Rather than invent a different identity, this app uses **Inter** everywhere (already the established sans font in this org's other Celerity tool) with tighter tracking/heavier weight on display text as a stand-in. Swap the `Inter` import in `src/app/layout.tsx` for a licensed D-DIN Pro webfont whenever that license is available — no other design-token changes needed.
- **Cards/light UI**: white cards, subtle borders, generous whitespace, restrained shadows — no glassmorphism, no heavy neon gradients. Gradients are used sparingly and intentionally (primary CTAs, the dark hero on Login and the Internet Status card) rather than everywhere.
- **Icons**: [Lucide](https://lucide.dev) exclusively — no emoji in the UI.

## What's implemented

Every page/flow named in the product brief is real and interactive against mock data — not static mockups:

- Login (demo auth, session persistence, protected routes)
- Dashboard (status hero, internet card, network health, billing summary, quick actions, latest activity)
- My Internet (service details, animated speed test, connected devices with pause/rename/prioritize)
- Plans (current plan, available upgrades, plan comparison + upgrade request flow)
- Billing (current bill breakdown, AutoPay toggle, payment methods) + Payment History (filterable, receipts)
- Full payment flow: amount → method → review → confirm → processing → success
- Support (quick actions, guided troubleshooting with a simulated gateway restart, ticket creation + status timeline, floating chat widget UI)
- Profile, Notifications (center + bell dropdown), Settings (security, notification prefs, billing prefs, privacy)
- Outage banner (portal-wide) + outage detail page
- Multi-account switching (Property/Unit aware), each with its own billing/service/device state
- Customer status states (Active / Past Due / Suspended / Disconnected / Pending Activation) that actually change what the dashboard shows

## Environment variables

None are required to run this version — everything is mocked. When real integrations are added (see [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md)), expect a `.env.local` with entries like:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
PAYMENT_GATEWAY_SECRET_KEY=
GLDS_API_BASE_URL=
SALESFORCE_CLIENT_ID=
```

## Further reading

- [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) — vision, users, brand research, features, architecture
- [docs/DATA_MODEL.md](docs/DATA_MODEL.md) — entities and relationships
- [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) — proposed GLDS / Salesforce / payments / network integrations
- [docs/ROADMAP.md](docs/ROADMAP.md) — MVP / Phase 2 / Phase 3
