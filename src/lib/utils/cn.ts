import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge.
 * Handles conflicting classes gracefully.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
