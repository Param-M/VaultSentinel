import "./globals.css";
import type { Metadata } from "next";
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"], variable: "--font-space-grotesk" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Vault Sentinel - Modern Security",
  description: "Deploy the Kinetic Fortress. A high-precision digital security infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <body className={`${inter.className} ${spaceGrotesk.variable} ${inter.variable} ${playfair.variable} text-foreground overflow-x-hidden min-h-screen bg-transparent`}>
        {children}
      </body>
    </html>
  );
}
