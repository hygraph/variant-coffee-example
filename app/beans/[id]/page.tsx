import Image from "next/image";
import Link from "next/link";
import { getArticleById, getAllArticles } from "@/lib/article-queries";
import { ArrowLeft } from "lucide-react";

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const article = await getArticleById(params.id);

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  return {
    title: `${article.title} | Coffee Roaster`,
    description: article.summery || "Read our latest coffee article",
  };
}

// Generate static params for all articles
export async function generateStaticParams() {
  const articles = await getAllArticles();

  return articles.map((article) => ({
    id: article.id,
  }));
}

export default async function ArticlePage({ params }) {
  const article = await getArticleById(params.id);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="mb-8">
          The article you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/articles"
          className="inline-flex items-center text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Link>
      </div>
    );
  }

  // Format date
  const formattedDate = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No date";

  return (
    <main className="min-h-screen py-12">
      <article className="container mx-auto px-4 max-w-4xl">
        {/* Back to articles link */}
        <Link
          href="/articles"
          className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Link>

        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {article.title}
          </h1>
          <p className="text-gray-600">{formattedDate}</p>
        </header>

        {/* Featured image */}
        {article.picture && (
          <div className="relative w-full h-[400px] md:h-[500px] mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.picture.url || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content?.html || "" }}
        />
      </article>
    </main>
  );
}
