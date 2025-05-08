import { fetchFromCMS } from "./graphql-client";

// Query for the homepage data based on your CMS structure
export async function getHomePageData() {
  const query = `
    query HomePageQuery {
      homePage(where: {id: "cmae4766h00iq07vwew6jbdah"}) {
        hero {
          title
          slogan
          buttonText
          buttonUrl
          background {
            url
          }
        }
        featuredCoffeeBeans {
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
        faqs {
          question
          answer {
            raw
            html
          }
        }
        testimonials {
          name
          comment {
            raw
            html
          }
          rating
          position
          date
        }
      }
    }
  `;

  const data = await fetchFromCMS(query);
  return data.homePage;
}
