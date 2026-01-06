import { fetchFromCMS } from "../lib/graphql-client";
import { promises as fs } from "fs";

/**
 * Sync Landing Page Hero Variations to Dynamic Yield
 *
 * This script fetches landing pages with their hero sections and variants from Hygraph
 * and generates a CSV file formatted for Dynamic Yield's Variation Feed.
 *
 * CSV Format follows DY requirements:
 * - Unique key column for variation identification
 * - Variation name column for DY reports
 * - Variable columns matching template variables (no spaces/special chars in headers)
 *
 * @see https://support.dynamicyield.com/hc/en-us/articles/360034633733-Syncing-Variations-with-a-Variation-Feed
 */

const query = `
query LandingPagesWithVariants {
  landingPages(where: { isActive: true }, stage: DRAFT) {
    id
    title
    slug
    hero {
      title
      slogan
      buttonText
      buttonUrl
      background {
        url(transformation: {
          image: { resize: { width: 1920, height: 1080 } }
          document: { output: { format: webp } }
        })
      }
    }
    variants {
      id
      title
      hero {
        title
        slogan
        buttonText
        buttonUrl
        background {
          url(transformation: {
            image: { resize: { width: 1920, height: 1080 } }
            document: { output: { format: webp } }
          })
        }
      }
    }
  }
}
`;

interface Hero {
  title: string;
  slogan?: string;
  buttonText?: string;
  buttonUrl?: string;
  background?: {
    url: string;
  };
}

interface Variant {
  id: string;
  title: string;
  hero?: Hero;
}

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  hero?: Hero;
  variants: Variant[];
}

interface QueryResponse {
  landingPages: LandingPage[];
}

interface HeroVariationRow {
  variation_id: string;
  variation_name: string;
  landing_page_id: string;
  landing_page_slug: string;
  is_control: boolean;
  hero_title: string;
  hero_slogan: string;
  hero_button_text: string;
  hero_button_url: string;
  hero_background_url: string;
}

/**
 * Escape a value for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Escapes internal quotes by doubling them
 */
function escapeCSV(value: string | boolean | undefined): string {
  if (value === undefined || value === null) {
    return "";
  }

  const stringValue = String(value);

  // Check if we need to quote the value
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert an array of objects to CSV string
 */
function toCSV(rows: HeroVariationRow[]): string {
  if (rows.length === 0) {
    return "";
  }

  // Get headers from first row keys
  const headers = Object.keys(rows[0]) as (keyof HeroVariationRow)[];

  // Create header row
  const headerLine = headers.join(",");

  // Create data rows
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCSV(row[header])).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

async function main() {
  console.log("Fetching landing pages with hero variations from Hygraph...");

  const { landingPages } = (await fetchFromCMS(query)) as QueryResponse;

  console.log(`Found ${landingPages.length} landing page(s)`);

  const variations: HeroVariationRow[] = [];

  for (const landingPage of landingPages) {
    // Skip landing pages without a hero
    if (!landingPage.hero) {
      console.log(`  Skipping "${landingPage.title}" - no hero section`);
      continue;
    }

    // Add the base/control hero variation
    const controlId = `${landingPage.id}_control`;
    variations.push({
      variation_id: controlId,
      variation_name: `${landingPage.title} - Control`,
      landing_page_id: landingPage.id,
      landing_page_slug: landingPage.slug,
      is_control: true,
      hero_title: landingPage.hero.title,
      hero_slogan: landingPage.hero.slogan || "",
      hero_button_text: landingPage.hero.buttonText || "",
      hero_button_url: landingPage.hero.buttonUrl || "",
      hero_background_url: landingPage.hero.background?.url || "",
    });

    console.log(`  Added control for "${landingPage.title}"`);

    // Add each variant's hero
    for (const variant of landingPage.variants) {
      // Skip variants without a hero
      if (!variant.hero) {
        console.log(
          `    Skipping variant "${variant.title}" - no hero section`
        );
        continue;
      }

      variations.push({
        variation_id: variant.id,
        variation_name: variant.title,
        landing_page_id: landingPage.id,
        landing_page_slug: landingPage.slug,
        is_control: false,
        hero_title: variant.hero.title,
        hero_slogan: variant.hero.slogan || "",
        hero_button_text: variant.hero.buttonText || "",
        hero_button_url: variant.hero.buttonUrl || "",
        hero_background_url: variant.hero.background?.url || "",
      });

      console.log(`    Added variant "${variant.title}"`);
    }
  }

  console.log(`\nTotal variations: ${variations.length}`);

  // Generate CSV
  const csv = toCSV(variations);

  // Write to file
  await fs.mkdir("out", { recursive: true });
  await fs.writeFile("out/hero-variations.csv", csv, "utf-8");

  console.log("\nCSV file written to out/hero-variations.csv");

  // Also write JSON for debugging/reference
  await fs.writeFile(
    "out/hero-variations.json",
    JSON.stringify(variations, null, 2)
  );

  console.log("JSON file written to out/hero-variations.json");

  // Print summary
  console.log("\n--- Summary ---");
  console.log(`Landing Pages: ${landingPages.length}`);
  console.log(`Total Variations: ${variations.length}`);
  console.log(
    `  Control variations: ${variations.filter((v) => v.is_control).length}`
  );
  console.log(
    `  Test variations: ${variations.filter((v) => !v.is_control).length}`
  );
}

main().catch((error) => {
  console.error("Error syncing hero variations:", error);
  process.exit(1);
});

