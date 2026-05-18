import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LazyCartDrawer } from "@/components/layout/LazyCartDrawer";
import { SessionProvider } from "next-auth/react";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { WishlistProvider } from "@/components/shop/WishlistProvider";
import { RouteLoadingIndicator } from "@/components/layout/RouteLoadingIndicator";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#159083"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} min-h-screen font-sans antialiased`} suppressHydrationWarning>
        <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
          <WishlistProvider>
            <div className="flex min-h-screen flex-col">
              <Suspense fallback={null}>
                <RouteLoadingIndicator />
              </Suspense>
              <Navbar />
              <main className="flex-1 pb-[calc(4.75rem+env(safe-area-inset-bottom))] pt-16 md:pb-0">{children}</main>
              <Footer />
              <LazyCartDrawer />
            </div>
          </WishlistProvider>
        </SessionProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
