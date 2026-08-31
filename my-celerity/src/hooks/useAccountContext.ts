"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getAccountContext } from "@/lib/api";
import type { Account, Property, Unit } from "@/types";

interface AccountContextData {
  account: Account;
  property: Property;
  unit: Unit;
}

/** Loads account/property/unit for the currently active account, and
 * automatically re-fetches when the user switches accounts. */
export function useAccountContext() {
  const { activeAccountId } = useAuth();
  const [data, setData] = useState<AccountContextData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getAccountContext(activeAccountId).then((result) => {
      if (!cancelled) {
        setData(result);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeAccountId]);

  return { ...data, isLoading, accountId: activeAccountId } as {
    account?: Account;
    property?: Property;
    unit?: Unit;
    isLoading: boolean;
    accountId: string;
  };
}
