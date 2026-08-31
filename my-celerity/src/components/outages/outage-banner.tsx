"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useAccountContext } from "@/hooks/useAccountContext";
import { getOutages } from "@/lib/api";
import { formatTime } from "@/lib/utils";
import type { ServiceOutage } from "@/types";

export function OutageBanner() {
  const { property } = useAccountContext();
  const [outage, setOutage] = useState<ServiceOutage | null>(null);

  useEffect(() => {
    if (!property) return;
    let cancelled = false;
    getOutages(property.id).then((outages) => {
      const active = outages.find((o) => o.status !== "resolved");
      if (!cancelled) setOutage(active ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [property]);

  if (!outage) return null;

  return (
    <Link
      href={`/outages/${outage.id}`}
      className="mb-5 flex items-center gap-3 rounded-2xl border border-warning-bg bg-warning-bg px-4 py-3.5 text-sm transition-colors hover:brightness-[0.98] sm:px-5"
    >
      <AlertTriangle className="size-5 shrink-0 text-warning" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-foreground">Service interruption detected</span>
        <span className="block text-muted-foreground">
          We&apos;re working to restore your service.
          {outage.estimatedRestoration && (
            <> Estimated restoration: {formatTime(outage.estimatedRestoration)}.</>
          )}
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
