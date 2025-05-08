// GraphQL client for Hygraph CMS

export async function fetchFromCMS(query: string, variables = {}) {
  try {
    if (!process.env.HYGRAPH_API_URL) {
      throw new Error("HYGRAPH_API_URL is not defined");
    }

    const res = await fetch(process.env.HYGRAPH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HYGRAPH_API_TOKEN || ""}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: { revalidate: 60 }, // Revalidate every minute
    });

    const json = await res.json();

    if (json.errors) {
      console.error(json.errors);
      throw new Error(`Failed to fetch API: ${json.errors[0].message}`);
    }

    return json.data;
  } catch (error) {
    console.error("Error fetching from CMS:", error);
    throw new Error(
      `Failed to fetch from CMS: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
