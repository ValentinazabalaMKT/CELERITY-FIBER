"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { getAutoPay, getPaymentMethods, setAutoPay } from "@/lib/api";
import type { PaymentMethod } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

export function AutoPayCard({ accountId }: { accountId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getAutoPay(accountId), getPaymentMethods(accountId)]).then(([autoPay, methods]) => {
      if (cancelled) return;
      setEnabled(autoPay.enabled);
      setMethod(methods.find((m) => m.id === autoPay.methodId) ?? methods[0] ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [accountId]);

  async function handleToggle(value: boolean) {
    setEnabled(value);
    setSaving(true);
    await setAutoPay(accountId, value);
    setSaving(false);
  }

  if (loading) return <Skeleton className="h-32 w-full rounded-2xl" />;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>AutoPay</CardTitle>
        <Switch checked={enabled} onCheckedChange={handleToggle} disabled={saving} aria-label="Toggle AutoPay" />
      </CardHeader>
      <CardContent>
        {method ? (
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <CreditCard className="size-4" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                {method.brand ?? "Bank account"} •••• {method.last4}
              </p>
              <p className="text-xs text-muted-foreground">
                {enabled ? "Bills are paid automatically" : "AutoPay is off"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Add a payment method to enable AutoPay.</p>
        )}
      </CardContent>
    </Card>
  );
}
