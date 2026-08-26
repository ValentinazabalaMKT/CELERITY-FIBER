import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names and resolves conflicting Tailwind utilities
 * (e.g. a component's default `h-10` vs. a caller-supplied `h-8`) so the last
 * one specified always wins, regardless of Tailwind's internal generation order.
 */
export function cn(...values: ClassValue[]): string {
  return twMerge(clsx(...values));
}
