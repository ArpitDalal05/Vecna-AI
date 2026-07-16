import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vecna AI // One Mind. Infinite Intelligence.",
  description: "An enterprise AI operating system where autonomous intelligence converges into one evolving collective consciousness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased bg-[#040404]`}
    >
      <body className="min-h-full flex flex-col bg-[#040404] text-zinc-100 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

