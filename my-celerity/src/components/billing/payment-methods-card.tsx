"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { getPaymentMethods } from "@/lib/api";
import type { PaymentMethod } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function PaymentMethodsCard({ accountId }: { accountId: string }) {
  const [methods, setMethods] = useState<PaymentMethod[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPaymentMethods(accountId).then((data) => {
      if (!cancelled) setMethods(data);
    });
    return () => {
      cancelled = true;
    };
  }, [accountId]);

  if (!methods) return <Skeleton className="h-40 w-full rounded-2xl" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {methods.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <CreditCard className="size-4" />
            </span>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-foreground">
                {m.brand ?? "Bank account"} •••• {m.last4}
              </p>
              {m.expiry && <p className="text-xs text-muted-foreground">Expires {m.expiry}</p>}
            </div>
            {m.isDefault && <Badge variant="brand">Default</Badge>}
          </div>
        ))}
        <button
          type="button"
          disabled
          title="Add a new payment method (coming soon in this demo)"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground/70"
        >
          + Add payment method
        </button>
      </CardContent>
    </Card>
  );
}
