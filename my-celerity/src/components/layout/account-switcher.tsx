"use client";

import { Building2, Check, ChevronsUpDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { mockProperties, mockUnits } from "@/data/mockCustomer";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusMeta } from "@/lib/status-meta";

export function AccountSwitcher({ collapsedLabel = false }: { collapsedLabel?: boolean }) {
  const { customer, activeAccountId, setActiveAccountId } = useAuth();
  if (!customer) return null;

  const activeAccount = customer.accounts.find((a) => a.id === activeAccountId) ?? customer.accounts[0];
  const activeProperty = mockProperties.find((p) => p.id === activeAccount.propertyId);
  const activeUnit = mockUnits.find((u) => u.id === activeAccount.unitId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Building2 className="size-4" />
          </span>
          {!collapsedLabel && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {activeAccount.label}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {activeProperty?.name} · Unit {activeUnit?.unitNumber}
              </span>
            </span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Your accounts</DropdownMenuLabel>
        {customer.accounts.map((account) => {
          const property = mockProperties.find((p) => p.id === account.propertyId);
          const unit = mockUnits.find((u) => u.id === account.unitId);
          const meta = statusMeta[account.status];
          const isActive = account.id === activeAccountId;
          return (
            <DropdownMenuItem
              key={account.id}
              onSelect={() => setActiveAccountId(account.id)}
              className="flex-col items-start gap-1 py-2.5"
            >
              <span className="flex w-full items-center gap-2">
                <span className="flex-1 truncate font-semibold">{account.label}</span>
                {isActive && <Check className="size-4 text-brand-700" />}
              </span>
              <span className="text-xs text-muted-foreground">
                {property?.name} · Unit {unit?.unitNumber}
              </span>
              <span className={cn("mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold", meta.badgeClass)}>
                <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
                {meta.label}
              </span>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <p className="px-3 py-2 text-xs text-muted-foreground">
          Need to add another property? <span className="font-semibold text-brand-700">Contact support.</span>
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
