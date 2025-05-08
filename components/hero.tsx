import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  title: string;
  slogan: string;
  buttonText: string;
  buttonUrl: string;
  backgroundImage: string;
}

export default function Hero({
  title,
  slogan,
  buttonText,
  buttonUrl,
  backgroundImage,
}: HeroProps) {
  return (
    <div className="relative h-[80vh] min-h-[600px] w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage || "/placeholder.svg?height=800&width=1600"}
          alt="Coffee hero image"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-start px-6 md:px-12 lg:px-24">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            {title}
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-lg">{slogan}</p>
          <Link
            href={buttonUrl}
            className="inline-block bg-black text-white px-8 py-3 font-medium hover:bg-gray-900 transition-colors"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
