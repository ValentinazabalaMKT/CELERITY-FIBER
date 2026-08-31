"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAccountContext } from "@/hooks/useAccountContext";
import {
  getCurrentInvoice,
  getCurrentPlan,
  getInternetService,
  getNetworkStatus,
  getNotifications,
} from "@/lib/api";
import { timeOfDayGreeting } from "@/lib/greeting";
import { statusMeta } from "@/lib/status-meta";
import type { AppNotification, Invoice, InternetService, NetworkStatus, Plan } from "@/types";
import { InternetStatusCard } from "@/components/dashboard/internet-status-card";
import { NetworkHealth } from "@/components/dashboard/network-health";
import { BillingSummaryCard } from "@/components/dashboard/billing-summary-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { LatestActivity } from "@/components/dashboard/latest-activity";
import { PaymentFlow } from "@/components/billing/payment-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { customer, activeAccountId } = useAuth();
  const { account } = useAccountContext();

  const [service, setService] = useState<InternetService | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [network, setNetwork] = useState<NetworkStatus | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [activity, setActivity] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getInternetService(activeAccountId),
      getCurrentPlan(activeAccountId),
      getNetworkStatus(activeAccountId),
      getCurrentInvoice(activeAccountId),
      getNotifications(activeAccountId),
    ]).then(([svc, pl, net, inv, notifs]) => {
      if (cancelled) return;
      setService(svc);
      setPlan(pl);
      setNetwork(net);
      setInvoice(inv);
      setActivity(notifs);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  const meta = account ? statusMeta[account.status] : null;
  const showStatusBanner = account && account.status !== "active";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
          {timeOfDayGreeting()}, {customer?.firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {showStatusBanner
            ? meta?.description
            : "Everything looks good with your Celerity connection."}
        </p>
      </div>

      {showStatusBanner && meta && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning-bg bg-warning-bg px-4 py-3.5 text-sm sm:px-5">
          <AlertCircle className="size-5 shrink-0 text-warning" />
          <span className="flex-1 text-foreground">
            This account is <Badge variant="warning">{meta.label}</Badge> — {meta.description}
          </span>
          <Link href="/billing" className="shrink-0 text-sm font-semibold text-brand-700 hover:underline">
            Resolve now
          </Link>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {loading || !service || !plan ? (
            <Skeleton className="h-[340px] w-full rounded-2xl" />
          ) : (
            <InternetStatusCard service={service} plan={plan} />
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {loading || !network ? (
              <Skeleton className="h-[260px] w-full rounded-2xl sm:col-span-2" />
            ) : (
              <div className="sm:col-span-2">
                <NetworkHealth status={network} />
              </div>
            )}
          </div>

          <QuickActions />
        </div>

        <div className="space-y-5">
          {loading ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : (
            <BillingSummaryCard invoice={invoice} onPayNow={() => setPayOpen(true)} />
          )}
          {loading ? <Skeleton className="h-64 w-full rounded-2xl" /> : <LatestActivity items={activity} />}
        </div>
      </div>

      <PaymentFlow
        accountId={activeAccountId}
        invoice={invoice}
        open={payOpen}
        onOpenChange={setPayOpen}
        onSuccess={() => setInvoice(null)}
      />
    </div>
  );
}
