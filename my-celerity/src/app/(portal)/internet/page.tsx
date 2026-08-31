"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getConnectedDevices, getCurrentPlan, getInternetService } from "@/lib/api";
import { formatDate, formatSpeed, formatTime } from "@/lib/utils";
import type { Device, InternetService, Plan } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SpeedTest } from "@/components/internet/speed-test";
import { DeviceList } from "@/components/internet/device-list";

const statusMeta = {
  connected: { label: "Connected", variant: "success" as const },
  degraded: { label: "Degraded", variant: "warning" as const },
  offline: { label: "Offline", variant: "danger" as const },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default function InternetPage() {
  const { activeAccountId } = useAuth();
  const [service, setService] = useState<InternetService | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getInternetService(activeAccountId),
      getCurrentPlan(activeAccountId),
      getConnectedDevices(activeAccountId),
    ]).then(([svc, pl, dev]) => {
      if (cancelled) return;
      setService(svc);
      setPlan(pl);
      setDevices(dev);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  if (loading || !service || !plan) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  const meta = statusMeta[service.status];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Internet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Everything about your fiber service in one place.</p>
        </div>
        <Badge variant={meta.variant} dot>
          {meta.label}
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Service Details</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/plans">Manage Plan</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <InfoRow label="Plan" value={plan.name} />
              <InfoRow label="Download speed" value={formatSpeed(service.downloadMbps)} />
              <InfoRow label="Upload speed" value={formatSpeed(service.uploadMbps)} />
              <InfoRow label="IP address" value={service.ipAddress} />
              <InfoRow label="Installation address" value={service.installationAddress} />
              <InfoRow label="Property" value={service.propertyName} />
              <InfoRow label="Unit" value={service.unitNumber} />
              <InfoRow label="Activation date" value={formatDate(service.activationDate)} />
              <InfoRow label="Service ID" value={service.serviceId} />
              <InfoRow label="Account number" value={service.accountNumber} />
              <InfoRow label="Router / gateway" value={`${service.routerModel} · ${service.routerSerial}`} />
              <InfoRow label="Last network check" value={formatTime(service.lastNetworkCheck)} />
            </CardContent>
          </Card>

          <DeviceList accountId={activeAccountId} devices={devices} />
        </div>

        <div className="space-y-5">
          <SpeedTest />
        </div>
      </div>
    </div>
  );
}
