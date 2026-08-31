"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Paperclip } from "lucide-react";
import { createTicket } from "@/lib/api";
import { ticketCategoryLabels } from "@/data/mockSupport";
import type { SupportTicket, TicketCategory, TicketPriority } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const priorities: TicketPriority[] = ["low", "medium", "high", "urgent"];

export function CreateTicketDialog({
  accountId,
  open,
  defaultCategory,
  onOpenChange,
  onCreated,
}: {
  accountId: string;
  open: boolean;
  defaultCategory?: TicketCategory;
  onOpenChange: (open: boolean) => void;
  onCreated?: (ticket: SupportTicket) => void;
}) {
  const [category, setCategory] = useState<TicketCategory>(defaultCategory ?? "other");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<SupportTicket | null>(null);

  useEffect(() => {
    if (open) {
      setCategory(defaultCategory ?? "other");
      setSubject("");
      setDescription("");
      setPriority("medium");
      setCreated(null);
    }
  }, [open, defaultCategory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ticket = await createTicket({ accountId, category, subject, description, priority });
    setSubmitting(false);
    setCreated(ticket);
    onCreated?.(ticket);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {!created ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Support Request</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ticketCategoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Tell us what's happening…"
                  className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                disabled
                title="Attach a file (coming soon in this demo)"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs font-semibold text-muted-foreground/70"
              >
                <Paperclip className="size-3.5" /> Attach a file (optional)
              </button>
              <Button type="submit" className="w-full" size="lg" loading={submitting}>
                Submit Request
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <span className="mb-2 flex size-16 items-center justify-center rounded-full bg-success-bg text-success">
              <CheckCircle2 className="size-9" />
            </span>
            <p className="text-2xl font-extrabold text-foreground">Ticket #{created.id}</p>
            <p className="text-sm font-semibold text-success">Status: Open</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              We&apos;ll follow up by email. You can track progress anytime from the Support page.
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
