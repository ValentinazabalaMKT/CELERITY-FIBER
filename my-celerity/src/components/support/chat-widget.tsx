"use client";

import { useState } from "react";
import { Bot, Headset, MessageCircle, Send, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const channels = [
  { value: "live", label: "Live Chat", icon: MessageCircle },
  { value: "ai", label: "AI Assistant", icon: Bot },
  { value: "agent", label: "Support Agent", icon: Headset },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with Celerity"
        className="fixed bottom-24 right-5 z-40 flex h-14 items-center gap-2.5 rounded-full px-5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(88,44,131,0.35)] brand-gradient transition-transform hover:scale-[1.03] active:scale-[0.97] lg:bottom-7"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
        <span className="hidden sm:inline">{open ? "Close" : "Chat with Celerity"}</span>
      </button>

      {open && (
        <div className="fixed bottom-[9.5rem] right-5 z-40 flex h-[28rem] w-[calc(100%-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card-hover animate-slide-up lg:bottom-24">
          <div className="brand-gradient px-4 py-3.5 text-white">
            <p className="text-sm font-bold">Chat with Celerity</p>
            <p className="text-xs text-white/70">Typically replies in a few minutes</p>
          </div>

          <Tabs defaultValue="live" className="flex flex-1 flex-col">
            <TabsList className="m-2">
              {channels.map((c) => (
                <TabsTrigger key={c.value} value={c.value} className="flex-1 gap-1.5 text-xs">
                  <c.icon className="size-3.5" /> {c.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {channels.map((c) => (
              <TabsContent key={c.value} value={c.value} className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 space-y-3 overflow-y-auto px-4 py-2">
                  <ChatBubble
                    from="them"
                    text={
                      c.value === "ai"
                        ? "Hi Michael! I'm the Celerity AI Assistant. Ask me about your bill, your speed, or an outage."
                        : c.value === "agent"
                          ? "Hi Michael, this is Celerity Support — how can we help today?"
                          : "You're connected to Celerity live chat. A specialist will be with you shortly."
                    }
                  />
                </div>
                <div className="flex items-center gap-2 border-t border-border p-3">
                  <input
                    type="text"
                    placeholder="Type a message…"
                    disabled
                    className="h-10 flex-1 rounded-full border border-input bg-surface-alt px-4 text-sm text-muted-foreground placeholder:text-muted-foreground/70"
                  />
                  <button
                    disabled
                    title="Messaging is a UI preview in this demo"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </>
  );
}

function ChatBubble({ from, text }: { from: "me" | "them"; text: string }) {
  return (
    <div className={cn("flex items-end gap-2", from === "me" && "flex-row-reverse")}>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <User className="size-3" />
      </span>
      <p
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
          from === "me" ? "bg-brand-700 text-white" : "bg-muted text-foreground"
        )}
      >
        {text}
      </p>
    </div>
  );
}
