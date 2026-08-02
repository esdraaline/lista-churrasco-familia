import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const siteUrl = "https://lista-churrasco-familia.esdraaline.chatgpt.site";

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
        url: `${siteUrl}/og.png`,
        width: 1402,
        height: 1122,
        alt: "Familia em churrasco no quintal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lista do Churrasco",
    description: "Checklist mobile premium para organizar o churrasco da familia.",
    images: [`${siteUrl}/og.png`],
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
