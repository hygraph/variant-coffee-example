import type React from "react";
import Script from "next/script";
import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicYieldProvider } from "@/components/dynamic-yield-provider";

const inter = Inter({ subsets: ["latin"] });

// Dynamic Yield Section ID
const DY_SECTION_ID = process.env.NEXT_PUBLIC_DY_SECTION_ID;

export const metadata = {
  title: "Coffee Roaster | Premium Coffee Beans",
  description: "Specialty coffee beans roasted to perfection",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Dynamic Yield Scripts */}
        {DY_SECTION_ID && (
          <>
            <Script
              id="dy-api-static"
              src={`https://cdn.dynamicyield.com/api/${DY_SECTION_ID}/api_static.js`}
              strategy="beforeInteractive"
            />
            <Script
              id="dy-api-dynamic"
              src={`https://cdn.dynamicyield.com/api/${DY_SECTION_ID}/api_dynamic.js`}
              strategy="afterInteractive"
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        > */}
        <DynamicYieldProvider>
          <Header />
          {children}
          <Footer />
        </DynamicYieldProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
