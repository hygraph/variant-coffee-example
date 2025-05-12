import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mergeVariant(
  data: Record<string, any>,
  variant: Record<string, any>,
): Record<string, any> {
  return {
    ...data,
    ...variant,
  };
}

export function applyVariant(
  data: Record<string, any> & { variants: Record<string, any>[] },
) {
  return mergeVariant(data, data.variants[0]);
}
