import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { SessionProvider } from "next-auth/react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { WishlistProvider } from "@/components/shop/WishlistProvider";
import { RouteLoadingIndicator } from "@/components/layout/RouteLoadingIndicator";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: {
    default: "GadgetGallery | Gadgets, Accessories and Everyday Tech",
    template: "%s | GadgetGallery"
  },
  description: "Shop earphones, coolers, headphones, memory cards and useful gadgets in BDT.",
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://gadgetgallery-alpha.vercel.app"),
  icons: {
    icon: "/favicon.jpg",
    shortcut: "/favicon.jpg",
    apple: "/favicon.jpg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} min-h-screen font-sans antialiased`} suppressHydrationWarning>
        <SessionProvider>
          <WishlistProvider>
            <div className="flex min-h-screen flex-col">
              <Suspense fallback={null}>
                <RouteLoadingIndicator />
              </Suspense>
              <Navbar />
              <main className="flex-1 pt-16">{children}</main>
              <Footer />
              <CartDrawer />
            </div>
          </WishlistProvider>
        </SessionProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
