import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const siteUrl = "https://esdraaline.github.io/lista-churrasco-familia";
const previewImage = `${siteUrl}/preview-whatsapp.jpg`;

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Rachides entre amigos",
  description: "Lista mobile para organizar compras e divisão de conta entre família e amigos.",
  openGraph: {
    title: "Rachides entre amigos",
    description: "Lista mobile para organizar compras e divisão de conta entre família e amigos.",
    url: siteUrl,
    siteName: "Rachides entre amigos",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: previewImage,
        width: 1200,
        height: 630,
        alt: "Família reunida em encontro no quintal",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rachides entre amigos",
    description: "Lista mobile para organizar compras e divisão de conta entre família e amigos.",
    images: [previewImage],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${dmSans.variable} ${fraunces.variable}`}>{children}</body>
    </html>
  );
}
