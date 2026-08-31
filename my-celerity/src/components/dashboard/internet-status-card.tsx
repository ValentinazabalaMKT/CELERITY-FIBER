import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, ChevronRight } from "lucide-react";
import type { InternetService, Plan } from "@/types";
import { formatSpeed } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusMeta = {
  connected: { label: "Connected", badge: "success" as const },
  degraded: { label: "Degraded", badge: "warning" as const },
  offline: { label: "Offline", badge: "danger" as const },
};

export function InternetStatusCard({ service, plan }: { service: InternetService; plan: Plan }) {
  const meta = statusMeta[service.status];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0d0a1a] p-6 text-white shadow-card-hover sm:p-8">
      <div className="fiber-dots pointer-events-none absolute inset-0 opacity-[0.18]" />
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-teal-600/25 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-64 rounded-full bg-brand-700/30 blur-[100px]" />

      <div className="relative flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">My Internet</p>
            <p className="mt-0.5 text-lg font-semibold">Celerity Fiber</p>
          </div>
          <Badge variant={meta.badge} dot className="bg-white/10 text-white [&>span]:bg-current">
            {meta.label}
          </Badge>
        </div>

        <div>
          <p className="text-5xl font-extrabold tracking-tight sm:text-6xl">{formatSpeed(service.downloadMbps)}</p>
          <p className="mt-1 text-sm text-white/50">{plan.name} · Symmetrical fiber internet</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:max-w-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/10">
              <ArrowDownToLine className="size-4 text-teal-300" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/45">Download</p>
              <p className="text-sm font-semibold">{formatSpeed(service.downloadMbps)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/10">
              <ArrowUpFromLine className="size-4 text-teal-300" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/45">Upload</p>
              <p className="text-sm font-semibold">{formatSpeed(service.uploadMbps)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/45">Property</p>
            <p className="font-medium">{service.propertyName}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/45">Unit</p>
            <p className="font-medium">{service.unitNumber}</p>
          </div>
        </div>

        <Link
          href="/internet"
          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-teal-300 transition-colors hover:text-teal-200"
        >
          View Internet Details
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
