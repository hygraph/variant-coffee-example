import { fetchFromCMS } from "./graphql-client";

export type ArticleType = {
  id: string;
  title: string;
  summary: string;
  content: {
    raw: string;
    html: string;
  };
  picture: {
    thumbnailUrl: string;
    url: string;
  };
  createdAt: string;
};

const ArticleFragment = `
fragment Article on Article {
  id
  title
  summary
  content {
    raw
    html
  }
  picture {
    thumbnailUrl: url(
      transformation: {image: {resize: {width: 800, height: 600}}, document: {output: {format: webp}}}
    )
     url: url(
       transformation: {image: {}, document: {output: {format: webp}}}
     )
  }
  createdAt
}`;
// Get all articles
export async function getAllArticles(): Promise<ArticleType[]> {
  const query =
    `
    query AllArticlesQuery {
      articles {
       ...Article
      }
    }
  ` + ArticleFragment;

  try {
    const data = await fetchFromCMS(query);
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

// Get a single article by ID
export async function getArticleById(id: string): Promise<ArticleType | null> {
  const query =
    `
    query ArticleByIdQuery($id: ID!) {
      article(where: {id: $id}) {
        ...Article
      }
    }
  ` + ArticleFragment;

  try {
    const data = await fetchFromCMS(query, { id });
    return data.article;
  } catch (error) {
    console.error(`Error fetching article with ID ${id}:`, error);
    return null;
  }
}

// Get a single article by slug
export async function getArticleBySlug(slug: string) {
  const query = `
    query ArticleBySlugQuery($slug: String!) {
      articles(where: {slug: $slug}) {
        id
        title
        excerpt
        content {
          raw
          html
        }
        picture {
          url
          width
          height
        }
        createdAt
        slug
      }
    }
  `;

  try {
    const data = await fetchFromCMS(query, { slug });
    return data.articles ? data.articles[0] : null;
  } catch (error) {
    console.error(`Error fetching article with slug ${slug}:`, error);
    return null;
  }
}
