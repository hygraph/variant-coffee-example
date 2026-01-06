"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { DYPageContext } from "@/dy/types";

interface DynamicYieldProviderProps {
  children: React.ReactNode;
}

/**
 * Determines the page type based on the pathname
 */
function getPageType(pathname: string): DYPageContext["type"] {
  if (pathname === "/") return "HOMEPAGE";
  if (pathname.startsWith("/beans/") && pathname !== "/beans") return "PRODUCT";
  if (pathname === "/beans") return "CATEGORY";
  if (pathname.startsWith("/articles/") && pathname !== "/articles")
    return "POST";
  if (pathname === "/articles") return "CATEGORY";
  if (pathname.includes("/search")) return "SEARCH";
  if (pathname.includes("/cart")) return "CART";
  return "OTHER";
}

/**
 * Extracts product/category data from pathname
 */
function getPageData(pathname: string): string[] {
  // Extract slug from product pages
  if (pathname.startsWith("/beans/")) {
    const slug = pathname.replace("/beans/", "");
    return slug ? [slug] : [];
  }
  // Extract article id from article pages
  if (pathname.startsWith("/articles/")) {
    const id = pathname.replace("/articles/", "");
    return id ? [id] : [];
  }
  return [];
}

/**
 * Inner component that uses useSearchParams (requires Suspense)
 */
function DynamicYieldTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (typeof window !== "undefined" && window.DY) {
      console.log("spa ispageview");

      const fullPath = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      console.log("spa path", {
        isPageView: true,
        path: fullPath,
        title: document.title,
        context: {
          type: getPageType(pathname),
          data: getPageData(pathname),
        },
      });
      window.DY.API("spa", {
        isPageView: true,
        path: fullPath,
        title: document.title,
        context: {
          type: getPageType(pathname),
          data: getPageData(pathname),
        },
      });
      window.DY.recommendationContext = {
        type: getPageType(pathname),
        data: getPageData(pathname),
      };
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Provider component that tracks SPA navigation for Dynamic Yield
 *
 * Wrap your app with this provider to automatically track page views
 * when using Next.js client-side navigation.
 *
 * @example
 * ```tsx
 * <DynamicYieldProvider>
 *   <Header />
 *   {children}
 *   <Footer />
 * </DynamicYieldProvider>
 * ```
 */
export function DynamicYieldProvider({ children }: DynamicYieldProviderProps) {
  return (
    <>
      <Suspense fallback={null}>
        <DynamicYieldTracker />
      </Suspense>
      {children}
    </>
  );
}
