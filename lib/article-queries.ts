import { fetchFromCMS } from "./graphql-client";

// Get all articles
export async function getAllArticles() {
  const query = `
    query AllArticlesQuery {
      articles {
        id
        title
        summary
        picture {
          url
          width
          height
        }
        createdAt
      }
    }
  `;

  try {
    const data = await fetchFromCMS(query);
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

// Get a single article by ID
export async function getArticleById(id: string) {
  const query = `
    query ArticleByIdQuery($id: ID!) {
      article(where: {id: $id}) {
         id
         title
         summary
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
      }
    }
  `;

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
