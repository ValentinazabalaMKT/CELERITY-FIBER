"use client";

import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useAccountContext } from "@/hooks/useAccountContext";
import { initials } from "@/lib/utils";
import { statusMeta } from "@/lib/status-meta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { customer } = useAuth();
  const { account, property, unit, isLoading } = useAccountContext();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [saved, setSaved] = useState(false);

  if (!customer) return null;

  function handleSave() {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your profile, property and account details.</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-5 sm:pt-6">
          <Avatar className="size-16">
            <AvatarFallback className="text-xl">{initials(customer.firstName, customer.lastName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-lg font-bold text-foreground">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
          {account && (
            <Badge variant={account.status === "active" ? "success" : "warning"} dot>
              {statusMeta[account.status].label}
            </Badge>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Contact Information</CardTitle>
            {!editing ? (
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
                <Pencil className="size-3.5" /> Edit
              </Button>
            ) : (
              <Button size="sm" className="gap-1.5" onClick={handleSave}>
                <Check className="size-3.5" /> Save
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {saved && (
              <p className="rounded-lg bg-success-bg px-3 py-2 text-xs font-semibold text-success">
                Contact information updated.
              </p>
            )}
            {editing ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Changes to contact info are confirmed by email before taking effect.
                </p>
              </>
            ) : (
              <>
                <InfoRow label="Email" value={email} />
                <InfoRow label="Phone" value={phone} />
                <InfoRow label="Preferred language" value={customer.preferredLanguage} />
                <InfoRow label="Billing address" value={customer.billingAddress} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property & Account</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !account || !property || !unit ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <>
                <InfoRow label="Account number" value={account.accountNumber} />
                <InfoRow label="Property" value={property.name} />
                <InfoRow label="Unit" value={unit.unitNumber} />
                <InfoRow
                  label="Installation address"
                  value={`${property.address}, ${property.city}, ${property.state} ${property.zip}`}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
