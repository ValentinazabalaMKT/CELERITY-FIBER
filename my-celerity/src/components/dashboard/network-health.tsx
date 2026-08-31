import { Check, Globe, Laptop, Router, Home as HomeIcon } from "lucide-react";
import type { NetworkStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const hopIcons = [Globe, Router, HomeIcon, Laptop];

const qualityLabel: Record<NetworkStatus["status"], string> = {
  excellent: "Everything looks great",
  good: "Everything looks good",
  degraded: "We're seeing some slowdowns",
  offline: "Your connection is offline",
};

export function NetworkHealth({ status }: { status: NetworkStatus }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Network Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {status.hops.map((hop, i) => {
            const Icon = hopIcons[i] ?? Globe;
            const isLast = i === status.hops.length - 1;
            return (
              <div key={hop.label} className="flex flex-1 items-center gap-1 sm:gap-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative flex size-11 items-center justify-center rounded-full bg-success-bg text-success sm:size-12">
                    <Icon className="size-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-success text-white ring-2 ring-card">
                      <Check className="size-2.5" strokeWidth={3.5} />
                    </span>
                  </div>
                  <span className="text-center text-[11px] font-medium text-muted-foreground sm:text-xs">
                    {hop.label}
                  </span>
                </div>
                {!isLast && <div className="h-0.5 flex-1 rounded-full bg-success-bg" />}
              </div>
            );
          })}
        </div>

        <p className="rounded-xl bg-success-bg px-4 py-2.5 text-center text-sm font-semibold text-success">
          {qualityLabel[status.status]}
        </p>

        <div className="grid grid-cols-3 gap-3 border-t border-border pt-5 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Network status</p>
            <p className="mt-1 text-sm font-bold capitalize text-foreground">{status.status}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Uptime</p>
            <p className="mt-1 text-sm font-bold text-foreground">{status.uptimePercent}%</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Devices</p>
            <p className="mt-1 text-sm font-bold text-foreground">{status.connectedDeviceCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
