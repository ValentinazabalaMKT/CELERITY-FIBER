"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, CheckCircle2, Loader2 } from "lucide-react";
import type { Plan } from "@/types";
import { formatCurrency, formatSpeed, delay } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Step = "compare" | "submitting" | "confirmed";

export function PlanComparisonDialog({
  currentPlan,
  targetPlan,
  onOpenChange,
}: {
  currentPlan: Plan | null;
  targetPlan: Plan | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<Step>("compare");

  useEffect(() => {
    if (targetPlan) setStep("compare");
  }, [targetPlan]);

  if (!currentPlan || !targetPlan) return null;

  const faster = targetPlan.downloadMbps > currentPlan.downloadMbps;
  const multiplier = (targetPlan.downloadMbps / currentPlan.downloadMbps).toFixed(1);

  async function handleUpgrade() {
    setStep("submitting");
    await delay(null, 1400);
    setStep("confirmed");
  }

  return (
    <Dialog open={!!targetPlan} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {step === "compare" && (
          <>
            <DialogHeader>
              <DialogTitle>Compare plans</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Current Plan
                </p>
                <p className="mt-1 text-xl font-extrabold text-foreground">{currentPlan.name}</p>
                <p className="text-sm text-muted-foreground">{formatSpeed(currentPlan.downloadMbps)}</p>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {formatCurrency(currentPlan.priceMonthly)}
                  <span className="text-xs font-medium text-muted-foreground">/mo</span>
                </p>
              </div>
              <div className="rounded-2xl border border-brand-700 bg-brand-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                  {targetPlan.name}
                </p>
                <p className="mt-1 text-xl font-extrabold text-foreground">{targetPlan.name}</p>
                <p className="text-sm text-brand-700">
                  {formatSpeed(targetPlan.downloadMbps)}
                  {faster && ` · ${multiplier}x faster`}
                </p>
                <p className="mt-2 text-lg font-bold text-foreground">
                  {formatCurrency(targetPlan.priceMonthly)}
                  <span className="text-xs font-medium text-muted-foreground">/mo</span>
                </p>
              </div>
            </div>

            {targetPlan.idealFor && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-foreground">Ideal for</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {targetPlan.idealFor.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-3.5 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button size="lg" className="mt-5 w-full gap-2" onClick={handleUpgrade}>
              {faster ? "Upgrade" : "Switch Plan"} <ArrowRight className="size-4" />
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              We&apos;ll confirm your new plan and any change in your next bill.
            </p>
          </>
        )}

        {step === "submitting" && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <Loader2 className="size-10 animate-spin text-brand-700" />
            <p className="text-sm font-semibold text-foreground">Submitting your plan change…</p>
          </div>
        )}

        {step === "confirmed" && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <span className="mb-2 flex size-16 items-center justify-center rounded-full bg-success-bg text-success">
              <CheckCircle2 className="size-9" />
            </span>
            <p className="text-sm font-semibold text-success">Plan change requested</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              We&apos;re moving you to <span className="font-semibold text-foreground">{targetPlan.name}</span>.
              You&apos;ll get a confirmation email once it&apos;s active.
            </p>
            <Button className="mt-6 w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
