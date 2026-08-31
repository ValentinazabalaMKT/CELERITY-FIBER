# Data Model

Mirrors `src/types/index.ts` exactly. Mock implementations live in `src/data/*`.

## Entity overview

```
Customer 1---* Account *---1 Property 1---* Unit
                  |
                  |---1 InternetService --- Plan
                  |---1 NetworkStatus
                  |---* Device
                  |---* Invoice --- * InvoiceItem
                  |---* Payment
                  |---* PaymentMethod
                  |---* SupportTicket
                  |---* AppNotification
                  |---1 CommunicationPreferences

ServiceOutage *---1 Property
```

## Entities

### users / customers → `Customer`
The signed-in person. In this version there is a 1:1 mapping between an authenticated session and a `Customer`.

| Field | Type | Notes |
|---|---|---|
| id | string | |
| firstName, lastName | string | |
| email, phone | string | editable from Profile |
| preferredLanguage | "English" \| "Spanish" | |
| billingAddress | string | |
| accounts | Account[] | one customer can have multiple accounts (multi-property) |
| activeAccountId | string | which account is currently selected |

### accounts → `Account`
The billing/service relationship for one property+unit. A customer with a vacation property has two of these.

| Field | Type | Notes |
|---|---|---|
| id, accountNumber | string | |
| label | string | e.g. "Apartment", "Vacation property" |
| propertyId, unitId | string | FKs |
| status | `CustomerStatus` | active \| past_due \| suspended \| disconnected \| pending_activation |
| isPrimary | boolean | |

### properties → `Property`
A Celerity-served building/community. Real, published Celerity case-study properties are used in mock data (see docs/brand/FACT-SHEET.md) rather than invented names.

### units → `Unit`
A single unit within a property (`propertyId` FK + `unitNumber`).

### internet_services → `InternetService`
One per account. Everything shown on the "My Internet" page: status, plan, IP, install address, activation date, service ID, router info, last network check.

### plans → `Plan`
Catalog of available plans (not per-account — shared catalog, filtered by `availableAtProperty` and whether it matches the account's current plan via `isCurrent`).

| Field | Type | Notes |
|---|---|---|
| id, name | string | |
| downloadMbps, uploadMbps | number | symmetrical in all current mock plans |
| priceMonthly | number | |
| features | string[] | |
| availableAtProperty | boolean | drives the "Unavailable" lock state in the UI |
| idealFor | string[]? | used in the plan-comparison dialog |

### network_status → `NetworkStatus`
One per account. Backs the dashboard's Network Health card (hop-by-hop status, uptime %, connected device count).

### devices → `Device`
Per-account list of connected devices (type, connection, online/offline, paused, prioritized).

### invoices / invoice_items → `Invoice`, `InvoiceItem`
Per-account billing periods. `status`: paid \| due \| past_due \| processing. `getCurrentInvoice()` returns the first due/past_due invoice, or null.

### payments → `Payment`
Historical + newly-created payment records. Created by `makePayment()`; always has a `confirmationCode` (`CEL-######`).

### payment_methods → `PaymentMethod`
Saved payment instruments. **Never stores a real card/account number** — `last4` + a simulated opaque `token` only, consistent with the app's PCI-boundary stance (see docs/INTEGRATIONS.md).

### support_tickets → `SupportTicket`
`category`, `subject`, `description`, `priority`, `status` (open → assigned → in_review → resolved), and a `timeline` of `TicketEvent`s that the ticket detail view renders as a stepper.

### notifications → `AppNotification`
Per-account notification feed. `type`: payment \| maintenance \| bill \| support \| outage \| promotion.

### service_outages → `ServiceOutage`
Per-property (not per-account) — an outage affects everyone at that property. `status`: investigating → identified → monitoring → resolved, with its own `timeline`.

### communication_preferences → `CommunicationPreferences`
Per-account channel toggles (email/SMS/push) × topic toggles (bills, payment confirmations, service interruptions, maintenance, promotions, support updates).

## Relationships worth calling out

- **Account, not Customer, is the unit of service/billing.** Every API function that returns internet/billing/support/notification data takes an `accountId`, not a `customerId` — this is what makes multi-account switching work without prop-drilling the whole app.
- **Outages are keyed by `propertyId`**, not `accountId` — two accounts at the same property see the same outage; two accounts at different properties don't.
- **Plans are a shared catalog**, not owned by an account — `availableAtProperty` and `isCurrent` are the only per-account-dependent fields, computed at read time.
