import Image from "next/image";
import Link from "next/link";
import { ArticleType, getAllArticles } from "@/lib/article-queries";
import { applyVariant } from "@/lib/utils";

export const metadata = {
  title: "Coffee Articles | Coffee Roaster",
  description:
    "Discover brewing tips, coffee origins, and stories from our roastery",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string }>;
}) {
  const { segment } = await searchParams;
  // Fetch all articles from CMS
  let articles = await getAllArticles(segment);
  articles = articles.map((a) => applyVariant(a));

  return (
    <main className="min-h-screen py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Coffee Articles
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Discover brewing tips, coffee origins, and stories from our roastery
          in our collection of articles.
        </p>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              No articles found. Check back soon for new content!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ArticleCard({ article }: { article: ArticleType }) {
  // Format date
  const formattedDate = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No date";

  return (
    <Link href={`/articles/${article.id}`} className="group">
      <article className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="relative h-72 w-full">
          <Image
            src={
              article.picture?.thumbnailUrl ||
              `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(article.title)}`
            }
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-2">{formattedDate}</p>
          <h2 className="text-xl font-semibold mb-2 group-hover:text-gray-700 transition-colors">
            {article.title}
          </h2>
          {article.summary && (
            <p className="text-gray-600 line-clamp-3">{article.summary}</p>
          )}
          <div className="mt-4 inline-flex items-center text-sm font-medium text-gray-800 group-hover:text-gray-600">
            Read more
            <svg
              className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
