/**
 * Dynamic Yield Backend Decisions API
 *
 * Server-side integration for getting DY decisions using pageAttributes targeting.
 * Used for server-rendered personalization (e.g., landing page A/B testing).
 *
 * Note: Realtime filtering does NOT work with variants. Instead, we use pageAttributes
 * to target specific DY experiences per landing page.
 */

export interface DYContext {
  user: {
    dyid: string;
    dyid_server: string;
  };
  session: {
    dy: string;
  };
  context: {
    page: {
      type: string;
      data: string[];
      location: string;
      locale: string;
    };
    pageAttributes?: Record<string, string>;
    device: {
      ip: string;
      userAgent: string;
    };
  };
}

export interface DYSelector {
  names: string[];
}

interface DYChooseResponse {
  choices: Array<{
    id: number;
    name: string;
    type: string;
    variations: Array<{
      id: number;
      payload: {
        type: string;
        data: Record<string, unknown>;
      };
    }>;
    decisionId: string;
  }>;
  cookies: Array<{
    name: string;
    value: string;
    maxAge: string;
  }>;
  warnings?: Array<{
    code: string;
    message: string;
  }>;
}

/**
 * Get a backend decision from Dynamic Yield using pageAttributes targeting.
 *
 * Returns the payload data from the first variation, or null if no decision.
 *
 * Note: Each landing page needs its own DY experience targeting via pageAttributes.
 * The DY experience should have a "Who?" targeting rule like:
 *   Custom Attribute "landing-slug" is "summer-sale-2026"
 *
 * @example
 * ```ts
 * interface LandingPagePayload {
 *   variantId: string;
 * }
 *
 * // Build context with pageAttributes for targeting
 * const dyCtx = await buildDYContext({
 *   pagePath: `/landing-hybrid/${slug}`,
 *   pageAttributes: { "landing-slug": slug }
 * });
 *
 * const payload = await getDYBackendDecision<LandingPagePayload>(dyCtx, {
 *   names: ["summer-cold-brew-festival-2026"] // One experience per landing page
 * });
 *
 * const variantId = payload?.variantId;
 * ```
 */
export async function getDYBackendDecision<T = Record<string, unknown>>(
  dyCtx: DYContext,
  selector: DYSelector
): Promise<T | null> {
  const apiKey = process.env.DY_API_KEY;

  if (!apiKey) {
    console.warn("DY_API_KEY not set, returning null");
    return null;
  }

  const requestBody = {
    ...dyCtx,
    selector,
  };

  try {
    const response = await fetch("https://dy-api.com/v2/serve/user/choose", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "dy-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });
    console.debug(
      "DY backend decision request body:",
      JSON.stringify(requestBody, null, 2)
    );

    if (!response.ok) {
      console.error(`DY API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: DYChooseResponse = await response.json();

    if (data.warnings?.length) {
      console.warn("DY API warnings:", data.warnings);
    }

    // Extract the first choice and variation
    const choice = data.choices?.[0];
    const variation = choice?.variations?.[0];

    if (!choice || !variation) {
      console.debug(
        "No DY decision returned for selector:",
        selector.names.join(", ")
      );
      return null;
    }

    return (variation.payload?.data as T) || null;
  } catch (error) {
    console.error("DY Backend Decision error:", error);
    return null;
  }
}
