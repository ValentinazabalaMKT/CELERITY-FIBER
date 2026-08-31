"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Gauge, Radar, Timer } from "lucide-react";
import { runSpeedTest } from "@/lib/api";
import type { SpeedTestResult } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Phase = "idle" | "download" | "upload" | "done";

const qualityColor: Record<SpeedTestResult["quality"], string> = {
  Excellent: "text-success",
  Good: "text-teal-600",
  Fair: "text-warning",
  Poor: "text-danger",
};

export function SpeedTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [liveValue, setLiveValue] = useState(0);
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  async function handleRun() {
    setResult(null);
    setPhase("download");
    setLiveValue(0);

    // Optimistic animated counter while the (simulated) network test runs.
    intervalRef.current = setInterval(() => {
      setLiveValue((v) => {
        const ceiling = 980;
        const next = v + (ceiling - v) * 0.18 + Math.random() * 6;
        return Math.min(next, ceiling);
      });
    }, 90);

    const uploadTimer = setTimeout(() => setPhase("upload"), 1300);

    const testResult = await runSpeedTest();

    clearTimeout(uploadTimer);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setResult(testResult);
    setPhase("done");
  }

  const isTesting = phase === "download" || phase === "upload";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test your connection</CardTitle>
        <CardDescription>Run a live check of your download, upload and latency.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 py-2">
          <div className="relative flex size-48 items-center justify-center">
            <div
              className={cn(
                "absolute inset-0 rounded-full border-4 border-brand-100",
                isTesting && "animate-pulse"
              )}
            />
            {isTesting && (
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-700 [animation-duration:1.1s]" />
            )}
            <div className="flex flex-col items-center">
              {phase === "idle" && <Gauge className="size-9 text-brand-700" />}
              {isTesting && (
                <>
                  <span className="text-3xl font-extrabold tabular-nums text-foreground">
                    {Math.round(liveValue)}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {phase === "download" ? "Mbps down" : "Mbps up"}
                  </span>
                </>
              )}
              {phase === "done" && result && (
                <>
                  <span className="text-3xl font-extrabold tabular-nums text-foreground">
                    {result.downloadMbps}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">Mbps down</span>
                </>
              )}
            </div>
          </div>

          {phase === "idle" && (
            <Button size="lg" onClick={handleRun} className="min-w-48">
              Run Speed Test
            </Button>
          )}
          {isTesting && (
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
              <Radar className="size-4 animate-pulse" />
              {phase === "download" ? "Testing download…" : "Testing upload…"}
            </p>
          )}
          {phase === "done" && result && (
            <>
              <div className="grid w-full grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-surface-alt py-3">
                  <ArrowDownToLine className="mx-auto mb-1 size-4 text-teal-600" />
                  <p className="text-lg font-bold text-foreground">{result.downloadMbps}</p>
                  <p className="text-[11px] text-muted-foreground">Mbps down</p>
                </div>
                <div className="rounded-xl bg-surface-alt py-3">
                  <ArrowUpFromLine className="mx-auto mb-1 size-4 text-teal-600" />
                  <p className="text-lg font-bold text-foreground">{result.uploadMbps}</p>
                  <p className="text-[11px] text-muted-foreground">Mbps up</p>
                </div>
                <div className="rounded-xl bg-surface-alt py-3">
                  <Timer className="mx-auto mb-1 size-4 text-teal-600" />
                  <p className="text-lg font-bold text-foreground">{result.latencyMs} ms</p>
                  <p className="text-[11px] text-muted-foreground">Latency</p>
                </div>
              </div>
              <p className={cn("text-sm font-bold", qualityColor[result.quality])}>
                Connection Quality: {result.quality}
              </p>
              <Button variant="outline" onClick={handleRun}>
                Test again
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
