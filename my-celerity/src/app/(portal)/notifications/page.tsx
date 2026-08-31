"use client";

import { useEffect, useState } from "react";
import { BellOff, CheckCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/api";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { AppNotification } from "@/types";
import { notificationIconFor } from "@/lib/notification-meta";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state";

export default function NotificationsPage() {
  const { activeAccountId } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getNotifications(activeAccountId).then((data) => {
      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  async function handleMarkAll() {
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead(activeAccountId);
  }

  async function handleRead(id: string) {
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationRead(activeAccountId, id);
  }

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread > 0 ? `${unread} unread` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleMarkAll}>
            <CheckCheck className="size-4" /> Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-5 sm:pt-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState icon={BellOff} title="No notifications yet" />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const Icon = notificationIconFor(n.type);
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => handleRead(n.id)}
                      className={cn(
                        "flex w-full items-start gap-3.5 rounded-xl px-2 py-4 text-left transition-colors hover:bg-muted",
                        !n.read && "bg-brand-50/50"
                      )}
                    >
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                        <Icon className="size-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{n.title}</span>
                          {!n.read && <span className="size-2 shrink-0 rounded-full bg-brand-700" />}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{n.body}</span>
                        <span className="mt-1 block text-xs text-muted-foreground/70">
                          {formatRelativeTime(n.timestamp)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
