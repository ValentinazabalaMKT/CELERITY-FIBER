import {
  Bell,
  CreditCard,
  FileText,
  LifeBuoy,
  Megaphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/types";

const map: Record<NotificationType, LucideIcon> = {
  payment: CreditCard,
  maintenance: Wrench,
  bill: FileText,
  support: LifeBuoy,
  outage: Bell,
  promotion: Megaphone,
};

export function notificationIconFor(type: NotificationType): LucideIcon {
  return map[type] ?? Bell;
}
