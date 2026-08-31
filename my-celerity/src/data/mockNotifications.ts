import type { AppNotification, CommunicationPreferences } from "@/types";

export const mockNotifications: Record<string, AppNotification[]> = {
  acct_primary: [
    {
      id: "notif_1",
      accountId: "acct_primary",
      type: "bill",
      title: "New bill available",
      body: "Your September bill of $89.99 is ready. Due September 15, 2026.",
      timestamp: "2026-08-31T08:00:00-04:00",
      read: false,
    },
    {
      id: "notif_2",
      accountId: "acct_primary",
      type: "support",
      title: "Support ticket updated",
      body: "Your request CF-28491 has moved to \"Technician reviewing.\"",
      timestamp: "2026-08-28T09:12:00-04:00",
      read: false,
    },
    {
      id: "notif_3",
      accountId: "acct_primary",
      type: "maintenance",
      title: "Scheduled network maintenance",
      body: "Scheduled maintenance tonight from 2:00–3:00 AM. Brief interruptions possible.",
      timestamp: "2026-08-26T10:00:00-04:00",
      read: true,
    },
    {
      id: "notif_4",
      accountId: "acct_primary",
      type: "payment",
      title: "Payment received",
      body: "Your payment of $89.99 was received. Thank you!",
      timestamp: "2026-08-15T09:31:00-04:00",
      read: true,
    },
    {
      id: "notif_5",
      accountId: "acct_primary",
      type: "promotion",
      title: "2 Gig is now available at The Grande Condo",
      body: "Double your speed for streaming, gaming and multiple devices.",
      timestamp: "2026-08-10T11:00:00-04:00",
      read: true,
    },
  ],
  acct_secondary: [
    {
      id: "notif_6",
      accountId: "acct_secondary",
      type: "bill",
      title: "Payment past due",
      body: "Your balance of $69.99 is past due. Pay now to avoid service interruption.",
      timestamp: "2026-08-23T08:00:00-04:00",
      read: false,
    },
  ],
};

export const mockCommunicationPreferences: Record<string, CommunicationPreferences> = {
  acct_primary: {
    accountId: "acct_primary",
    channels: { email: true, sms: true, push: true },
    topics: {
      bills: true,
      paymentConfirmations: true,
      serviceInterruptions: true,
      maintenance: true,
      promotions: false,
      supportUpdates: true,
    },
  },
  acct_secondary: {
    accountId: "acct_secondary",
    channels: { email: true, sms: false, push: true },
    topics: {
      bills: true,
      paymentConfirmations: true,
      serviceInterruptions: true,
      maintenance: false,
      promotions: false,
      supportUpdates: true,
    },
  },
};
