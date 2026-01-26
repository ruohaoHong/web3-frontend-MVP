import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Web3 Frontend MVP",
  description: "A minimal, resume-ready Web3 frontend MVP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-zinc-900">
        <Header />
        <main className="py-10">{children}</main>
      </body>
    </html>
  );
}
