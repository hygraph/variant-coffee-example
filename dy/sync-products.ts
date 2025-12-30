import { fetchFromCMS } from "../lib/graphql-client";
import { promises as fs } from "fs";
const query = `{
  coffeeBeans{
    sku: id
    product_type: __typename
    # the group id is the same as the id in this case, but if you have variants of products like sizes or colors,
    # you would use the parent product id here to group them together
    group_id: id
    name
    url: slug # needs to be modify to be a real url
    price
    in_stock: inStock
    # image_url: generate based on
    image {
      url(transformation:{image:{resize:{width: 500, height: 500}}document:{output:{
        format: jpg
      }}})
    }
		# categories
    # The categories associated with the product, from general to specific
    # (separated by pipes with no spaces, up to 1,000 characters)
    # based on:
    roastLevel
    origin
    # keywords
    # Any additional information describing the product,
    # separated by pipes. Used for our machine learning and affinity algorithms. Because this column is optional,
    # blank values will not trigger errors or warnings.
    flavorNotes
  }
}`;

interface CoffeeBeanQueryResponse {
  coffeeBeans: {
    sku: string;
    product_type: string;
    group_id: string;
    name: string;
    url: string;
    price: number;
    in_stock: boolean;
    image?: {
      url: string;
    };
    roastLevel?: string;
    origin?: string;
    flavorNotes?: string;
  }[];
}

async function main() {
  const { coffeeBeans } = (await fetchFromCMS(
    query,
  )) as CoffeeBeanQueryResponse;
  // console.log(JSON.stringify(coffeeBeans, null, 2));
  const transformedCoffeeBeans = coffeeBeans.map(
    ({ url, image, roastLevel, origin, flavorNotes, ...bean }) => ({
      ...bean,
      url: `http://localhost:3434/beans/${url}`, // Convert id to real URL
      image_url: image?.url, // Generate image_url based on image.url
      categories: [roastLevel, origin].filter(Boolean).join("|"), // Categories from roastLevel and origin
      keywords: flavorNotes ? flavorNotes.split(", ").join("|") : undefined, // Keywords from flavorNotes
    }),
  );

  await fs.mkdir("out", { recursive: true });
  await fs.writeFile(
    "out/products.json",
    JSON.stringify(transformedCoffeeBeans, null, 2),
  );
}

main().catch((error) => {
  console.error("Error syncing products:", error);
  process.exit(1);
});
