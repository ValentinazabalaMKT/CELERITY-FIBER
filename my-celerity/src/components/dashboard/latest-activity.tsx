import type { AppNotification } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { notificationIconFor } from "@/lib/notification-meta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { Activity } from "lucide-react";

export function LatestActivity({ items }: { items: AppNotification[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={Activity} title="No recent activity" />
        ) : (
          <ul className="space-y-4">
            {items.slice(0, 4).map((n) => {
              const Icon = notificationIconFor(n.type);
              return (
                <li key={n.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(n.timestamp)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
