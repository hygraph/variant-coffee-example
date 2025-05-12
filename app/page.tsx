import { getHomePageData } from "@/lib/home-queries";
import Hero from "@/components/hero";
import FeaturedCoffee from "@/components/featured-coffee";
import Testimonials from "@/components/testimonials";
import Faqs from "@/components/faqs";
import Link from "next/link";
import { applyVariant } from "@/lib/utils";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string }>;
}) {
  const { segment } = await searchParams;
  // Fetch data from CMS
  let homeData = await getHomePageData(segment);
  console.log(JSON.stringify(homeData.hero.title));
  homeData = applyVariant(homeData);
  console.log(JSON.stringify(homeData.hero.title));
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      {homeData.hero && (
        <Hero
          title={homeData.hero.title}
          slogan={homeData.hero.slogan}
          buttonText={homeData.hero.buttonText}
          buttonUrl={homeData.hero.buttonUrl}
          backgroundImage={homeData.hero.background?.url}
        />
      )}

      {/* Featured Coffee Beans */}
      {homeData.featuredCoffeeBeans && (
        <FeaturedCoffee beans={homeData.featuredCoffeeBeans} />
      )}

      {/* Articles Link Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">COFFEE KNOWLEDGE</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Discover brewing tips, coffee origins, and stories from our roastery
            in our collection of articles.
          </p>
          <Link
            href="/articles"
            className="inline-block border border-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors"
          >
            READ OUR ARTICLES
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      {homeData.testimonials && (
        <Testimonials testimonials={homeData.testimonials} />
      )}

      {/* FAQs */}
      {homeData.faqs && <Faqs faqs={homeData.faqs} />}
    </main>
  );
}
