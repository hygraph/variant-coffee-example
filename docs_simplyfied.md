# how to overlay variants:
```ts
  const segment = await getSegment(searchParams);
  const { id } = await params;
  let article = await getArticleById(id, segment);
  if (!article) {
    throw new Error("Article Not Found");
  }
  article = applyVariant(article);
```

# helpers:
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
export function applyVariant<
  T extends Record<string, any> & { variant?: Partial<T> },
>(data: T): T {
  return {...data, ...(data.variant | {})};
}
```

## query article including variants:
```ts
export type ArticleType = {
  id: string;
  title: string;
  summary: string;
  variant?: {
    title: string;
    summary: string;
  };
  content: {
    html: string;
  };
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
        variant(where: {segment: {slug: $segment}}) {
          title
          summary
        }
        content {
          html
        }
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
