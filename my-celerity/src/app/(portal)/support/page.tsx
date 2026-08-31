"use client";

import { useEffect, useState } from "react";
import { CreditCard, MoveRight, Plus, Wifi, WifiOff, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getTickets } from "@/lib/api";
import type { SupportTicket, TicketCategory } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TroubleshootFlow } from "@/components/support/troubleshoot-flow";
import { CreateTicketDialog } from "@/components/support/create-ticket-dialog";
import { TicketList } from "@/components/support/ticket-list";

const quickActions: { category: TicketCategory; label: string; icon: typeof Wifi; troubleshoot?: boolean }[] = [
  { category: "internet_slow", label: "Internet is slow", icon: Zap, troubleshoot: true },
  { category: "no_internet", label: "No Internet", icon: WifiOff, troubleshoot: true },
  { category: "billing", label: "Billing question", icon: CreditCard },
  { category: "wifi", label: "WiFi issue", icon: Wifi, troubleshoot: true },
  { category: "move_service", label: "Move service", icon: MoveRight },
  { category: "other", label: "Other issue", icon: Plus },
];

export default function SupportPage() {
  const { activeAccountId } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [troubleshootOpen, setTroubleshootOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState<TicketCategory>("other");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTickets(activeAccountId).then((data) => {
      if (!cancelled) {
        setTickets(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  function handleAction(category: TicketCategory, troubleshoot?: boolean) {
    if (troubleshoot) {
      setTroubleshootOpen(true);
    } else {
      setTicketCategory(category);
      setTicketOpen(true);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">How can we help?</h1>
          <p className="mt-1 text-sm text-muted-foreground">24/7 support, right here in the app.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setTicketCategory("other");
            setTicketOpen(true);
          }}
        >
          New Request
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {quickActions.map((action) => (
          <button
            key={action.category}
            onClick={() => handleAction(action.category, action.troubleshoot)}
            className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <action.icon className="size-[18px]" />
            </span>
            <span className="text-sm font-semibold text-foreground">{action.label}</span>
          </button>
        ))}
      </div>

      {loading ? <Skeleton className="h-64 w-full rounded-2xl" /> : <TicketList tickets={tickets} />}

      <TroubleshootFlow open={troubleshootOpen} onOpenChange={setTroubleshootOpen} />
      <CreateTicketDialog
        accountId={activeAccountId}
        open={ticketOpen}
        defaultCategory={ticketCategory}
        onOpenChange={setTicketOpen}
        onCreated={(ticket) => setTickets((list) => [ticket, ...list])}
      />
    </div>
  );
}
