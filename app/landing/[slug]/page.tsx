import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLandingPageBySlug } from "@/lib/landing-page-queries";
import { applyVariant, getSegment, getVariantId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Args = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ segment?: string; variant?: string }>;
};

// Generate metadata for the page
export async function generateMetadata({ params, searchParams }: Args) {
  const segment = await getSegment(searchParams);
  const variantId = await getVariantId(searchParams);
  const { slug } = await params;
  let landingPage = await getLandingPageBySlug(slug, segment, variantId);

  if (!landingPage) {
    return {
      title: "Page Not Found",
      description: "The requested page could not be found.",
    };
  }

  landingPage = applyVariant(landingPage);

  return {
    title: landingPage.metaTitle || `${landingPage.title} | Coffee Roaster`,
    description:
      landingPage.metaDescription ||
      "Discover our latest coffee offerings and promotions",
  };
}

export default async function LandingPage({ params, searchParams }: Args) {
  const segment = await getSegment(searchParams);
  const variantId = await getVariantId(searchParams);
  const { slug } = await params;
  let landingPage = await getLandingPageBySlug(slug, segment, variantId);

  if (!landingPage) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="mb-8 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center text-foreground hover:text-foreground/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  landingPage = applyVariant(landingPage);

  const hero = landingPage.hero;
  const featuredProducts = landingPage.featuredProducts || [];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      {hero && (
        <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            {hero.background?.url ? (
              <Image
                src={hero.background.url}
                alt={hero.title}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-stone-900 to-stone-950" />
            )}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex flex-col justify-center items-start px-6 md:px-12 lg:px-24">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 tracking-tight">
                {hero.title}
              </h1>
              {hero.slogan && (
                <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                  {hero.slogan}
                </p>
              )}
              {hero.buttonText && hero.buttonUrl && (
                <Link
                  href={hero.buttonUrl}
                  className="inline-flex items-center gap-2 bg-white text-stone-900 px-8 py-4 font-semibold text-lg hover:bg-white/90 transition-colors rounded-md"
                >
                  {hero.buttonText}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      {landingPage.content?.html && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div
              className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-blockquote:border-amber-600 prose-blockquote:text-foreground/70"
              dangerouslySetInnerHTML={{ __html: landingPage.content.html }}
            />
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Featured Products
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {product.image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={product.image.thumbnailUrl || product.image.url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {product.name}
                    </CardTitle>
                    <CardDescription>
                      {product.origin} · {product.roastLevel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.flavorNotes}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <span className="text-lg font-bold">
                      €{product.price.toFixed(2)}
                    </span>
                    <Link href={`/beans/${product.slug}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {landingPage.ctaButtonText && landingPage.ctaButtonUrl && (
        <section className="py-20 md:py-28 bg-gradient-to-r from-amber-900 to-stone-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Don&apos;t miss out on this exclusive offer. Order now and taste
              the difference.
            </p>
            <Link
              href={landingPage.ctaButtonUrl}
              className="inline-flex items-center gap-2 bg-white text-stone-900 px-10 py-4 font-semibold text-lg hover:bg-white/90 transition-colors rounded-md"
            >
              {landingPage.ctaButtonText}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

