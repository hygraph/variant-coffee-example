/**
 * Dynamic Yield Client-Side Event Utilities
 *
 * Use these functions to send events to Dynamic Yield from client components.
 * All functions safely check if DY is loaded before attempting to send events.
 */

import "@/dy/types"; // Import for side effects (global Window type augmentation)

/**
 * Check if Dynamic Yield is loaded and ready
 */
export function isDYReady(): boolean {
  return typeof window !== "undefined" && !!window.DY?.API;
}

/**
 * Send a generic event to Dynamic Yield
 *
 * @param eventName - Name of the event
 * @param properties - Optional event properties
 * @returns boolean indicating if the event was sent
 *
 * @example
 * ```ts
 * sendDYEvent("Newsletter Signup", { email: "user@example.com" });
 * ```
 */
export function sendDYEvent(
  eventName: string,
  properties?: Record<string, unknown>
): boolean {
  if (!isDYReady()) {
    console.warn(`DY not ready, event "${eventName}" not sent`);
    return false;
  }

  try {
    window.DY!.API("event", {
      name: eventName,
      properties,
    });
    return true;
  } catch (error) {
    console.error("Error sending DY event:", error);
    return false;
  }
}

/**
 * Track "Add to Cart" event
 *
 * @param productId - The product SKU/ID
 * @param value - The product price
 * @param quantity - Number of items added
 * @param currency - Currency code (default: "USD")
 *
 * @example
 * ```ts
 * trackAddToCart("coffee-123", 19.99, 2, "USD");
 * ```
 */
export function trackAddToCart(
  productId: string,
  value: number,
  quantity: number = 1,
  currency: string = "USD"
): boolean {
  return sendDYEvent("Add to Cart", {
    productId,
    value,
    quantity,
    currency,
  });
}

/**
 * Track product view event
 *
 * @param productId - The product SKU/ID
 * @param productName - Optional product name
 *
 * @example
 * ```ts
 * trackProductView("coffee-123", "Ethiopian Yirgacheffe");
 * ```
 */
export function trackProductView(
  productId: string,
  productName?: string
): boolean {
  return sendDYEvent("Product View", {
    productId,
    productName,
  });
}

/**
 * Track purchase/conversion event
 *
 * @param orderId - The order ID
 * @param value - Total order value
 * @param currency - Currency code
 * @param products - Array of product IDs in the order
 *
 * @example
 * ```ts
 * trackPurchase("order-456", 49.99, "USD", ["coffee-123", "coffee-456"]);
 * ```
 */
export function trackPurchase(
  orderId: string,
  value: number,
  currency: string = "USD",
  products?: string[]
): boolean {
  return sendDYEvent("Purchase", {
    orderId,
    value,
    currency,
    products,
  });
}

/**
 * Track newsletter signup
 *
 * @param email - User's email address
 *
 * @example
 * ```ts
 * trackNewsletterSignup("user@example.com");
 * ```
 */
export function trackNewsletterSignup(email?: string): boolean {
  return sendDYEvent("Newsletter Signup", {
    email,
  });
}

/**
 * Track search event
 *
 * @param query - The search query
 * @param resultsCount - Number of results returned
 *
 * @example
 * ```ts
 * trackSearch("ethiopian coffee", 12);
 * ```
 */
export function trackSearch(query: string, resultsCount?: number): boolean {
  return sendDYEvent("Keyword Search", {
    query,
    resultsCount,
  });
}

/**
 * Set user identification context
 *
 * @param userId - User's unique ID
 * @param email - User's email
 * @param additionalData - Any additional user properties
 *
 * @example
 * ```ts
 * setDYUserContext("user-123", "user@example.com", { tier: "premium" });
 * ```
 */
export function setDYUserContext(
  userId?: string,
  email?: string,
  additionalData?: Record<string, unknown>
): boolean {
  if (!isDYReady()) {
    console.warn("DY not ready, user context not set");
    return false;
  }

  try {
    window.DY!.API("setContext", {
      user: {
        userId,
        email,
        ...additionalData,
      },
    });
    return true;
  } catch (error) {
    console.error("Error setting DY user context:", error);
    return false;
  }
}

/**
 * Grant or revoke user consent for Dynamic Yield tracking
 *
 * When consent is granted, DY will set persistent cookies (_dyid)
 * for cross-session user identification.
 *
 * @param consent - true to grant consent, false to revoke
 * @returns boolean indicating if consent was set
 *
 * @example
 * ```ts
 * // When user accepts cookies
 * grantDYConsent(true);
 *
 * // When user declines or revokes consent
 * grantDYConsent(false);
 * ```
 */
export function grantDYConsent(consent: boolean): boolean {
  if (!isDYReady()) {
    console.warn("DY not ready, consent not set");
    return false;
  }

  try {
    window.DY!.API("consent", { consent });
    return true;
  } catch (error) {
    console.error("Error setting DY consent:", error);
    return false;
  }
}

