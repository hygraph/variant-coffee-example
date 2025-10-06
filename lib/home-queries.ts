import { BeanFragment } from "./coffee-queries";
import { fetchFromCMS } from "./graphql-client";

const TestimonialsFragment = `
  fragment Testimonials on Testimonial {
    name
    comment {
      raw
      html
    }
    rating
    position
    date
  }
`;

const FAQFragment = `
  fragment FAQ on FAQ {
    question
    answer {
      raw
      html
    }
  }
`;

const HeroFragment = `
  fragment Hero on Hero {
    title
    slogan
    buttonText
    buttonUrl
    background {
      url(
        transformation: {
          image: { resize: { height: 1440 } }
          document: { output: { format: webp } }
        }
      )
    }
  }
`;

// Query for the homepage data based on your CMS structure
export async function getHomePageData(segment?: String, variantId?: String) {
  console.log(variantId);
  const query =
    `
      query HomePageQuery($segment: String, $variantId: ID) {
        homePage(where: { id: "cmae4766h00iq07vwew6jbdah" }) {
          hero {
            ...Hero
          }
          base_hero: hero {
            ...Hero
          }
          featuredCoffeeBeans {
            ...Bean
          }
          faqs {
            ...FAQ
          }
          testimonials {
            ...Testimonials
          }

          variants(
            where: {
              OR: [{ segments_some: { slug: $segment } }, { id: $variantId }]
            }
          ) {
            hero {
              ...Hero
            }
            faqs {
              ...FAQ
            }
            testimonials {
              ...Testimonials
            }
            featuredCoffeeBeans {
              ...Bean
            }
          }
        }
      }
    ` +
    BeanFragment +
    HeroFragment +
    FAQFragment +
    TestimonialsFragment;

  const data = await fetchFromCMS(query, { segment, variantId });
  return data.homePage;
}
