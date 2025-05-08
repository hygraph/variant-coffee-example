import Image from "next/image";
import Link from "next/link";

export function Bean(bean) {
  return (
    <Link href={`/beans/${bean.slug}`} className="group">
      <div className="bg-white overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="relative h-80 w-full">
          <Image
            src={
              bean.image ||
              `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(bean.name)}`
            }
            alt={bean.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{bean.name}</h3>
            <span className="font-medium">{bean.price.toFixed(2)} €</span>
          </div>
          <p className="text-gray-600 mb-3">
            {bean.origin} | {bean.roastLevel}
          </p>
          <p className="text-sm text-gray-500 mb-4">{bean.flavorNotes}</p>
          <div className="flex justify-between items-center">
            <span
              className={`text-sm ${bean.inStock ? "text-green-600" : "text-red-600"}`}
            >
              {bean.inStock ? "In Stock" : "Out of Stock"}
            </span>
            <span className="text-sm text-gray-500">{bean.weight}g</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
