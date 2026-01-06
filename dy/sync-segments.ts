import { fetchFromCMS } from "../lib/graphql-client";
import { promises as fs } from "fs";

/**
 * Sync Segments to Dynamic Yield
 *
 * This script fetches segments from Hygraph and generates files for Dynamic Yield.
 * Segments are used in DY backend decisions to personalize content based on
 * user affinities or other targeting criteria.
 *
 * The synced segments can be used to:
 * - Create DY audiences matching segment definitions
 * - Power backend decisions that return the appropriate segment for a user
 * - Enable affinity-based personalization (future: add affinity fields to segments)
 *
 * Output:
 * - CSV file for DY feed import
 * - JSON file for debugging/reference
 *
 * @see https://support.dynamicyield.com/hc/en-us/articles/360034633733-Syncing-Variations-with-a-Variation-Feed
 */

const query = `
query Segments {
  segments(stage: DRAFT) {
    id
    name
    slug
    description
    affinityTags
    priority
    createdAt
    updatedAt
  }
}
`;

interface Segment {
  id: string;
  name: string;
  slug: string;
  description?: string;
  affinityTags: string[];
  priority?: number;
  createdAt: string;
  updatedAt: string;
}

interface QueryResponse {
  segments: Segment[];
}

interface SegmentRow {
  segment_id: string;
  segment_name: string;
  segment_slug: string;
  segment_description: string;
  affinity_tags: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

/**
 * Escape a value for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Escapes internal quotes by doubling them
 */
function escapeCSV(value: string | number | undefined): string {
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
function toCSV(rows: SegmentRow[]): string {
  if (rows.length === 0) {
    return "";
  }

  // Get headers from first row keys
  const headers = Object.keys(rows[0]) as (keyof SegmentRow)[];

  // Create header row
  const headerLine = headers.join(",");

  // Create data rows
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCSV(row[header])).join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

async function main() {
  console.log("Fetching segments from Hygraph...");

  const { segments } = (await fetchFromCMS(query)) as QueryResponse;

  console.log(`Found ${segments.length} segment(s)`);

  const rows: SegmentRow[] = [];

  for (const segment of segments) {
    rows.push({
      segment_id: segment.id,
      segment_name: segment.name,
      segment_slug: segment.slug,
      segment_description: segment.description || "",
      affinity_tags: (segment.affinityTags || []).join("|"),
      priority: segment.priority || 0,
      created_at: segment.createdAt,
      updated_at: segment.updatedAt,
    });

    const tagsDisplay = segment.affinityTags?.length
      ? `[${segment.affinityTags.join(", ")}]`
      : "(no tags)";
    console.log(
      `  Added segment "${segment.name}" (${segment.slug}) - priority: ${segment.priority || 0}, tags: ${tagsDisplay}`
    );
  }

  console.log(`\nTotal segments: ${rows.length}`);

  // Generate CSV
  const csv = toCSV(rows);

  // Write to file
  await fs.mkdir("out", { recursive: true });
  await fs.writeFile("out/segments.csv", csv, "utf-8");

  console.log("\nCSV file written to out/segments.csv");

  // Also write JSON for debugging/reference
  await fs.writeFile("out/segments.json", JSON.stringify(rows, null, 2));

  console.log("JSON file written to out/segments.json");

  // Print summary
  console.log("\n--- Summary ---");
  console.log(`Total Segments: ${segments.length}`);
  for (const segment of segments) {
    const tags = segment.affinityTags?.length
      ? segment.affinityTags.join(", ")
      : "none";
    console.log(
      `  - ${segment.name} (${segment.slug}) | priority: ${segment.priority || 0} | tags: ${tags}`
    );
  }

  console.log("\n--- DY Integration ---");
  console.log("Use affinity_tags to match users based on their affinities in DY:");
  console.log("  1. Create a backend decision in DY");
  console.log("  2. Use affinity conditions to match users to segments");
  console.log("  3. Return the matching segment_id for personalization");
}

main().catch((error) => {
  console.error("Error syncing segments:", error);
  process.exit(1);
});

