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
  variants(where:{
    segment:{
      slug: $segment
    }
  }){
    title
    summary
  }
  content {
    raw
    html
  }
  picture {
    thumbnailUrl: url(
      transformation: {image: {resize: {width: 800, height: 600}}, document: {output: {format: webp}}}
    )
     url: url(
       transformation: {image: {resize: {height: 1440}}, document: {output: {format: webp}}}
     )
  }
  createdAt
}`;
// Get all articles
export async function getAllArticles(segment?: string): Promise<ArticleType[]> {
  const query =
    `
    query AllArticlesQuery($segment: String) {
      articles {
       ...Article
      }
    }
  ` + ArticleFragment;

  try {
    const data = await fetchFromCMS(query, { segment });
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

// Get a single article by ID
export async function getArticleById(
  id: string,
  segment?: string,
): Promise<ArticleType | null> {
  const query =
    `
    query ArticleByIdQuery($id: ID!, $segment: String) {
      article(where: {id: $id}) {
        ...Article
      }
    }
  ` + ArticleFragment;

  try {
    const data = await fetchFromCMS(query, { id, segment });
    return data.article;
  } catch (error) {
    console.error(`Error fetching article with ID ${id}:`, error);
    return null;
  }
}
