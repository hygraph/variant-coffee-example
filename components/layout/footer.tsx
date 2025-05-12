import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { cookies } from "next/headers";
import { DebugMenu } from "./debug-menu";

export default async function Footer() {
  const cookieStore = await cookies();
  const cookieSegment = cookieStore.get("segment");

  const currentSegment = cookieSegment?.value || "";

  return (
    <>
      <DebugMenu segment={currentSegment} />

      <footer className="bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 - About */}
            <div>
              <h3 className="text-lg font-bold mb-4">ABOUT US</h3>
              <p className="text-gray-300 mb-4">
                We source, roast, and sell outstanding coffees. Working fairly
                and transparently with our network of coffee producers.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="https://instagram.com"
                  className="text-gray-300 hover:text-white"
                >
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link
                  href="https://facebook.com"
                  className="text-gray-300 hover:text-white"
                >
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link
                  href="https://twitter.com"
                  className="text-gray-300 hover:text-white"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">QUICK LINKS</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/beans"
                    className="text-gray-300 hover:text-white"
                  >
                    Coffee
                  </Link>
                </li>
                <li>
                  <Link
                    href="/articles"
                    className="text-gray-300 hover:text-white"
                  >
                    Articles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-white"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-300 hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Customer Service */}
            <div>
              <h3 className="text-lg font-bold mb-4">CUSTOMER SERVICE</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="text-gray-300 hover:text-white"
                  >
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-300 hover:text-white"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-300 hover:text-white"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Newsletter */}
            <div>
              <h3 className="text-lg font-bold mb-4">NEWSLETTER</h3>
              <p className="text-gray-300 mb-4">
                Subscribe to our newsletter for updates on new coffees, brewing
                tips, and special offers.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 w-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-white"
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-black px-4 py-2 font-medium hover:bg-gray-200 transition-colors"
                >
                  SIGN UP
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} Coffee Roaster. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
