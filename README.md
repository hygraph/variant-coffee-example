## Coffee Roaster Homepage

Marketing site powered by Next.js (App Router) and Hygraph (GraphCMS). Styled with Tailwind CSS and Radix UI components.
For a detailed guide on the content variant setup, see [docs.md](./docs.md).

### Variants & Personalization
- **Goal**: Demonstrate a simple, pragmatic pattern to personalize a marketing site using Hygraph content variants.
- **Audience targeting**:
  - Provide a segment via URL: `?segment={slug}` or via cookie: `segment={slug}`.
  - Optionally force a specific variant via URL: `?variant={id}` (overrides segment matching when present).
- **Fetching strategy**:
  - Queries request base content plus `variants` filtered by segment or variant id:
    - See `lib/home-queries.ts` and `lib/article-queries.ts` where `variants(where: { OR: [{ segments_some: { slug: $segment } }, { id: $variantId }] })` is used.
- **Overlay strategy**:
  - `lib/utils.ts` provides `applyVariant(base)` which merges the first matched variant into the base object.
  - Inputs are derived via `getSegment(searchParams)` (URL or `segment` cookie) and `getVariantId(searchParams)` (URL only).
  - Example flow:
    ```ts
    const segment = await getSegment(searchParams);
    const variantId = await getVariantId(searchParams);
    const home = await getHomePageData(segment, variantId);
    const personalized = applyVariant(home);
    ```
- **Try it locally**:
  - Start the dev server, then open:
    - `http://localhost:3434/?segment=<segment-slug>`
    - `http://localhost:3434/?variant=<variant-id>`
  - Or set a cookie in the browser console:
    ```js
    document.cookie = 'segment=<segment-slug>; path=/';
    ```
- **Note**: The overlay currently applies the first matched variant. Extend `applyVariant` if you need multi-variant resolution.

### Tech stack
- **Framework**: Next.js 15, React 19
- **Styling**: Tailwind CSS (+ `@tailwindcss/typography`)
- **UI**: Radix UI, Lucide Icons
- **CMS**: Hygraph (GraphCMS)
- **Package manager**: pnpm

## Getting started
1. Clone the repo and install dependencies:
```bash
pnpm install
```
2. Create a `.env.local` at the project root and add your Hygraph credentials:
```bash
# Required
HYGRAPH_API_URL="https://<your-hygraph-endpoint>/graphql"

# Optional (needed for private or draft content)
HYGRAPH_API_TOKEN="<permanent-auth-token>"
```
Example endpoint structure: `https://{region-cluster}.cdn.hygraph.dev/content/{projectId}/{environment}/graphql`
For example: `https://eu-central-1-dev-1.cdn.hygraph.dev/content/cmecsfqn0005o07vp4gc3dqxu/master/graphql`.
3. Run the app in development:
```bash
pnpm dev
```
The app will start on [http://localhost:3434](http://localhost:3434).

## Scripts
```bash
pnpm dev     # Start Next.js dev server (port 3434)
pnpm build   # Production build
pnpm start   # Run built app
pnpm lint    # Lint with Next.js ESLint
```

## Project structure
- `app/`: App Router routes, layouts, and pages
- `components/`: Reusable UI components
- `lib/`: Data layer and utilities (e.g., `graphql-client.ts`, queries)
- `hooks/`: Custom React hooks
- `public/`: Static assets
- `styles/`: Global styles
- `tailwind.config.ts`: Tailwind configuration

## CMS integration
- GraphQL requests are handled in `lib/graphql-client.ts` and revalidated every 60s for ISR.
- Set `HYGRAPH_API_URL` and (optionally) `HYGRAPH_API_TOKEN` in `.env.local`.
- See `docs.md` and `docs_simplyfied.md` for notes on variant overlays and querying examples.

## Deployment
- Recommended: Vercel
  - Add `HYGRAPH_API_URL` and `HYGRAPH_API_TOKEN` as project Environment Variables
  - Build command: `pnpm build`
  - Start command: `pnpm start` (if not using Vercel’s default)

## Notes
- `next.config.mjs` is configured to ignore TypeScript and ESLint errors during builds and to use unoptimized images; adjust for stricter CI if needed.
- Package manager is pinned to pnpm in `package.json`. Use pnpm to avoid lockfile churn.
