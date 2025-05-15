import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Modelo Relacional Pelambres Futuro",
  description: "Dashboard de rédes para análisis y gestión de temas para Pelambres Futuro.",
  openGraph: {
    title: "Modelo Relacional Pelambres Futuro",
    description: "Dashboard de rédes para análisis y gestión de temas para Pelambres Futuro.",
    siteName: "Modelo Relacional Pelambres Futuro",
    images: [
      {
        url: "/images/demo.png",
        width: 1200,
        height: 630,
        alt: "Modelo Relacional Pelambres Futuro",
      }
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard de Redes",
    description: "Dashboard de rédes para análisis y gestión de temas para Pelambres Futuro.",
    images: ["/images/demo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
