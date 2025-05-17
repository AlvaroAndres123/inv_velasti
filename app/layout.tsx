import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "./client-shell"; // ✅ importante

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventario Cosméticos",
  description: "Sistema de control de inventario para cosméticos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="es" suppressHydrationWarning>
  <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden bg-gray-100`}>
    <ClientShell>{children}</ClientShell>
  </body>
</html>

  );
}
