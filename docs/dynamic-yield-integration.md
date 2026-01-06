# Dynamic Yield + Hygraph Variants Integration

This document covers the integration between Dynamic Yield (DY) and Hygraph content variants in the Coffee Roaster homepage project.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Integration Architecture                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     Sync Scripts      ┌──────────────┐
│              │  ─────────────────►  │              │
│   Hygraph    │   Products, Variants  │ Dynamic Yield│
│    (CMS)     │   Segments            │    (DY)      │
│              │  ◄─────────────────  │              │
└──────────────┘   Backend Decisions   └──────────────┘
       │                                      │
       │ GraphQL                              │ Client JS / API
       ▼                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Server Render   │  │ Client Tracking │  │ DY Experiences  │  │
│  │ (Variants)      │  │ (SPA, Events)   │  │ (Banners, Recs) │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Integration Patterns

| Pattern | Direction | Purpose |
|---------|-----------|---------|
| **Product Feed Sync** | Hygraph → DY | Enable product recommendations |
| **Variation Feed Sync** | Hygraph → DY | A/B testing with CMS-managed content |
| **Segment Sync** | Hygraph → DY | Affinity-based targeting |
| **Client-Side Integration** | DY → Browser | Page tracking, events, experiences |
| **Backend Decisions** | DY API → App | Server-side personalization |

---

## General Setup: Client-Side Script

### Script Inclusion

Dynamic Yield scripts are loaded in `app/layout.tsx`:

```tsx
// app/layout.tsx
const DY_SECTION_ID = process.env.NEXT_PUBLIC_DY_SECTION_ID;

<head>
  {DY_SECTION_ID && (
    <>
      <Script
        id="dy-api-dynamic"
        src={`https://cdn.dynamicyield.com/api/${DY_SECTION_ID}/api_dynamic.js`}
        strategy="beforeInteractive"
      />
      <Script
        id="dy-api-static"
        src={`https://cdn.dynamicyield.com/api/${DY_SECTION_ID}/api_static.js`}
        strategy="beforeInteractive"
      />
    </>
  )}
</head>
```

### SPA Navigation Tracking

The `DynamicYieldProvider` component tracks client-side navigation:

```tsx
// components/dynamic-yield-provider.tsx
window.DY.API("spa", {
  isPageView: true,
  path: fullPath,
  title: document.title,
  context: {
    type: getPageType(pathname), // HOMEPAGE, PRODUCT, CATEGORY, etc.
    data: getPageData(pathname),
  },
});
```

### Setting Recommendation Context (Important!)

> **Warning**: The SPA API call alone is **not sufficient** for DY client-side features to work properly. You must also explicitly set `window.DY.recommendationContext`:

```tsx
// components/dynamic-yield-provider.tsx
// This is REQUIRED in addition to the SPA API call!
window.DY.recommendationContext = {
  type: getPageType(pathname),  // HOMEPAGE, PRODUCT, CATEGORY, etc.
  data: getPageData(pathname),  // e.g., product SKUs on product pages
};
```

This context is used by DY for:
- Product recommendations (needs page type + product data)
- Targeting rules based on page context
- Analytics attribution

Without setting `recommendationContext`, DY experiences that depend on page context (like "similar products" recommendations) will not work correctly.

---

## HTTPS Development Setup

Dynamic Yield client-side scripts require **HTTPS** and a **whitelisted domain**. Since DY is configured for a specific domain (e.g., `hygraph.com`), we need to run the dev server on that domain with SSL.

### Prerequisites

1. **Install mkcert** for local SSL certificates:

```bash
# macOS
brew install mkcert

# Install local CA
mkcert -install
```

2. **Generate certificates** for the DY-configured domain:

```bash
# Run from project root
mkcert hygraph.com localhost 127.0.0.1
```

This creates two files in the project root:
- `hygraph.com+2.pem` (certificate)
- `hygraph.com+2-key.pem` (private key)

3. **Update `/etc/hosts`** to point the domain locally:

```bash
sudo nano /etc/hosts
```

Add this line:
```
127.0.0.1 hygraph.com
```

### Running the HTTPS Dev Server

The project includes a custom HTTPS server in `server.mjs`:

```bash
# Production mode (no hot reloading)
node server.mjs

# Development mode (with hot reloading)
DEV=true node server.mjs
```

The app will be available at: **https://hygraph.com** (port 443)

> **Note**: Running on port 443 may require `sudo` on some systems, or you can modify `server.mjs` to use a different port like 3443.

### Alternative: Standard Dev Server

If you don't need DY client-side features, use the standard dev server:

```bash
pnpm dev  # http://localhost:3434
```

---

## Use Case 1: Product Recommendations

Sync Hygraph products to DY's product feed to enable AI-powered recommendations.

### Sync Script

Run `dy/sync-products.ts` to generate the product feed:

```bash
npx tsx dy/sync-products.ts
```

### Output Format

Products are exported to `out/products.json` in DY's required format:

```json
{
  "sku": "cmae3ajjw003n07vno07nfmb5",
  "product_type": "CoffeeBean",
  "group_id": "cmae3ajjw003n07vno07nfmb5",
  "name": "Midnight Roast",
  "price": 14.99,
  "in_stock": true,
  "url": "http://localhost:3434/beans/midnight-roast",
  "image_url": "https://...",
  "categories": "Dark|Colombia",
  "keywords": "Chocolate|Caramel|Smoky"
}
```

### Field Mapping

| DY Field | Hygraph Field | Notes |
|----------|---------------|-------|
| `sku` | `id` | Unique product identifier |
| `group_id` | `id` | Parent product for variants |
| `categories` | `roastLevel\|origin` | Pipe-separated hierarchy |
| `keywords` | `flavorNotes` | For affinity algorithms |

### Backend Recommendations API

Fetch recommendations server-side using `dy/coffeeRecomendations.ts`:

```ts
import { coffeeRecommendations, testingCtx } from "@/dy/coffeeRecomendations";

// Get recommended SKUs
const skus = await coffeeRecommendations(dyContext);
// Returns: ["sku1", "sku2", "sku3"]
```

---

## Use Case 2: Landing Page Variations

Three approaches for A/B testing landing page content:

### Approach 1: Hygraph-Only (Code-Based)

**Route**: `/landing/[slug]`

Variant selection happens server-side based on segment or variant ID:

```tsx
// app/landing/[slug]/page.tsx
export default async function LandingPage({ params, searchParams }) {
  const segment = await getSegment(searchParams);
  const variantId = await getVariantId(searchParams);
  
  // Fetch landing page with filtered variants
  let landingPage = await getLandingPageBySlug(slug, segment, variantId);
  
  // Apply first matching variant
  landingPage = applyVariant(landingPage);
  
  return <LandingPageUI {...landingPage} />;
}
```

**GraphQL Query**:
```graphql
variants(where: { 
  OR: [
    { segments_some: { slug: $segment } }, 
    { id: $variantId }
  ] 
}) {
  id
  title
  hero { ... }
}
```

**Pros**: Full server-side rendering, SEO-friendly, no CLS  
**Cons**: No DY optimization/learning, manual segment assignment

### Approach 2: DY Client-Side Overwrite

**Route**: `/landing-dy/[slug]`

Serve base content, let DY manipulate the DOM client-side:

```tsx
// app/landing-dy/[slug]/page.tsx
// Renders base landing page without variant logic
// DY experiences target #hero-content element to swap content
```

**Pros**: Full DY optimization, automatic learning  
**Cons**: Content flash (CLS), not SEO-friendly for variants

### Approach 3: Sync to DY + Backend Rendering (Recommended)

This approach uses `pageAttributes` to target DY experiences per landing page. Each landing page gets its own DY experience, and the backend API call passes the page slug as a custom attribute for targeting.

### DY Decisions API Request

```json
{
  "user": {
    "dyid": "00000000-0000-0000-0000-000000000000",
    "dyid_server": "00000000-0000-0000-0000-000000000000"
  },
  "session": {
    "dy": "00000000-0000-0000-0000-000000000000"
  },
  "selector": {
    "names": ["landing-page-hybrid"]
  },
  "context": {
    "page": {
      "type": "OTHER",
      "data": [],
      "location": "https://hygraph.com/landing-hybrid/summer-cold-brew-festival-2026",
      "locale": "en_US"
    },
    "pageAttributes": {
      "landing-slug": "summer-cold-brew-festival-2026"
    },
    "device": {
      "ip": "8.8.4.4",
      "userAgent": "Mozilla/5.0 (X11; ; U; Linux armv7l; en-us)"
    }
  }
}
```

**How this works:**
- `pageAttributes` passes custom attributes that DY uses for experience targeting
- Each landing page needs its own DY experience with targeting rules based on the `landing-slug` attribute
- The sync script should only sync the relevant variants for each targeted parent landing page

> **Note:** We initially tried using `realtimeRules` in the selector to filter variants by `landing_page_id`, which would have allowed a single DY campaign for all landing pages. However, realtime filtering does NOT work with variants—it only works with product recommendations. That's why we use the `pageAttributes` approach instead.

### Implementation Steps

1. **Sync variants to DY:**  
   Use `dy/sync-hero-variations.ts` to push variants. Each sync should filter variants by their parent landing page.

2. **Set up one DY experience per landing page:**  
   Each experience has targeting:
   - **Who?** → Custom Attribute `landing-slug` is `<slug>`
   - **Where?** → Current Page URL contains `landing-hybrid`

3. **Use pageAttributes via API:**  
   Pass the landing page slug as a `pageAttribute` in your server-side code:

   ```ts
   // Build context with pageAttributes for targeting
   const dyCtx = await buildDYContext({
     pagePath: `/landing-hybrid/${slug}`,
     pageAttributes: { "landing-slug": slug }
   });

   const payload = await getDYBackendDecision<LandingPageHybridPayload>(dyCtx, {
     names: ["landing-page-hybrid"]
   });

   const variantId = payload?.variantId;
   const landingPage = await getLandingPageBySlug(slug, undefined, variantId);
   ```

**Note:**  
This approach requires creating one DY experience per landing page. For projects with many landing pages we need different solutions...

### Summary

1. **Sync variations to DY** using the variation feed (filtered by parent)
2. **Create DY experience** with `pageAttributes` targeting for each landing page
3. **Call DY backend API** with `pageAttributes` to get the winning variation ID
4. **Render server-side** with the selected variation

**Pros**: SEO-friendly, no CLS, DY optimization  
**Cons**: Requires one DY experience per landing page

### Variation Feed Sync

Run `dy/sync-hero-variations.ts`:

```bash
npx tsx dy/sync-hero-variations.ts
```

Output (`out/hero-variations.csv`):
```csv
variation_id,variation_name,landing_page_id,landing_page_slug,is_control,hero_title,hero_slogan,...
cmk2tsjen01ai07szaejvb1a9_control,Summer Cold Brew Festival 2026 - Control,...,Cool Down with Cold Brew,...
cmk2tvs3n01cp07szqtyozl5y,Beat the Heat: Cold Brew Sale,...,Beat the Heat 🧊,...
```

---

## Use Case 3: Banner/Overlay (Pure DY Client-Side)

For UI elements fully rendered by DY (popups, banners, overlays).

### Sync Script

Run `dy/sync-discount-variations.ts`:

```bash
npx tsx dy/sync-discount-variations.ts
```

### DY Template Variables

The sync maps Hygraph fields to DY template variables:

| DY Variable | Hygraph Field |
|-------------|---------------|
| `${Main Text}` | `mainText` |
| `${Secondary Text}` | `secondaryText` |
| `${Offer}` | `offer` |
| `${Coupon Code}` | `couponCode` |
| `${Highlight Color}` | `highlightColor.hex` |
| `${Button Text}` | `buttonText` |

### How It Works

1. Create variations in Hygraph (discount overlays with variants)
2. Sync to DY variation feed
3. Create DY experience using "Custom Code" or template
4. DY renders the overlay client-side using feed data

---

## Open Questions: Segment-Driven Variants

### The Challenge

We attempted to use DY segments to drive Hygraph variant selection, but encountered limitations.

### What We Tried

1. **Synced segments to DY** (`dy/sync-segments.ts`)
2. **Created backend JSON template** in DY that returns a segment ID
3. **Used segment ID** to filter Hygraph variants

### Why It's Limited

- **DY doesn't understand the variant content** - It only sees an opaque ID
- **Optimization is blind** - DY can optimize for revenue/conversions, but doesn't know *why* a variant performs better
- **No semantic learning** - Unlike product recommendations where DY understands categories/attributes

### When It Could Work: Product Affinities

If segments map to **product categories**, affinities become useful:

```
Example: Bike Shop
├── Segment: "E-Bike Enthusiasts" → Show e-bike content
├── Segment: "MTB Riders" → Show mountain bike content
└── Segment: "Road Cyclists" → Show road bike content
```

DY can learn user product affinities and map them to segments.

**Not applicable for our coffee example** - Coffee preferences don't map cleanly to segments that DY can learn from purchase behavior.

### Custom Targeting Rules

You can configure DY targeting rules to select segment IDs:

```
IF user is "New Visitor" → Return segment "welcome-offer"
IF user affinity includes "Dark Roast" → Return segment "dark-roast-lovers"
```

But this requires manual rule setup and doesn't leverage DY's ML.

---

## Notes on Affinities

### When Product Affinities Work

- **Clear category distinctions** in your product catalog
- **Purchase history** that reveals preferences
- **Segments map to product attributes**

### Example Use Cases

✅ **Good fit**:
- Fashion: Casual vs. Formal preferences
- Bikes: E-bike vs. MTB vs. Road
- Electronics: Gaming vs. Productivity

❌ **Poor fit**:
- Coffee: Roast level preference isn't strongly correlated with behavior
- Books: Genre preferences are complex
- Food: Dietary preferences need explicit data

### Implementation

1. Ensure product feed includes meaningful `categories` and `keywords`
2. Create segments in Hygraph with `affinityTags` matching product attributes
3. Use DY affinity conditions in targeting rules

---

## Sync Scripts Reference

| Script | Output | Purpose |
|--------|--------|---------|
| `dy/sync-products.ts` | `out/products.json` | Product feed for recommendations |
| `dy/sync-hero-variations.ts` | `out/hero-variations.csv` | Landing page A/B tests |
| `dy/sync-discount-variations.ts` | `out/discount-variations.csv` | Banner/overlay variations |
| `dy/sync-segments.ts` | `out/segments.json` | Segment definitions |

### Running Syncs

```bash
# Individual syncs
npx tsx dy/sync-products.ts
npx tsx dy/sync-hero-variations.ts
npx tsx dy/sync-discount-variations.ts
npx tsx dy/sync-segments.ts
```

### Environment Variables

```bash
# Required for syncs
HYGRAPH_API_URL="https://..."
HYGRAPH_API_TOKEN="..."  # Optional, for draft content

# Required for DY API calls
DY_API_KEY="..."
NEXT_PUBLIC_DY_SECTION_ID="..."
```

---

## File Reference

| File | Purpose |
|------|---------|
| `app/layout.tsx` | DY script injection |
| `components/dynamic-yield-provider.tsx` | SPA tracking + recommendation context |
| `dy/types.ts` | TypeScript definitions |
| `dy/coffeeRecomendations.ts` | Backend recommendations API |
| `dy/sync-*.ts` | Sync scripts |
| `server.mjs` | HTTPS dev server |
| `lib/utils.ts` | `applyVariant()` helper |
| `lib/landing-page-queries.ts` | Variant-aware queries |

