import { clsx, type ClassValue } from "clsx";
import { cookies } from "next/headers";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mergeVariant<T extends Record<string, any>>(
  data: T,
  variant: Partial<T>
): T {
  return {
    ...data,
    ...variant,
  };
}

export function applyVariant<
  T extends Record<string, any> & { variants: Array<Partial<T>> }
>(data: T): T {
  return mergeVariant(data, data.variants[0]);
}

export async function getSegment(
  searchParams: Promise<{ segment?: string }>
): Promise<string | undefined> {
  const { segment } = await searchParams;
  const cookieStore = await cookies();
  const cookieSegment = cookieStore.get("segment");
  return segment || cookieSegment?.value;
}

export async function getVariantId(
  searchParams: Promise<{ variant?: string }>
): Promise<string | undefined> {
  const { variant } = await searchParams;
  const cookieStore = await cookies();
  return variant;
}
