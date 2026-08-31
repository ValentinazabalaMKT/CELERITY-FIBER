import type { CustomerStatus } from "@/types";

export const statusMeta: Record<
  CustomerStatus,
  { label: string; badgeClass: string; dotClass: string; description: string }
> = {
  active: {
    label: "Active",
    badgeClass: "bg-success-bg text-success",
    dotClass: "bg-success",
    description: "Your service is active and in good standing.",
  },
  past_due: {
    label: "Past Due",
    badgeClass: "bg-warning-bg text-warning",
    dotClass: "bg-warning",
    description: "Your account has a past-due balance. Pay now to avoid interruption.",
  },
  suspended: {
    label: "Suspended",
    badgeClass: "bg-danger-bg text-danger",
    dotClass: "bg-danger",
    description: "Service is suspended due to a past-due balance.",
  },
  disconnected: {
    label: "Disconnected",
    badgeClass: "bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground",
    description: "This account has been disconnected.",
  },
  pending_activation: {
    label: "Pending Activation",
    badgeClass: "bg-teal-50 text-teal-700",
    dotClass: "bg-teal-600",
    description: "Your installation is scheduled — service will activate soon.",
  },
};
