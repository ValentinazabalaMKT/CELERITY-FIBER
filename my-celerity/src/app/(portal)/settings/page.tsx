"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Mail, MessageSquare, Receipt, Shield, ShieldAlert, Smartphone, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getCommunicationPreferences, updateCommunicationPreferences } from "@/lib/api";
import type { CommunicationPreferences } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const channelMeta = [
  { key: "email" as const, label: "Email", icon: Mail },
  { key: "sms" as const, label: "SMS", icon: MessageSquare },
  { key: "push" as const, label: "Push notifications", icon: Smartphone },
];

const topicMeta = [
  { key: "bills" as const, label: "Bills" },
  { key: "paymentConfirmations" as const, label: "Payment confirmations" },
  { key: "serviceInterruptions" as const, label: "Service interruptions" },
  { key: "maintenance" as const, label: "Maintenance" },
  { key: "promotions" as const, label: "Promotions" },
  { key: "supportUpdates" as const, label: "Support updates" },
];

export default function SettingsPage() {
  const { customer, activeAccountId, logout } = useAuth();
  const router = useRouter();
  const [prefs, setPrefs] = useState<CommunicationPreferences | null>(null);
  const [paperless, setPaperless] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCommunicationPreferences(activeAccountId).then((data) => {
      if (!cancelled) setPrefs(data);
    });
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  function updateChannel(key: keyof CommunicationPreferences["channels"], value: boolean) {
    if (!prefs) return;
    const next = { ...prefs, channels: { ...prefs.channels, [key]: value } };
    setPrefs(next);
    updateCommunicationPreferences(activeAccountId, next);
  }

  function updateTopic(key: keyof CommunicationPreferences["topics"], value: boolean) {
    if (!prefs) return;
    const next = { ...prefs, topics: { ...prefs.topics, [key]: value } };
    setPrefs(next);
    updateCommunicationPreferences(activeAccountId, next);
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (!customer) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account, security and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <p className="font-semibold text-foreground">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href="/profile">Edit profile</a>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <KeyRound className="size-4" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Password</p>
                <p className="text-muted-foreground">Last changed 3 months ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Change
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ShieldAlert className="size-4" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Two-factor authentication</p>
                <p className="text-muted-foreground">Coming soon</p>
              </div>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how and when we reach you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!prefs ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {channelMeta.map((c) => (
                  <label
                    key={c.key}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border px-3.5 py-3"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <c.icon className="size-4 text-muted-foreground" /> {c.label}
                    </span>
                    <Switch
                      checked={prefs.channels[c.key]}
                      onCheckedChange={(v) => updateChannel(c.key, v)}
                    />
                  </label>
                ))}
              </div>
              <Separator />
              <div className="space-y-1">
                {topicMeta.map((t) => (
                  <div key={t.key} className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">{t.label}</span>
                    <Switch checked={prefs.topics[t.key]} onCheckedChange={(v) => updateTopic(t.key, v)} />
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Receipt className="size-4" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Paperless billing</p>
                <p className="text-muted-foreground">Get your bill by email instead of mail</p>
              </div>
            </div>
            <Switch checked={paperless} onCheckedChange={setPaperless} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Shield className="size-4" />
              </span>
              <p className="text-muted-foreground">Download a copy of your account data</p>
            </div>
            <Button variant="outline" size="sm">
              Request
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex size-9 items-center justify-center rounded-full bg-danger-bg text-danger">
                <Trash2 className="size-4" />
              </span>
              <p className="text-muted-foreground">Close my account</p>
            </div>
            <Button variant="outline" size="sm" className="border-danger/30 text-danger hover:bg-danger-bg">
              Contact support
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button variant="danger" className="w-full gap-2 sm:w-auto" onClick={handleLogout}>
        <LogOut className="size-4" /> Log out
      </Button>
    </div>
  );
}
