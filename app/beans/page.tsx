import { Bean } from "@/components/bean";
import { getAllCoffeeBeans } from "@/lib/coffee-queries";

export const metadata = {
  title: "Our Coffee Beans | Coffee Roaster",
  description: "Explore our selection of premium, freshly roasted coffee beans from around the world",
};

export default async function BeansPage() {
  const beans = await getAllCoffeeBeans();

  return (
    <main className="min-h-screen py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
          Our Coffee Beans
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Discover our carefully selected coffee beans, roasted to perfection 
          to bring out their unique flavors and characteristics.
        </p>

        {beans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              No beans currently available. Check back soon for new arrivals!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beans.map((bean) => (
              <Bean key={bean.id} {...bean} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}