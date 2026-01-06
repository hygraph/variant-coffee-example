import { cookies } from "next/headers";
import { DYContext } from "./backend-decisions";

export type DYPageType =
  | "HOMEPAGE"
  | "CATEGORY"
  | "PRODUCT"
  | "CART"
  | "POST"
  | "SEARCH"
  | "OTHER";

export interface BuildDYContextOptions {
  pagePath: string;
  pageType?: DYPageType;
  pageData?: string[];
  pageAttributes?: Record<string, string>;
  locale?: string;
}

/**
 * Build DY context from cookies and page options.
 * Use this in server components to create a DY context for backend API calls.
 *
 * @example
 * ```ts
 * // For landing page with targeting via pageAttributes
 * const dyCtx = await buildDYContext({
 *   pagePath: `/landing-hybrid/${slug}`,
 *   pageAttributes: { "landing-slug": slug }
 * });
 * ```
 */
export async function buildDYContext(
  options: BuildDYContextOptions
): Promise<DYContext> {
  const cookieStore = await cookies();

  const dyid =
    cookieStore.get("_dyid")?.value || "00000000-0000-0000-0000-000000000000";
  const dyidServer = cookieStore.get("_dyid_server")?.value || dyid;
  const dySession = cookieStore.get("_dyjsession")?.value || dyid;

  return {
    user: {
      dyid,
      dyid_server: dyidServer,
    },
    session: {
      dy: dySession,
    },
    context: {
      page: {
        type: options.pageType || "OTHER",
        data: options.pageData || [],
        location: options.pagePath,
        locale: options.locale || "en_US",
      },
      ...(options.pageAttributes && { pageAttributes: options.pageAttributes }),
      device: {
        ip: "8.8.4.4",
        userAgent: "Mozilla/5.0 (compatible; Server-Side/1.0)",
      },
    },
  };
}

