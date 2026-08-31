"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ChevronLeft } from "lucide-react";
import { getOutage } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/utils";
import type { ServiceOutage } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state";

const statusLabel: Record<ServiceOutage["status"], string> = {
  investigating: "Investigating",
  identified: "Technicians investigating",
  monitoring: "Monitoring the fix",
  resolved: "Resolved",
};

export default function OutageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [outage, setOutage] = useState<ServiceOutage | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    getOutage(id).then((data) => {
      if (!cancelled) setOutage(data);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Home
      </Link>

      {outage === undefined ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : outage === null ? (
        <EmptyState icon={AlertTriangle} title="Outage not found" description="This outage may already be resolved." />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-warning-bg text-warning">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground">Outage details</h1>
              <p className="text-sm text-muted-foreground">{outage.affectedArea}</p>
            </div>
          </div>

          <Card>
            <CardContent className="grid grid-cols-2 gap-4 pt-5 text-sm sm:pt-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Started</p>
                <p className="mt-0.5 font-semibold text-foreground">{formatTime(outage.startedAt)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Affected area</p>
                <p className="mt-0.5 font-semibold text-foreground">{outage.affectedArea}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                <p className="mt-0.5 font-semibold text-foreground">{statusLabel[outage.status]}</p>
              </div>
              {outage.estimatedRestoration && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Est. restoration</p>
                  <p className="mt-0.5 font-semibold text-foreground">{formatTime(outage.estimatedRestoration)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 border-l-2 border-warning-bg pl-4">
                {outage.timeline.map((event, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[23px] flex size-4 items-center justify-center rounded-full bg-warning text-white">
                      <Check className="size-2.5" strokeWidth={3.5} />
                    </span>
                    <p className="text-sm font-semibold text-foreground">{statusLabel[event.status]}</p>
                    <p className="text-xs text-muted-foreground">{event.label}</p>
                    <p className="text-[11px] text-muted-foreground/70">
                      {formatDate(event.timestamp)} · {formatTime(event.timestamp)}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
