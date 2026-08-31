"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Power, Router, Wifi, type LucideIcon } from "lucide-react";
import { restartGateway } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  { icon: Router, title: "Check gateway", description: "Confirming your Celerity gateway is online and reachable." },
  { icon: Wifi, title: "Run connection test", description: "Checking signal strength and packet loss on your line." },
  { icon: Power, title: "Restart network", description: "A quick restart resolves most WiFi slowdowns." },
];

export function TroubleshootFlow({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [checked, setChecked] = useState<number>(1); // steps 0 and 1 auto-pass instantly (diagnostic reads)
  const [restarting, setRestarting] = useState(false);
  const [restarted, setRestarted] = useState(false);

  async function handleRestart() {
    setRestarting(true);
    await restartGateway();
    setRestarting(false);
    setRestarted(true);
    setChecked(3);
  }

  function handleClose(v: boolean) {
    if (!v) {
      setChecked(1);
      setRestarted(false);
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Let&apos;s fix your connection</DialogTitle>
        </DialogHeader>

        <p className="mb-4 rounded-xl bg-success-bg px-3.5 py-2.5 text-sm font-semibold text-success">
          Your connection looks online. Let&apos;s check your WiFi.
        </p>

        <ol className="space-y-3">
          {steps.map((step, i) => {
            const done = i < checked || (i === 2 && restarted);
            const isRestartStep = i === 2;
            return (
              <li
                key={step.title}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3.5",
                  done ? "border-success-bg bg-success-bg/40" : "border-border"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    done ? "bg-success text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <CheckCircle2 className="size-5" /> : <step.icon className="size-[18px]" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Step {i + 1}: {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                  {isRestartStep && !restarted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2.5"
                      onClick={handleRestart}
                      loading={restarting}
                    >
                      {restarting ? "Restarting your network…" : "Restart Gateway"}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {restarted && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-success-bg px-3.5 py-3 text-sm font-semibold text-success">
            <CheckCircle2 className="size-4" /> Network restarted successfully.
          </div>
        )}

        {restarted && (
          <Button className="mt-4 w-full" onClick={() => handleClose(false)}>
            Done
          </Button>
        )}

        {!restarted && !restarting && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> Still slow after restarting? Create a support ticket below.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
