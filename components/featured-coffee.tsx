import Link from "next/link";

interface RichText {
  raw: any;
  html: string;
}

interface CoffeeBean {
  name: string;
  slug: string;
  price: number;
  description: RichText;
  origin: string;
  roastLevel: string;
  flavorNotes: string;
  weight: number;
  inStock: boolean;
  image?: string;
}

interface FeaturedCoffeeProps {
  beans: CoffeeBean[];
}

export default function FeaturedCoffee({ beans }: FeaturedCoffeeProps) {
  // Function to extract plain text from rich text for preview
  const getPlainText = (richText: RichText) => {
    // If we have HTML, create a temporary div to strip HTML tags
    if (richText?.html) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = richText.html;
      return tempDiv.textContent || tempDiv.innerText || "";
    }
    // Fallback to empty string
    return "";
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          FEATURED COFFEES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {beans.map((bean) => (
            <Bean key={bean.id} {...bean} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/coffee"
            className="inline-block border border-black px-8 py-3 font-medium hover:bg-black hover:text-white transition-colors"
          >
            VIEW ALL COFFEES
          </Link>
        </div>
      </div>
    </section>
  );
}
