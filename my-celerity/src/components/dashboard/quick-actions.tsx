import Link from "next/link";
import { Gauge, LifeBuoy, Receipt, Router } from "lucide-react";

const actions = [
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/internet#devices", label: "Devices", icon: Router },
  { href: "/plans", label: "Plan", icon: Gauge },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-foreground">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <a.icon className="size-[18px]" />
            </span>
            <span className="text-[12px] font-semibold text-foreground">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
