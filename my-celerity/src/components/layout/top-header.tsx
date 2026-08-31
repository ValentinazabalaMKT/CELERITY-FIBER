"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LifeBuoy, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "./notification-bell";
import { AccountSwitcher } from "./account-switcher";

export function TopHeader() {
  const { customer, logout } = useAuth();
  const router = useRouter();

  if (!customer) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:px-8 lg:py-4">
      <Link href="/dashboard" className="flex items-center lg:hidden">
        <Image src="/brand/celerity-logo.png" alt="Celerity Fiber" width={116} height={32} priority />
      </Link>

      <div className="hidden flex-1 lg:block" />

      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <div className="hidden w-64 sm:block lg:hidden">
          <AccountSwitcher collapsedLabel />
        </div>
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full pl-1 pr-1 transition-colors hover:bg-muted lg:pr-2.5">
              <Avatar>
                <AvatarFallback>{initials(customer.firstName, customer.lastName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-semibold text-foreground lg:inline">
                {customer.firstName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-semibold text-foreground">
                {customer.firstName} {customer.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="size-4 text-muted-foreground" /> My Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="size-4 text-muted-foreground" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support">
                <LifeBuoy className="size-4 text-muted-foreground" /> Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout} className="text-danger data-[highlighted]:bg-danger-bg">
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
