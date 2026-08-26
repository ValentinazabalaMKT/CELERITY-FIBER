import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday as dfIsToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { enUS, es as esLocale } from "date-fns/locale";
import type { Language } from "../shared/types";

const LOCALES = { en: enUS, es: esLocale };

export function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDate(dateIso: string | null, locale: Language, style: "short" | "long" | "weekday" = "short"): string {
  if (!dateIso) return "";
  const date = parseISO(dateIso);
  const loc = LOCALES[locale];
  if (style === "long") return format(date, "MMMM d, yyyy", { locale: loc });
  if (style === "weekday") return format(date, "EEEE, MMMM d", { locale: loc });
  return format(date, "MMM d, yyyy", { locale: loc });
}

export function formatMonthYear(date: Date, locale: Language): string {
  return format(date, "MMMM yyyy", { locale: LOCALES[locale] });
}

export function formatMonthShort(date: Date, locale: Language): string {
  return format(date, "MMM", { locale: LOCALES[locale] });
}

export function formatMonthFull(date: Date, locale: Language): string {
  return format(date, "MMMM", { locale: LOCALES[locale] });
}

export function formatWeekdayShort(date: Date, locale: Language): string {
  return format(date, "EEE", { locale: LOCALES[locale] });
}

export function formatDayNumber(date: Date): string {
  return format(date, "d");
}

/** Full 6-row calendar grid for a month view, including leading/trailing days. */
export function getMonthGrid(monthDate: Date, weekStartsOn: 0 | 1): Date[][] {
  const firstOfMonth = startOfMonth(monthDate);
  const lastOfMonth = endOfMonth(monthDate);
  const gridStart = startOfWeek(firstOfMonth, { weekStartsOn });
  const gridEnd = endOfWeek(lastOfMonth, { weekStartsOn });

  const weeks: Date[][] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function getWeekDays(anyDayInWeek: Date, weekStartsOn: 0 | 1): Date[] {
  const start = startOfWeek(anyDayInWeek, { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export { addDays, endOfMonth, endOfWeek, isSameDay, isSameMonth, dfIsToday as isToday, parseISO, startOfMonth, startOfWeek };
