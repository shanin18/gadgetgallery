import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: {
    default: "GadgetGallery | Gadgets, Accessories and Everyday Tech",
    template: "%s | GadgetGallery"
  },
  description: "Shop earphones, coolers, headphones, memory cards and useful gadgets in BDT.",
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased`} suppressHydrationWarning>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </SessionProvider>
      </body>
    </html>
  );
}
