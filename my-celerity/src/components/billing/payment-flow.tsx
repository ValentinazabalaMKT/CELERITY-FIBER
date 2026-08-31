"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, ChevronLeft, CreditCard, Download, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { getPaymentMethods, makePayment } from "@/lib/api";
import type { Invoice, Payment, PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";

type Step = "amount" | "method" | "review" | "processing" | "success";

interface PaymentFlowProps {
  accountId: string;
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (payment: Payment) => void;
}

export function PaymentFlow({ accountId, invoice, open, onOpenChange, onSuccess }: PaymentFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState(invoice?.total ?? 0);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [methodId, setMethodId] = useState<string | undefined>();
  const [payment, setPayment] = useState<Payment | null>(null);

  // Tracks the latest `invoice` prop without making the reset-on-open
  // effect below re-fire when a payment success handler updates the
  // invoice's status while this dialog is still open.
  const invoiceRef = useRef(invoice);
  useEffect(() => {
    invoiceRef.current = invoice;
  }, [invoice]);

  useEffect(() => {
    if (!open) return;
    setStep("amount");
    setAmount(invoiceRef.current?.total ?? 0);
    setPayment(null);
    getPaymentMethods(accountId).then((list) => {
      setMethods(list);
      setMethodId(list.find((m) => m.isDefault)?.id ?? list[0]?.id);
    });
  }, [open, accountId]);

  async function handleConfirm() {
    setStep("processing");
    try {
      const result = await makePayment({
        accountId,
        invoiceId: invoice?.id,
        amount,
        paymentMethodId: methodId!,
      });
      setPayment(result);
      setStep("success");
      onSuccess?.(result);
    } catch {
      onOpenChange(false);
    }
  }

  const selectedMethod = methods.find((m) => m.id === methodId);

  return (
    <Dialog open={open} onOpenChange={(v) => (step !== "processing" ? onOpenChange(v) : null)}>
      <DialogContent showClose={step !== "processing"}>
        {step === "amount" && (
          <>
            <DialogHeader>
              <DialogTitle>Payment amount</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-2xl bg-brand-50 px-5 py-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700/70">Amount to pay</p>
                <p className="mt-1 text-4xl font-extrabold text-brand-700">{formatCurrency(amount)}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount">Or enter a custom amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <Button className="w-full" size="lg" disabled={amount <= 0} onClick={() => setStep("method")}>
                Continue
              </Button>
            </div>
          </>
        )}

        {step === "method" && (
          <>
            <DialogHeader>
              <button
                onClick={() => setStep("amount")}
                className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-3.5" /> Back
              </button>
              <DialogTitle>Select payment method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <RadioGroup value={methodId} onValueChange={setMethodId} className="space-y-2.5">
                {methods.map((m) => (
                  <label
                    key={m.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                      methodId === m.id ? "border-brand-700 bg-brand-50" : "border-border hover:bg-muted"
                    )}
                  >
                    <RadioGroupItem value={m.id} />
                    <span className="flex size-9 items-center justify-center rounded-lg bg-card text-foreground shadow-soft">
                      {m.type === "bank_account" ? <Building2 className="size-4" /> : <CreditCard className="size-4" />}
                    </span>
                    <span className="flex-1 text-sm">
                      <span className="block font-semibold text-foreground">
                        {m.brand ?? "Bank account"} •••• {m.last4}
                      </span>
                      {m.expiry && <span className="text-xs text-muted-foreground">Expires {m.expiry}</span>}
                    </span>
                    {m.isDefault && <span className="text-[11px] font-semibold text-brand-700">Default</span>}
                  </label>
                ))}
              </RadioGroup>
              <button
                type="button"
                disabled
                title="Add a new payment method (coming soon in this demo)"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground/70"
              >
                + Add payment method
              </button>
              <Button className="w-full" size="lg" disabled={!methodId} onClick={() => setStep("review")}>
                Continue
              </Button>
            </div>
          </>
        )}

        {step === "review" && (
          <>
            <DialogHeader>
              <button
                onClick={() => setStep("method")}
                className="mb-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="size-3.5" /> Back
              </button>
              <DialogTitle>Review payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3 rounded-2xl border border-border p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-foreground">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment method</span>
                  <span className="font-semibold text-foreground">
                    {selectedMethod?.brand ?? "Bank account"} •••• {selectedMethod?.last4}
                  </span>
                </div>
                {invoice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-semibold text-foreground">
                      {formatShortDate(invoice.periodStart)} – {formatShortDate(invoice.periodEnd)}
                    </span>
                  </div>
                )}
              </div>
              <Button className="w-full" size="lg" onClick={handleConfirm}>
                Confirm Payment
              </Button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <Loader2 className="size-10 animate-spin text-brand-700" />
            <p className="text-sm font-semibold text-foreground">Processing your payment…</p>
            <p className="text-xs text-muted-foreground">This will only take a moment.</p>
          </div>
        )}

        {step === "success" && payment && (
          <div className="flex flex-col items-center gap-1 py-4 text-center">
            <span className="mb-3 flex size-16 items-center justify-center rounded-full bg-success-bg text-success">
              <CheckCircle2 className="size-9" />
            </span>
            <p className="text-sm font-semibold text-success">Payment successful</p>
            <p className="mt-1 text-4xl font-extrabold text-foreground">{formatCurrency(payment.amount)}</p>
            <p className="mt-3 text-sm text-muted-foreground">Confirmation</p>
            <p className="text-sm font-semibold tracking-wide text-foreground">{payment.confirmationCode}</p>

            <div className="mt-7 flex w-full flex-col gap-2.5">
              <Button variant="outline" className="w-full gap-2">
                <Download className="size-4" /> View receipt
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  onOpenChange(false);
                  router.push("/dashboard");
                }}
              >
                Back Home
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
