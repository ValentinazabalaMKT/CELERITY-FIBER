import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchContextValue {
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [globalSearch, setGlobalSearch] = useState("");
  return <SearchContext.Provider value={{ globalSearch, setGlobalSearch }}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
