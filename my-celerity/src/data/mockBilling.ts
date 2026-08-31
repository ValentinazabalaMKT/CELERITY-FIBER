import type { Invoice, Payment, PaymentMethod } from "@/types";

function items(invoiceId: string, plan: number) {
  return [
    { id: `${invoiceId}_svc`, invoiceId, label: "Internet Service", amount: plan },
    { id: `${invoiceId}_admin`, invoiceId, label: "Admin Fee", amount: 5.0 },
    { id: `${invoiceId}_tax`, invoiceId, label: "Taxes & Fees", amount: 5.0 },
  ];
}

export const mockInvoices: Record<string, Invoice[]> = {
  acct_primary: [
    {
      id: "inv_2026_09",
      accountId: "acct_primary",
      periodStart: "2026-08-15",
      periodEnd: "2026-09-14",
      dueDate: "2026-09-15",
      issueDate: "2026-08-15",
      status: "due",
      total: 89.99,
      items: items("inv_2026_09", 79.99),
    },
    {
      id: "inv_2026_08",
      accountId: "acct_primary",
      periodStart: "2026-07-15",
      periodEnd: "2026-08-14",
      dueDate: "2026-08-15",
      issueDate: "2026-07-15",
      status: "paid",
      total: 89.99,
      items: items("inv_2026_08", 79.99),
    },
    {
      id: "inv_2026_07",
      accountId: "acct_primary",
      periodStart: "2026-06-15",
      periodEnd: "2026-07-14",
      dueDate: "2026-07-15",
      issueDate: "2026-06-15",
      status: "paid",
      total: 89.99,
      items: items("inv_2026_07", 79.99),
    },
    {
      id: "inv_2026_06",
      accountId: "acct_primary",
      periodStart: "2026-05-15",
      periodEnd: "2026-06-14",
      dueDate: "2026-06-15",
      issueDate: "2026-05-15",
      status: "paid",
      total: 89.99,
      items: items("inv_2026_06", 79.99),
    },
    {
      id: "inv_2026_05",
      accountId: "acct_primary",
      periodStart: "2026-04-15",
      periodEnd: "2026-05-14",
      dueDate: "2026-05-15",
      issueDate: "2026-04-15",
      status: "paid",
      total: 89.99,
      items: items("inv_2026_05", 79.99),
    },
    {
      id: "inv_2026_04",
      accountId: "acct_primary",
      periodStart: "2026-03-15",
      periodEnd: "2026-04-14",
      dueDate: "2026-04-15",
      issueDate: "2026-03-15",
      status: "paid",
      total: 89.99,
      items: items("inv_2026_04", 79.99),
    },
  ],
  acct_secondary: [
    {
      id: "inv_wave_2026_08",
      accountId: "acct_secondary",
      periodStart: "2026-07-22",
      periodEnd: "2026-08-21",
      dueDate: "2026-08-22",
      issueDate: "2026-07-22",
      status: "past_due",
      total: 69.99,
      items: items("inv_wave_2026_08", 59.99),
    },
    {
      id: "inv_wave_2026_07",
      accountId: "acct_secondary",
      periodStart: "2026-06-22",
      periodEnd: "2026-07-21",
      dueDate: "2026-07-22",
      issueDate: "2026-06-22",
      status: "paid",
      total: 69.99,
      items: items("inv_wave_2026_07", 59.99),
    },
  ],
};

export const mockPaymentMethods: Record<string, PaymentMethod[]> = {
  acct_primary: [
    {
      id: "pm_visa_4821",
      accountId: "acct_primary",
      type: "credit_card",
      brand: "Visa",
      last4: "4821",
      expiry: "09/28",
      isDefault: true,
      token: "tok_sim_9f3a1c",
    },
  ],
  acct_secondary: [
    {
      id: "pm_visa_4821_b",
      accountId: "acct_secondary",
      type: "credit_card",
      brand: "Visa",
      last4: "4821",
      expiry: "09/28",
      isDefault: true,
      token: "tok_sim_9f3a1c",
    },
  ],
};

export const mockPayments: Record<string, Payment[]> = {
  acct_primary: [
    {
      id: "pay_1",
      accountId: "acct_primary",
      invoiceId: "inv_2026_08",
      amount: 89.99,
      date: "2026-08-15",
      status: "succeeded",
      methodLast4: "4821",
      confirmationCode: "CEL-829184",
    },
    {
      id: "pay_2",
      accountId: "acct_primary",
      invoiceId: "inv_2026_07",
      amount: 89.99,
      date: "2026-07-15",
      status: "succeeded",
      methodLast4: "4821",
      confirmationCode: "CEL-812207",
    },
    {
      id: "pay_3",
      accountId: "acct_primary",
      invoiceId: "inv_2026_06",
      amount: 89.99,
      date: "2026-06-15",
      status: "succeeded",
      methodLast4: "4821",
      confirmationCode: "CEL-795118",
    },
    {
      id: "pay_4",
      accountId: "acct_primary",
      invoiceId: "inv_2026_05",
      amount: 89.99,
      date: "2026-05-15",
      status: "succeeded",
      methodLast4: "4821",
      confirmationCode: "CEL-778930",
    },
    {
      id: "pay_5",
      accountId: "acct_primary",
      invoiceId: "inv_2026_04",
      amount: 89.99,
      date: "2026-04-15",
      status: "succeeded",
      methodLast4: "4821",
      confirmationCode: "CEL-761442",
    },
  ],
  acct_secondary: [
    {
      id: "pay_6",
      accountId: "acct_secondary",
      invoiceId: "inv_wave_2026_07",
      amount: 69.99,
      date: "2026-07-22",
      status: "succeeded",
      methodLast4: "4821",
      confirmationCode: "CEL-804455",
    },
  ],
};

export const mockAutoPay: Record<string, { enabled: boolean; methodId: string | null }> = {
  acct_primary: { enabled: true, methodId: "pm_visa_4821" },
  acct_secondary: { enabled: false, methodId: null },
};
