"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getAvailablePlans } from "@/lib/api";
import { formatCurrency, formatSpeed } from "@/lib/utils";
import type { Plan } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanCard } from "@/components/plans/plan-card";
import { PlanComparisonDialog } from "@/components/plans/plan-comparison-dialog";

export default function PlansPage() {
  const { activeAccountId } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<Plan | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAvailablePlans(activeAccountId).then((data) => {
      if (!cancelled) {
        setPlans(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const current = plans.find((p) => p.isCurrent) ?? null;
  const others = plans.filter((p) => !p.isCurrent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your current speed, and what&apos;s available to upgrade to.</p>
      </div>

      {current && (
        <Card>
          <CardHeader>
            <CardTitle>
              Celerity Fiber {current.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <ul className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="size-4 text-success" /> {formatSpeed(current.downloadMbps)} Download
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="size-4 text-success" /> {formatSpeed(current.uploadMbps)} Upload
                </li>
                {current.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="size-4 text-success" /> {f}
                  </li>
                ))}
              </ul>
              <p className="text-3xl font-extrabold text-foreground">
                {formatCurrency(current.priceMonthly)}
                <span className="text-sm font-medium text-muted-foreground">/month</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-1 text-lg font-bold text-foreground">Available Upgrades</h2>
        <p className="mb-4 text-sm text-muted-foreground">Available at your property: The Grande Condo.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={setTarget} />
          ))}
        </div>
      </div>

      <PlanComparisonDialog
        currentPlan={current}
        targetPlan={target}
        onOpenChange={(open) => !open && setTarget(null)}
      />
    </div>
  );
}
