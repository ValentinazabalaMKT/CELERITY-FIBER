import type { SupportTicket, TicketCategory } from "@/types";

export const ticketCategoryLabels: Record<TicketCategory, string> = {
  internet_slow: "Internet is slow",
  no_internet: "No Internet",
  billing: "Billing question",
  wifi: "WiFi issue",
  move_service: "Move service",
  other: "Other issue",
};

export const mockTickets: Record<string, SupportTicket[]> = {
  acct_primary: [
    {
      id: "CF-28491",
      accountId: "acct_primary",
      category: "wifi",
      subject: "WiFi drops in the bedroom",
      description:
        "Connection drops every evening around 9pm in the back bedroom, other rooms are fine.",
      priority: "medium",
      status: "in_review",
      createdAt: "2026-08-27T18:20:00-04:00",
      timeline: [
        { status: "open", label: "Ticket created", timestamp: "2026-08-27T18:20:00-04:00" },
        { status: "assigned", label: "Assigned to a support specialist", timestamp: "2026-08-27T19:05:00-04:00" },
        { status: "in_review", label: "Technician reviewing signal logs", timestamp: "2026-08-28T09:12:00-04:00" },
      ],
    },
    {
      id: "CF-27118",
      accountId: "acct_primary",
      category: "billing",
      subject: "Question about admin fee",
      description: "Wanted to confirm what the $5 admin fee on my bill covers.",
      priority: "low",
      status: "resolved",
      createdAt: "2026-07-02T14:00:00-04:00",
      timeline: [
        { status: "open", label: "Ticket created", timestamp: "2026-07-02T14:00:00-04:00" },
        { status: "assigned", label: "Assigned to billing support", timestamp: "2026-07-02T14:40:00-04:00" },
        { status: "resolved", label: "Resolved by support agent", timestamp: "2026-07-02T16:10:00-04:00" },
      ],
    },
  ],
  acct_secondary: [],
};
