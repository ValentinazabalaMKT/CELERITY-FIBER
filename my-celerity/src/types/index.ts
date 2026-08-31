// Core domain types for My Celerity.
// Mirrors the data model documented in docs/DATA_MODEL.md so the mock
// layer and a future real API can share the exact same shapes.

export type CustomerStatus =
  | "active"
  | "past_due"
  | "suspended"
  | "disconnected"
  | "pending_activation";

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
}

export interface Account {
  id: string;
  label: string; // e.g. "Apartment", "Vacation property"
  accountNumber: string;
  propertyId: string;
  unitId: string;
  status: CustomerStatus;
  isPrimary: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredLanguage: "English" | "Spanish";
  billingAddress: string;
  accounts: Account[];
  activeAccountId: string;
}

export type SpeedUnit = "Mbps" | "Gbps";

export interface Plan {
  id: string;
  name: string;
  downloadMbps: number;
  uploadMbps: number;
  priceMonthly: number;
  features: string[];
  availableAtProperty: boolean;
  isCurrent?: boolean;
  idealFor?: string[];
}

export type ServiceStatus = "connected" | "degraded" | "offline";

export interface InternetService {
  accountId: string;
  status: ServiceStatus;
  planId: string;
  downloadMbps: number;
  uploadMbps: number;
  ipAddress: string;
  installationAddress: string;
  propertyName: string;
  unitNumber: string;
  activationDate: string; // ISO date
  serviceId: string;
  accountNumber: string;
  routerModel: string;
  routerSerial: string;
  lastNetworkCheck: string; // ISO datetime
}

export interface NetworkStatus {
  accountId: string;
  status: "excellent" | "good" | "degraded" | "offline";
  uptimePercent: number;
  connectedDeviceCount: number;
  hops: { label: string; status: "ok" | "warning" | "down" }[];
}

export type DeviceType =
  | "laptop"
  | "phone"
  | "tv"
  | "console"
  | "speaker"
  | "tablet"
  | "other";

export interface Device {
  id: string;
  accountId: string;
  name: string;
  type: DeviceType;
  connection: "WiFi" | "Ethernet";
  status: "online" | "offline";
  lastActivity: string; // ISO datetime
  paused: boolean;
  prioritized: boolean;
}

export interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  latencyMs: number;
  quality: "Excellent" | "Good" | "Fair" | "Poor";
  testedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  label: string;
  amount: number;
}

export type InvoiceStatus = "paid" | "due" | "past_due" | "processing";

export interface Invoice {
  id: string;
  accountId: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  issueDate: string;
  status: InvoiceStatus;
  total: number;
  items: InvoiceItem[];
}

export type PaymentMethodType = "credit_card" | "debit_card" | "bank_account";

export interface PaymentMethod {
  id: string;
  accountId: string;
  type: PaymentMethodType;
  brand?: string; // Visa, Mastercard, ...
  last4: string;
  expiry?: string;
  isDefault: boolean;
  /** Never a real account/card number -- a simulated, opaque token id. */
  token: string;
}

export type PaymentStatus = "succeeded" | "failed" | "processing";

export interface Payment {
  id: string;
  accountId: string;
  invoiceId?: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  methodLast4: string;
  confirmationCode: string;
}

export type TicketCategory =
  | "internet_slow"
  | "no_internet"
  | "billing"
  | "wifi"
  | "move_service"
  | "other";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketStatus = "open" | "assigned" | "in_review" | "resolved";

export interface TicketEvent {
  status: TicketStatus;
  label: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  accountId: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  timeline: TicketEvent[];
}

export type NotificationType =
  | "payment"
  | "maintenance"
  | "bill"
  | "support"
  | "outage"
  | "promotion";

export interface AppNotification {
  id: string;
  accountId: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export type OutageStatus = "investigating" | "identified" | "monitoring" | "resolved";

export interface ServiceOutage {
  id: string;
  propertyId: string;
  status: OutageStatus;
  startedAt: string;
  estimatedRestoration?: string;
  affectedArea: string;
  timeline: { status: OutageStatus; label: string; timestamp: string }[];
}

export interface CommunicationPreferences {
  accountId: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  topics: {
    bills: boolean;
    paymentConfirmations: boolean;
    serviceInterruptions: boolean;
    maintenance: boolean;
    promotions: boolean;
    supportUpdates: boolean;
  };
}
