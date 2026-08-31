"use client";

import { useState } from "react";
import { Check, ChevronDown, LifeBuoy } from "lucide-react";
import type { SupportTicket } from "@/types";
import { ticketCategoryLabels } from "@/data/mockSupport";
import { formatRelativeTime, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state";

const statusMeta = {
  open: { label: "Open", variant: "brand" as const },
  assigned: { label: "Assigned", variant: "teal" as const },
  in_review: { label: "Technician reviewing", variant: "warning" as const },
  resolved: { label: "Resolved", variant: "success" as const },
};

export function TicketList({ tickets }: { tickets: SupportTicket[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Support Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <EmptyState icon={LifeBuoy} title="No support requests" description="Anything you submit will show up here." />
        ) : (
          <ul className="divide-y divide-border">
            {tickets.map((ticket) => {
              const meta = statusMeta[ticket.status];
              const isOpen = expanded === ticket.id;
              return (
                <li key={ticket.id} className="py-3.5 first:pt-0 last:pb-0">
                  <button
                    className="flex w-full items-center gap-3 text-left"
                    onClick={() => setExpanded(isOpen ? null : ticket.id)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        #{ticket.id} · {ticketCategoryLabels[ticket.category]} · {formatRelativeTime(ticket.createdAt)}
                      </p>
                    </div>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                    <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {isOpen && (
                    <div className="mt-3.5 space-y-3 border-l-2 border-brand-100 pl-4">
                      {ticket.timeline.map((event, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{event.label}</p>
                            <p className="text-[11px] text-muted-foreground">{formatRelativeTime(event.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
