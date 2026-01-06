import { fetchFromCMS } from "./graphql-client";
import { BeanType, BeanFragment } from "./coffee-queries";

export type LandingPageHero = {
  title: string;
  slogan?: string;
  buttonText?: string;
  buttonUrl?: string;
  background?: {
    url: string;
  };
};

export type LandingPageType = {
  id: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  hero?: LandingPageHero;
  content?: {
    raw: string;
    html: string;
  };
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  isActive: boolean;
  featuredProducts: BeanType[];
  createdAt: string;
  variants: Partial<
    Omit<LandingPageType, "variants" | "slug" | "isActive" | "featuredProducts">
  >[];
};

const LandingPageFragment = `
  fragment LandingPage on LandingPage {
    id
    title
    slug
    metaTitle
    metaDescription
    hero {
      title
      slogan
      buttonText
      buttonUrl
      background {
        url(
          transformation: {
            image: { resize: { width: 1920, height: 1080 } }
            document: { output: { format: webp } }
          }
        )
      }
    }
    content {
      raw
      html
    }
    ctaButtonText
    ctaButtonUrl
    isActive
    featuredProducts {
      ...Bean
    }
    createdAt

    variants(
      where: { OR: [{ segments_some: { slug: $segment } }, { id: $variantId }] }
    ) {
      id
      title
      metaTitle
      metaDescription
      hero {
        title
        slogan
        buttonText
        buttonUrl
        background {
          url(
            transformation: {
              image: { resize: { width: 1920, height: 1080 } }
              document: { output: { format: webp } }
            }
          )
        }
      }
      content {
        raw
        html
      }
      ctaButtonText
      ctaButtonUrl
    }
  }
`;

// Get all landing pages
export async function getAllLandingPages(
  segment?: string,
  variantId?: string
): Promise<LandingPageType[]> {
  const query =
    `
      query AllLandingPagesQuery($segment: String, $variantId: ID) {
        landingPages(where: { isActive: true }) {
          ...LandingPage
        }
      }
    ` +
    LandingPageFragment +
    BeanFragment;

  try {
    const data = await fetchFromCMS(query, { segment, variantId });
    return data.landingPages || [];
  } catch (error) {
    console.error("Error fetching landing pages:", error);
    return [];
  }
}

// Get a single landing page by slug
export async function getLandingPageBySlug(
  slug: string,
  segment?: string,
  variantId?: string
): Promise<LandingPageType | null> {
  const query =
    `
      query LandingPageBySlugQuery($slug: String!, $segment: String, $variantId: ID) {
        landingPage(where: { slug: $slug }) {
          ...LandingPage
        }
      }
    ` +
    LandingPageFragment +
    BeanFragment;

  try {
    const data = await fetchFromCMS(query, { slug, segment, variantId });
    return data.landingPage;
  } catch (error) {
    console.error(`Error fetching landing page with slug ${slug}:`, error);
    return null;
  }
}

