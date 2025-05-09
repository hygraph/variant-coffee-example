import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCoffeeBeanBySlug } from "@/lib/coffee-queries";
type Args = {
  params: Promise<{ slug: string }>;
};
// Generate metadata for the page
export async function generateMetadata({ params }: Args) {
  const { slug } = await params;
  const bean = await getCoffeeBeanBySlug(slug);

  if (!bean) {
    return {
      title: "Coffee Bean Not Found",
      description: "The requested coffee bean could not be found.",
    };
  }

  return {
    title: `${bean.name} | Coffee Roaster`,
    description: `${bean.name} from ${bean.origin} - ${bean.roastLevel} roast with ${bean.flavorNotes}`,
  };
}

// // Generate static params for all beans
// export async function generateStaticParams() {
//   const beans = await getAllCoffeeBeans();

//   return beans.map((bean) => ({
//     slug: bean.slug,
//   }));
// }

export default async function BeanPage({ params }: Args) {
  const { slug } = await params;
  const bean = await getCoffeeBeanBySlug(slug);

  if (!bean) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Coffee Bean Not Found</h1>
        <p className="mb-8">
          The coffee bean you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/beans"
          className="inline-flex items-center text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Coffee Beans
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12">
      <article className="container mx-auto px-4 max-w-4xl">
        {/* Back to beans link */}
        <Link
          href="/beans"
          className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Coffee Beans
        </Link>

        {/* Bean header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {bean.name}
              </h1>
              <p className="text-xl text-gray-600">
                {bean.origin} | {bean.roastLevel} Roast
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-2">
                {bean.price.toFixed(2)} €
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  bean.inStock
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {bean.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
        </header>

        {/* Featured image */}
        {bean.image && (
          <div className="relative w-full h-[600px] md:h-[800px] mb-8 rounded-lg overflow-hidden">
            <Image
              src={bean.image.url}
              alt={bean.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Bean details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Details</h2>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium text-gray-600">Origin</dt>
                <dd>{bean.origin}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Roast Level</dt>
                <dd>{bean.roastLevel}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Flavor Notes</dt>
                <dd>{bean.flavorNotes}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-600">Weight</dt>
                <dd>{bean.weight}g</dd>
              </div>
            </dl>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: bean.description.html }}
            />
          </div>
        </div>
      </article>
    </main>
  );
}
