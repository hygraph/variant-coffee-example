import { fetchFromCMS } from "./graphql-client"

// Get all coffee beans
export async function getAllCoffeeBeans() {
  const query = `
    query AllCoffeeBeansQuery {
      coffeeBeans {
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
      }
    }
  `

  const data = await fetchFromCMS(query)
  return data.coffeeBeans
}

// Get a single coffee bean by slug
export async function getCoffeeBeanBySlug(slug: string) {
  const query = `
    query CoffeeBeanBySlugQuery($slug: String!) {
      coffeeBean(where: {slug: $slug}) {
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
      }
    }
  `

  const data = await fetchFromCMS(query, { slug })
  return data.coffeeBean
}
