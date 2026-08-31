"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getCurrentInvoice } from "@/lib/api";
import type { Invoice } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { BillingSummaryCard } from "@/components/dashboard/billing-summary-card";
import { CurrentBillCard } from "@/components/billing/current-bill-card";
import { AutoPayCard } from "@/components/billing/autopay-card";
import { PaymentMethodsCard } from "@/components/billing/payment-methods-card";
import { PaymentFlow } from "@/components/billing/payment-flow";

export default function BillingPage() {
  const { activeAccountId } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCurrentInvoice(activeAccountId).then((inv) => {
      if (!cancelled) {
        setInvoice(inv);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your balance, AutoPay and payment methods.</p>
        </div>
        <Link
          href="/billing/history"
          className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
        >
          Payment History <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {loading ? (
            <Skeleton className="h-56 w-full rounded-2xl" />
          ) : (
            <CurrentBillCard invoice={invoice} />
          )}
          <PaymentMethodsCard accountId={activeAccountId} />
        </div>
        <div className="space-y-5">
          {loading ? (
            <Skeleton className="h-48 w-full rounded-2xl" />
          ) : (
            <BillingSummaryCard invoice={invoice} onPayNow={() => setPayOpen(true)} />
          )}
          <AutoPayCard accountId={activeAccountId} />
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
