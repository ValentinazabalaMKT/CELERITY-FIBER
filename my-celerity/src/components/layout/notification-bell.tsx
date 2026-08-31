"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getNotifications } from "@/lib/api";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { AppNotification } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationIconFor } from "@/lib/notification-meta";

export function NotificationBell() {
  const { activeAccountId } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    let cancelled = false;
    getNotifications(activeAccountId).then((data) => {
      if (!cancelled) setItems(data);
    });
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  const unread = items.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="px-4 pt-3">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        <div className="max-h-80 overflow-y-auto p-1.5">
          {items.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          )}
          {items.slice(0, 5).map((n) => {
            const Icon = notificationIconFor(n.type);
            return (
              <div
                key={n.id}
                className={cn(
                  "flex gap-3 rounded-lg px-2.5 py-2.5 text-sm",
                  !n.read && "bg-brand-50/60"
                )}
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-foreground">{n.title}</span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground/80">
                    {formatRelativeTime(n.timestamp)}
                  </span>
                </span>
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-700" />}
              </div>
            );
          })}
        </div>
        <DropdownMenuSeparator className="my-0" />
        <Link
          href="/notifications"
          className="block px-4 py-3 text-center text-sm font-semibold text-brand-700 hover:bg-muted"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
