"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { desktopSecondaryNav, primaryNav } from "@/lib/nav";
import { AccountSwitcher } from "./account-switcher";

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const items = [...primaryNav.filter((i) => i.href !== "/profile"), ...desktopSecondaryNav];

  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r border-border bg-card px-4 py-5 lg:flex">
      <Link href="/dashboard" className="mb-6 flex items-center px-2">
        <Image src="/brand/celerity-logo.png" alt="Celerity Fiber" width={148} height={40} priority />
      </Link>

      <AccountSwitcher />

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-[18px]" strokeWidth={2.25} />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-2 h-px bg-border" />

        <Link
          href="/notifications"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            pathname === "/notifications"
              ? "bg-brand-50 text-brand-700"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Bell className="size-[18px]" strokeWidth={2.25} />
          Notifications
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            pathname === "/settings"
              ? "bg-brand-50 text-brand-700"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="size-[18px]" strokeWidth={2.25} />
          Settings
        </Link>
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-danger-bg hover:text-danger"
      >
        <LogOut className="size-[18px]" strokeWidth={2.25} />
        Log out
      </button>
    </aside>
  );
}
