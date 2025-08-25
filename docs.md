# How to overlay variants:
```ts
  const segment = await getSegment(searchParams);
  const { id } = await params;
  let article = await getArticleById(id, segment);
  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }
  article = applyVariant(article);
```

# Helpers:
```ts
export async function getSegment(
  searchParams: Promise<{ segment?: string }>,
): Promise<string | undefined> {
  const { segment } = await searchParams;
  const cookieStore = await cookies();
  const cookieSegment = cookieStore.get("segment");
  return segment || cookieSegment?.value;
}
```
```ts
export function mergeVariant<T extends Record<string, any>>(
  data: T,
  variant: Partial<T>,
): T {
  return {
    ...data,
    ...variant,
  };
}
```
```ts
export function applyVariant<
  T extends Record<string, any> & { variants: Array<Partial<T>> },
>(data: T): T {
  return mergeVariant(data, data.variants[0]);
}
```

## Query article including variants:
```ts
export type ArticleType = {
  id: string;
  title: string;
  summary: string;
  variants: {
    title: string;
    summary: string;
  }[];
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
// Get a single article by ID
export async function getArticleById(
  id: string,
  segment?: string,
): Promise<ArticleType | null> {
  const query =
    `
    query ArticleByIdQuery($id: ID!, $segment: String) {
      article(where: {id: $id}) {
        id
        title
        summary
        variants(where:{
            segments_some:{
              slug: $segment
            }
          }) {
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
      }
    }
  `;

  try {
    const data = await fetchFromCMS(query, { id, segment });
    return data.article;
  } catch (error) {
    console.error(`Error fetching article with ID ${id}:`, error);
    return null;
  }
}
```
