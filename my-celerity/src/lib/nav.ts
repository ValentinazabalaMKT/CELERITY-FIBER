import type { LucideIcon } from "lucide-react";
import { Gauge, LayoutGrid, LifeBuoy, Receipt, User, Wifi } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Shared between the desktop sidebar and the mobile bottom nav so the two
// never drift out of sync. Plans and Payment History live one level down
// (inside Internet / Billing) rather than getting their own top-level slot,
// which is what keeps the mobile bar at a clean 5 items per the spec.
export const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/internet", label: "Internet", icon: Wifi },
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/profile", label: "Account", icon: User },
];

export const desktopSecondaryNav: NavItem[] = [
  { href: "/plans", label: "Plans", icon: Gauge },
];
