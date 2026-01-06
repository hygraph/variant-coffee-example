import { fetchFromCMS } from "../lib/graphql-client";
import { promises as fs } from "fs";

/**
 * Sync Discount Overlay Variations to Dynamic Yield
 *
 * This script fetches discount overlays with their variants from Hygraph
 * and generates a CSV file formatted for Dynamic Yield's Variation Feed.
 *
 * CSV Format follows DY requirements:
 * - Unique key column for variation identification
 * - Variation name column for DY reports
 * - Variable columns matching template variables (no spaces/special chars in headers)
 *
 * DY Template Variables:
 * - ${Main Text}
 * - ${Secondary Text}
 * - ${Offer}
 * - ${Code Text}
 * - ${Coupon Code}
 * - ${Highlight Color}
 * - ${Button Text}
 * - ${Confirmation Text}
 * - ${Error Text}
 *
 * @see https://support.dynamicyield.com/hc/en-us/articles/360034633733-Syncing-Variations-with-a-Variation-Feed
 */

const query = `
query DiscountOverlaysWithVariants {
  discountOverlays(where: { isActive: true }, stage: DRAFT) {
    id
    title
    slug
    mainText
    secondaryText
    offer
    codeText
    couponCode
    highlightColor {
      hex
    }
    buttonText
    confirmationText
    errorText
    variants(first: 100) {
      id
      mainText
      secondaryText
      offer
      codeText
      couponCode
      highlightColor {
        hex
      }
      buttonText
      confirmationText
      errorText
    }
  }
}
`;

interface DiscountOverlayFields {
  mainText?: string;
  secondaryText?: string;
  offer?: string;
  codeText?: string;
  couponCode?: string;
  highlightColor?: {
    hex: string;
  };
  buttonText?: string;
  confirmationText?: string;
  errorText?: string;
}

interface Variant extends DiscountOverlayFields {
  id: string;
}

interface DiscountOverlay extends DiscountOverlayFields {
  id: string;
  title: string;
  slug: string;
  variants: Variant[];
}

interface QueryResponse {
  discountOverlays: DiscountOverlay[];
}

interface DiscountVariationRow {
  variation_id: string;
  variation_name: string;
  discount_overlay_id: string;
  discount_overlay_slug: string;
  is_control: boolean;
  main_text: string;
  secondary_text: string;
  offer: string;
  code_text: string;
  coupon_code: string;
  highlight_color: string;
  button_text: string;
  confirmation_text: string;
  error_text: string;
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
function toCSV(rows: DiscountVariationRow[]): string {
  if (rows.length === 0) {
    return "";
  }

  // Get headers from first row keys
  const headers = Object.keys(rows[0]) as (keyof DiscountVariationRow)[];

  // Create header row
  const headerLine = headers.join(",");

  // Create data rows
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCSV(row[header])).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

/**
 * Merge variant fields with base overlay fields
 * Variant fields override base fields when present
 */
function mergeVariantFields(
  base: DiscountOverlayFields,
  variant: DiscountOverlayFields
): DiscountOverlayFields {
  return {
    mainText: variant.mainText || base.mainText,
    secondaryText: variant.secondaryText || base.secondaryText,
    offer: variant.offer || base.offer,
    codeText: variant.codeText || base.codeText,
    couponCode: variant.couponCode || base.couponCode,
    highlightColor: variant.highlightColor || base.highlightColor,
    buttonText: variant.buttonText || base.buttonText,
    confirmationText: variant.confirmationText || base.confirmationText,
    errorText: variant.errorText || base.errorText,
  };
}

async function main() {
  console.log("Fetching discount overlays with variants from Hygraph...");

  const { discountOverlays } = (await fetchFromCMS(query)) as QueryResponse;

  console.log(`Found ${discountOverlays.length} discount overlay(s)`);

  const variations: DiscountVariationRow[] = [];

  for (const overlay of discountOverlays) {
    // Add the base/control variation
    const controlId = `${overlay.id}_control`;
    variations.push({
      variation_id: controlId,
      variation_name: `${overlay.title} - Control`,
      discount_overlay_id: overlay.id,
      discount_overlay_slug: overlay.slug,
      is_control: true,
      main_text: overlay.mainText || "",
      secondary_text: overlay.secondaryText || "",
      offer: overlay.offer || "",
      code_text: overlay.codeText || "",
      coupon_code: overlay.couponCode || "",
      highlight_color: overlay.highlightColor?.hex || "",
      button_text: overlay.buttonText || "",
      confirmation_text: overlay.confirmationText || "",
      error_text: overlay.errorText || "",
    });

    console.log(`  Added control for "${overlay.title}"`);

    // Add each variant
    for (let i = 0; i < overlay.variants.length; i++) {
      const variant = overlay.variants[i];

      // Merge variant fields with base fields (variant overrides base)
      const merged = mergeVariantFields(overlay, variant);

      variations.push({
        variation_id: variant.id,
        variation_name: `${overlay.title} - Variant ${i + 1}`,
        discount_overlay_id: overlay.id,
        discount_overlay_slug: overlay.slug,
        is_control: false,
        main_text: merged.mainText || "",
        secondary_text: merged.secondaryText || "",
        offer: merged.offer || "",
        code_text: merged.codeText || "",
        coupon_code: merged.couponCode || "",
        highlight_color: merged.highlightColor?.hex || "",
        button_text: merged.buttonText || "",
        confirmation_text: merged.confirmationText || "",
        error_text: merged.errorText || "",
      });

      console.log(`    Added variant ${i + 1} (${variant.id})`);
    }
  }

  console.log(`\nTotal variations: ${variations.length}`);

  // Generate CSV
  const csv = toCSV(variations);

  // Write to file
  await fs.mkdir("out", { recursive: true });
  await fs.writeFile("out/discount-variations.csv", csv, "utf-8");

  console.log("\nCSV file written to out/discount-variations.csv");

  // Also write JSON for debugging/reference
  await fs.writeFile(
    "out/discount-variations.json",
    JSON.stringify(variations, null, 2)
  );

  console.log("JSON file written to out/discount-variations.json");

  // Print summary
  console.log("\n--- Summary ---");
  console.log(`Discount Overlays: ${discountOverlays.length}`);
  console.log(`Total Variations: ${variations.length}`);
  console.log(
    `  Control variations: ${variations.filter((v) => v.is_control).length}`
  );
  console.log(
    `  Test variations: ${variations.filter((v) => !v.is_control).length}`
  );
}

main().catch((error) => {
  console.error("Error syncing discount variations:", error);
  process.exit(1);
});


