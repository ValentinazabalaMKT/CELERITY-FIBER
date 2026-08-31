import type { Invoice } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { FileCheck2 } from "lucide-react";

export function CurrentBillCard({ invoice }: { invoice: Invoice | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Bill</CardTitle>
      </CardHeader>
      <CardContent>
        {!invoice ? (
          <EmptyState icon={FileCheck2} title="No bill due" description="You're all paid up for this period." />
        ) : (
          <>
            <ul className="divide-y divide-border">
              {invoice.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-bold text-foreground">Total</span>
              <span className="text-lg font-extrabold text-foreground">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div>
                <p className="uppercase tracking-wide">Billing period</p>
                <p className="mt-0.5 font-semibold text-foreground">
                  {formatDate(invoice.periodStart, { month: "short", day: "numeric" })} –{" "}
                  {formatDate(invoice.periodEnd, { month: "short", day: "numeric" })}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-wide">Due date</p>
                <p className="mt-0.5 font-semibold text-foreground">
                  {formatDate(invoice.dueDate, { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
