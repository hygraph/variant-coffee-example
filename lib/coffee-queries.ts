import { fetchFromCMS } from "./graphql-client";

export type BeanType = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: {
    raw: string;
    html: string;
  };
  origin: string;
  roastLevel: string;
  flavorNotes: string;
  weight: number;
  inStock: boolean;
  image?: {
    thumbnailUrl: string;
    url: string;
  };
};
export const BeanFragment = `
  fragment Bean on CoffeeBean {
    id
    name
    slug
    price
    description {
      raw
      html
    }
    origin
    roastLevel
    flavorNotes
    weight
    inStock
    image {
      thumbnailUrl: url(
        transformation: {
          image: { resize: { width: 400, height: 400 } }
          document: { output: { format: webp } }
        }
      )
      url: url(
        transformation: {
          image: { resize: { height: 1440 } }
          document: { output: { format: webp } }
        }
      )
    }
  }
`;

// Get all coffee beans
export async function getAllCoffeeBeans(): Promise<BeanType[]> {
  const query =
    `
      query AllCoffeeBeansQuery {
        coffeeBeans {
          ...Bean
        }
      }
    ` + BeanFragment;

  const data = await fetchFromCMS(query);
  return data.coffeeBeans;
}

// Get a single coffee bean by slug
export async function getCoffeeBeanBySlug(
  slug: string,
): Promise<BeanType | null> {
  const query =
    `
      query CoffeeBeanBySlugQuery($slug: String!) {
        coffeeBean(where: { slug: $slug }) {
          ...Bean
        }
      }
    ` + BeanFragment;

  try {
    const data = await fetchFromCMS(query, { slug });
    return data.coffeeBean;
  } catch (error) {
    console.error(`Error fetching slug${slug}:`, error);
    return null;
  }
}
