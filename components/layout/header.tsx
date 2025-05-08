"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export default function Header() {
  return (
    <header className="relative z-10">
      {/* Main Header */}
      <div className="bg-white/90 backdrop-blur-sm sticky top-0 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Center - Logo */}
            <div className="w-1/3 flex justify-center">
              <Link href="/" className="text-xl font-bold" aria-label="home">
                CofSite
              </Link>
            </div>

            {/* Right - Beans & Account */}
            <div className="w-1/3 flex justify-end items-center space-x-4">
              <Link href="/beans" className="p-2" aria-label="Beans">
                Beans
              </Link>
              {/* Articles link */}
              <Link
                href="/articles"
                className="text-sm font-medium hover:text-gray-600 transition-colors"
              >
                Articles
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
