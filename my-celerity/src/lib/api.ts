// -----------------------------------------------------------------------
// API layer. Every function here is backed by mock data today, but the
// signatures are shaped like the real calls this app will eventually make
// (GLDS / Salesforce / a payment gateway / network monitoring / a
// ticketing platform -- see docs/INTEGRATIONS.md). Swapping a function
// body for a real `fetch` later should not require touching any caller.
// -----------------------------------------------------------------------
import { mockAccounts, mockCustomer, getAccount, getProperty, getUnit } from "@/data/mockCustomer";
import {
  mockDevices,
  mockInternetServices,
  mockNetworkStatus,
  mockPlans,
} from "@/data/mockInternet";
import {
  mockAutoPay,
  mockInvoices,
  mockPaymentMethods,
  mockPayments,
} from "@/data/mockBilling";
import { mockTickets } from "@/data/mockSupport";
import { mockCommunicationPreferences, mockNotifications } from "@/data/mockNotifications";
import { mockOutages } from "@/data/mockOutages";
import type {
  Account,
  CommunicationPreferences,
  Customer,
  Device,
  Invoice,
  InternetService,
  NetworkStatus,
  Payment,
  PaymentMethod,
  Plan,
  ServiceOutage,
  SpeedTestResult,
  SupportTicket,
  TicketCategory,
  TicketPriority,
} from "@/types";
import { delay } from "./utils";

export async function getCustomer(): Promise<Customer> {
  return delay(mockCustomer, 300);
}

export async function getAccounts(): Promise<Account[]> {
  return delay(mockAccounts, 200);
}

export async function getAccountContext(accountId: string) {
  const account = getAccount(accountId);
  return delay(
    {
      account,
      property: getProperty(account.propertyId),
      unit: getUnit(account.unitId),
    },
    200
  );
}

export async function getInternetService(accountId: string): Promise<InternetService> {
  const service = mockInternetServices[accountId];
  if (!service) throw new Error(`No internet service on file for ${accountId}`);
  return delay(service, 400);
}

export async function getNetworkStatus(accountId: string): Promise<NetworkStatus> {
  const status = mockNetworkStatus[accountId];
  if (!status) throw new Error(`No network status for ${accountId}`);
  return delay(status, 500);
}

export async function getCurrentPlan(accountId: string): Promise<Plan> {
  const service = mockInternetServices[accountId];
  const plan = mockPlans.find((p) => p.id === service?.planId);
  if (!plan) throw new Error(`No current plan for ${accountId}`);
  return delay(plan, 300);
}

export async function getAvailablePlans(accountId: string): Promise<Plan[]> {
  const service = mockInternetServices[accountId];
  return delay(
    mockPlans.map((p) => ({ ...p, isCurrent: p.id === service?.planId })),
    400
  );
}

export async function getConnectedDevices(accountId: string): Promise<Device[]> {
  return delay(mockDevices[accountId] ?? [], 450);
}

export async function toggleDevicePause(accountId: string, deviceId: string): Promise<Device> {
  const list = mockDevices[accountId] ?? [];
  const device = list.find((d) => d.id === deviceId);
  if (!device) throw new Error("Device not found");
  device.paused = !device.paused;
  return delay(device, 350);
}

export async function renameDevice(accountId: string, deviceId: string, name: string): Promise<Device> {
  const list = mockDevices[accountId] ?? [];
  const device = list.find((d) => d.id === deviceId);
  if (!device) throw new Error("Device not found");
  device.name = name;
  return delay(device, 300);
}

export async function prioritizeDevice(accountId: string, deviceId: string): Promise<Device> {
  const list = mockDevices[accountId] ?? [];
  const device = list.find((d) => d.id === deviceId);
  if (!device) throw new Error("Device not found");
  device.prioritized = !device.prioritized;
  return delay(device, 300);
}

export async function runSpeedTest(): Promise<SpeedTestResult> {
  await delay(null, 2600);
  const download = 900 + Math.round(Math.random() * 80);
  const upload = 880 + Math.round(Math.random() * 90);
  const latency = 5 + Math.round(Math.random() * 8);
  const quality: SpeedTestResult["quality"] =
    download > 850 ? "Excellent" : download > 500 ? "Good" : download > 150 ? "Fair" : "Poor";
  return {
    downloadMbps: download,
    uploadMbps: upload,
    latencyMs: latency,
    quality,
    testedAt: new Date().toISOString(),
  };
}

export async function restartGateway(): Promise<{ ok: true }> {
  await delay(null, 3200);
  return { ok: true };
}

export async function getInvoices(accountId: string): Promise<Invoice[]> {
  return delay(mockInvoices[accountId] ?? [], 400);
}

export async function getCurrentInvoice(accountId: string): Promise<Invoice | null> {
  const invoices = mockInvoices[accountId] ?? [];
  const due = invoices.find((i) => i.status === "due" || i.status === "past_due");
  return delay(due ?? null, 300);
}

export async function getPayments(accountId: string): Promise<Payment[]> {
  return delay(mockPayments[accountId] ?? [], 400);
}

export async function getPaymentMethods(accountId: string): Promise<PaymentMethod[]> {
  return delay(mockPaymentMethods[accountId] ?? [], 300);
}

export async function getAutoPay(accountId: string) {
  return delay(mockAutoPay[accountId] ?? { enabled: false, methodId: null }, 250);
}

export async function setAutoPay(accountId: string, enabled: boolean) {
  const current = mockAutoPay[accountId] ?? { enabled: false, methodId: null };
  mockAutoPay[accountId] = { ...current, enabled };
  return delay(mockAutoPay[accountId], 400);
}

export interface MakePaymentInput {
  accountId: string;
  invoiceId?: string;
  amount: number;
  paymentMethodId: string;
}

export async function makePayment(input: MakePaymentInput): Promise<Payment> {
  await delay(null, 1800);
  const method = (mockPaymentMethods[input.accountId] ?? []).find(
    (m) => m.id === input.paymentMethodId
  );
  const payment: Payment = {
    id: `pay_${Date.now()}`,
    accountId: input.accountId,
    invoiceId: input.invoiceId,
    amount: input.amount,
    date: new Date().toISOString(),
    status: "succeeded",
    methodLast4: method?.last4 ?? "0000",
    confirmationCode: `CEL-${Math.floor(100000 + Math.random() * 899999)}`,
  };
  mockPayments[input.accountId] = [payment, ...(mockPayments[input.accountId] ?? [])];
  const invoice = (mockInvoices[input.accountId] ?? []).find((i) => i.id === input.invoiceId);
  if (invoice) invoice.status = "paid";
  return payment;
}

export async function getTickets(accountId: string): Promise<SupportTicket[]> {
  return delay(mockTickets[accountId] ?? [], 400);
}

export interface CreateTicketInput {
  accountId: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
}

export async function createTicket(input: CreateTicketInput): Promise<SupportTicket> {
  await delay(null, 1200);
  const id = `CF-${Math.floor(20000 + Math.random() * 9999)}`;
  const now = new Date().toISOString();
  const ticket: SupportTicket = {
    id,
    accountId: input.accountId,
    category: input.category,
    subject: input.subject,
    description: input.description,
    priority: input.priority,
    status: "open",
    createdAt: now,
    timeline: [{ status: "open", label: "Ticket created", timestamp: now }],
  };
  mockTickets[input.accountId] = [ticket, ...(mockTickets[input.accountId] ?? [])];
  return ticket;
}

export async function getNotifications(accountId: string) {
  return delay(mockNotifications[accountId] ?? [], 300);
}

export async function markNotificationRead(accountId: string, notificationId: string) {
  const list = mockNotifications[accountId] ?? [];
  const notif = list.find((n) => n.id === notificationId);
  if (notif) notif.read = true;
  return delay(notif ?? null, 150);
}

export async function markAllNotificationsRead(accountId: string) {
  const list = mockNotifications[accountId] ?? [];
  list.forEach((n) => (n.read = true));
  return delay(list, 200);
}

export async function getOutages(propertyId: string): Promise<ServiceOutage[]> {
  return delay(mockOutages[propertyId] ?? [], 300);
}

export async function getOutage(outageId: string): Promise<ServiceOutage | null> {
  const all = Object.values(mockOutages).flat();
  return delay(all.find((o) => o.id === outageId) ?? null, 250);
}

export async function getCommunicationPreferences(accountId: string): Promise<CommunicationPreferences> {
  return delay(
    mockCommunicationPreferences[accountId] ?? {
      accountId,
      channels: { email: true, sms: false, push: true },
      topics: {
        bills: true,
        paymentConfirmations: true,
        serviceInterruptions: true,
        maintenance: true,
        promotions: false,
        supportUpdates: true,
      },
    },
    300
  );
}

export async function updateCommunicationPreferences(
  accountId: string,
  prefs: CommunicationPreferences
): Promise<CommunicationPreferences> {
  mockCommunicationPreferences[accountId] = prefs;
  return delay(prefs, 350);
}
