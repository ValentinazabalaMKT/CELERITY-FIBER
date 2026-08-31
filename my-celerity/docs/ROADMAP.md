# Roadmap

## MVP — this build

Everything below is implemented and running on mock data:

- [x] Login (demo auth, session persistence, protected routes, logout)
- [x] Dashboard (status hero, internet card, network health, billing summary, quick actions, activity)
- [x] My Internet (service details, speed test, connected devices)
- [x] Plans (current plan, upgrades, comparison/upgrade flow)
- [x] Billing (current bill, AutoPay, payment methods, full pay flow)
- [x] Payment History (filters, receipts)
- [x] Support (quick actions, guided troubleshooting, ticket creation + timeline, chat UI)
- [x] Profile (contact info, property/account details)
- [x] Notifications (center + header dropdown)
- [x] Settings (security, notification prefs, billing prefs, privacy)
- [x] Multi-account switching + customer-status-aware states (active/past due/suspended/etc.)
- [x] Outage banner + outage detail page
- [x] Responsive: desktop sidebar, tablet, mobile bottom nav

## Phase 2 — real backend, real integrations

Goal: same UI, real data underneath.

- [ ] Real authentication (Supabase Auth) replacing the demo login — see docs/INTEGRATIONS.md §7
- [ ] Real database for customer/account/property/unit/device/notification data not sourced from GLDS/Salesforce
- [ ] GLDS integration for billing (invoices, payments, account status) — docs/INTEGRATIONS.md §1
- [ ] Salesforce integration for CRM/property data — docs/INTEGRATIONS.md §2
- [ ] Real payment gateway (tokenized payment methods, real transaction confirmation, webhooks) — docs/INTEGRATIONS.md §3
- [ ] Real network/device management API replacing simulated speed test, device list, and gateway restart — docs/INTEGRATIONS.md §4
- [ ] Real support ticketing integration — docs/INTEGRATIONS.md §5
- [ ] Email/SMS/push delivery wired to `CommunicationPreferences` — docs/INTEGRATIONS.md §6
- [ ] Real outage/network-status feed (currently static mock data) replacing simulated outage banner
- [ ] "Add payment method" and "Attach a file" (currently disabled stubs in the UI) made functional
- [ ] Forgot-password / create-account flows (currently link-only placeholders on Login)
- [ ] Audit logging, rate limiting, and session-security hardening called for in the original brief

## Phase 3 — intelligence & personalization

- [ ] AI support assistant (the chat widget's "AI Assistant" tab is UI-only today — wire it to a real model with account context)
- [ ] Proactive network diagnostics (detect degradation before the resident notices, push a notification)
- [ ] Smart WiFi management (per-device scheduling, parental controls, guest network self-service)
- [ ] Usage insights (bandwidth trends, busiest devices/times — deliberately **not** built in MVP per the brief's "no KPI-dashboard, no BI-tool feel" direction; would need careful design to stay in the app's minimal, resident-first tone rather than becoming an admin dashboard)
- [ ] Personalized plan recommendations based on real usage data instead of a static catalog
- [ ] MFA (referenced as "coming soon" in Settings today)
- [ ] Property-manager-facing tooling (out of scope for this resident-facing app; would likely be a separate product surface)
