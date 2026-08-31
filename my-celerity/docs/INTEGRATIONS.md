# Future Integrations

Nothing in this document is connected. This app runs entirely on mock data today. This is a **proposal** for how each real integration would slot into the existing `src/lib/api.ts` layer without requiring changes to any page or component — every function in that file already has the signature a real integration would need.

No real service is connected without credentials and documentation in hand, and none should be added without deliberately updating this document first.

## 1. GLDS (billing system of record)

Celerity's existing internal reconciliation tooling (`tools/minorca-reconciliation` elsewhere in this repo) already integrates with GLDS exports for billing/account data, which makes GLDS the natural source of truth for:

- `getInvoices()`, `getCurrentInvoice()`, `getPayments()` — real billing history and current balance
- `Account.status`, `Account.accountNumber` — GLDS account status codes (the reconciliation tool already documents GLDS's status vocabulary: ACT/INA/DTV/HDC/COL/DNU/BLK/WRO)
- Package/plan data — GLDS's `Customer_Pk` export (also already used by the reconciliation tool) maps an account to its billed package name, which is the realistic source for `Plan` data rather than a hardcoded catalog

**Approach**: a server-side adapter that calls GLDS's export/API and normalizes into the `Invoice`/`Payment`/`Account` shapes already defined in `src/types/index.ts`, so `src/lib/api.ts` functions become thin wrappers instead of mock lookups.

## 2. Salesforce (CRM / account & property data)

- `Customer` profile fields (name, contact info, preferred language)
- `Property` / `Unit` records and the account↔property↔unit relationship
- Account status corroboration (the existing reconciliation tool already cross-checks GLDS against Salesforce for account-number and status agreement — the same normalization logic should be reused here, not reinvented)

**Approach**: Salesforce becomes the source for `getAccountContext()` and parts of `getCustomer()`. Given the reconciliation tool already solved GLDS↔Salesforce account-number matching (including leading-zero and truncated-name edge cases), that normalization code is directly reusable rather than rewritten.

## 3. Payment gateway

`makePayment()`, `getPaymentMethods()`, and the AutoPay endpoints are the integration points. Requirements for whichever gateway is chosen (Stripe is the natural default given its Next.js support):

- **PCI compliance boundary**: this app must never see or store a raw card/account number. `PaymentMethod.token` already models this — it should hold the gateway's tokenized payment-method ID, never card data. The `payment_methods` table should never gain a "card number" column.
- Payment confirmation (`Payment.confirmationCode`) should be replaced by the gateway's real transaction ID.
- Webhooks for async payment status (`processing` → `succeeded`/`failed`) instead of the current synchronous mock resolution.

## 4. Network monitoring / device management

Currently fully simulated:

- `runSpeedTest()` — returns randomized-but-plausible numbers. A real integration would call whatever speed-test infrastructure Celerity's network team uses (or embed a real speed-test SDK/iframe).
- `getNetworkStatus()`, `getConnectedDevices()`, `restartGateway()`, `toggleDevicePause()`, `prioritizeDevice()` — these map directly to gateway/router management APIs (e.g. TR-069/CWMP, or a vendor-specific management API depending on what hardware Celerity deploys — the mock `InternetService.routerModel`/`routerSerial` fields are placeholders for whatever that real device identity turns out to be).

## 5. Support / ticketing platform

`getTickets()`, `createTicket()` map to whichever ticketing system Celerity's support team uses. The mock `TicketEvent` timeline (open → assigned → in_review → resolved) should mirror that system's real status vocabulary once known — it was modeled after the "End to End Support" team structure documented in `docs/brand/FACT-SHEET.md` (Project Manager → Launch Manager → Dedicated Account Manager → Customer Experience Team), not invented.

## 6. Email / SMS / push

`CommunicationPreferences` already models channel (email/SMS/push) × topic opt-in/out. Sending itself needs:
- Email: existing transactional email provider
- SMS: a provider like Twilio
- Push: web push (for PWA-style installs) and/or native push once a mobile app exists (the live site already references a "Celerity App" — see docs/brand/FACT-SHEET.md)

## 7. Authentication

Demo auth today (`src/lib/auth.tsx`) is a hardcoded email/password check persisted to `localStorage` — explicitly not production-safe. Proposed real target: **Supabase Auth** (email/password + magic link, with room for MFA later), because it also gives a straightforward path to a real Postgres backend for everything in [docs/DATA_MODEL.md](DATA_MODEL.md) that doesn't come from GLDS/Salesforce. See `docs/ROADMAP.md` Phase 2 for sequencing.

## What NOT to do

- Don't connect any of the above without real credentials **and** a documented contract for the exact fields/endpoints involved.
- Don't invent plan names, prices, SLAs, or coverage claims beyond what's confirmed in `docs/brand/FACT-SHEET.md` — this applies to integration work just as much as to marketing copy.
- Don't store raw payment credentials anywhere in this codebase, mock or real.
