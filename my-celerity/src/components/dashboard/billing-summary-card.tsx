"use client";

import Link from "next/link";
import type { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function BillingSummaryCard({
  invoice,
  onPayNow,
}: {
  invoice: Invoice | null;
  onPayNow: () => void;
}) {
  if (!invoice) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <p className="text-sm font-semibold text-foreground">You&apos;re all paid up</p>
          <p className="text-sm text-muted-foreground">No balance due right now.</p>
          <Link href="/billing" className="text-sm font-semibold text-brand-700 hover:underline">
            View billing
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isPastDue = invoice.status === "past_due";

  return (
    <Card>
      <CardContent className="pt-5 sm:pt-6">
        <div className="flex items-start justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current balance</p>
          {isPastDue && <Badge variant="danger" dot>Past due</Badge>}
        </div>
        <p className="mt-1.5 text-4xl font-extrabold tracking-tight text-foreground">
          {formatCurrency(invoice.total)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Due {formatDate(invoice.dueDate)}</p>

        <div className="mt-5 flex gap-2.5">
          <Button onClick={onPayNow} className="flex-1">
            Pay Now
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/billing">View Bill</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
