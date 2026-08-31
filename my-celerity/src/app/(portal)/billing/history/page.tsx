"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Eye, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getPayments } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ranges = [
  { label: "Last 3 months", months: 3 },
  { label: "6 months", months: 6 },
  { label: "12 months", months: 12 },
];

export default function PaymentHistoryPage() {
  const { activeAccountId } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(12);
  const [viewing, setViewing] = useState<Payment | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPayments(activeAccountId).then((data) => {
      if (!cancelled) {
        setPayments(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - range);
    return payments.filter((p) => new Date(p.date) >= cutoff);
  }, [payments, range]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/billing" className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Billing
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Payment History</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {ranges.map((r) => (
          <button
            key={r.months}
            onClick={() => setRange(r.months)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              range === r.months ? "bg-brand-700 text-white" : "bg-muted text-muted-foreground hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5 sm:pt-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={FileText} title="No payments in this range" />
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{formatDate(p.date, { month: "short", day: "numeric", year: "numeric" })}</p>
                    <p className="text-xs text-muted-foreground">Visa •••• {p.methodLast4} · {p.confirmationCode}</p>
                  </div>
                  <p className="font-semibold text-foreground">{formatCurrency(p.amount)}</p>
                  <Badge variant={p.status === "succeeded" ? "success" : p.status === "processing" ? "warning" : "danger"}>
                    {p.status === "succeeded" ? "Paid" : p.status === "processing" ? "Processing" : "Failed"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Eye className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setViewing(p)}>
                        <Eye className="size-4" /> View receipt
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setViewing(p)}>
                        <Download className="size-4" /> Download receipt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="rounded-2xl bg-surface-alt p-5 text-center">
                <p className="text-3xl font-extrabold text-foreground">{formatCurrency(viewing.amount)}</p>
                <p className="mt-1 text-sm text-muted-foreground">{formatDate(viewing.date)}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmation</span>
                  <span className="font-semibold text-foreground">{viewing.confirmationCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment method</span>
                  <span className="font-semibold text-foreground">Visa •••• {viewing.methodLast4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-success">Paid</span>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Download className="size-4" /> Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
