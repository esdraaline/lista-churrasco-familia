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
  title: "Lista do Churrasco",
  description: "Checklist mobile premium para organizar o churrasco da familia.",
  openGraph: {
    title: "Lista do Churrasco",
    description: "Checklist mobile premium para organizar o churrasco da familia.",
    url: siteUrl,
    siteName: "Lista do Churrasco",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: previewImage,
        width: 1200,
        height: 630,
        alt: "Familia em churrasco no quintal",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lista do Churrasco",
    description: "Checklist mobile premium para organizar o churrasco da familia.",
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
