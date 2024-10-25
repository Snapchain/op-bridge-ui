"use client";

import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { WagmiProvider } from "wagmi";
import { config } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Metadata } from "next";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const queryClient = new QueryClient();

const title = "Tohma Devnet Bridge";
const description = "Bridge assets to Tohma Devnet from Sepolia";
const url = "https://tohma.bridge.snapcha.in";
const imageUrl = "/logo-card.png";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url,
    siteName: title,
    images: [
      {
        url: imageUrl,
        width: 2048,
        height: 1170,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [imageUrl],
  },
  other: {
    "telegram:title": title,
    "telegram:description": description,
    "telegram:image": imageUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <title>Tohma Devnet Bridge</title>
        <meta property="og:title" content="Tohma Devnet Bridge" />
        <meta property="og:url" content="https://tohma.bridge.snapcha.in" />
        <meta property="og:image" content="/logo-card.png" />
        <meta
          name="description"
          content="Bridge assets to Tohma Devnet from Sepolia"
        />
        <meta name="twitter:title" content="Tohma Devnet Bridge" />
        <meta
          name="twitter:description"
          content="Bridge assets to Tohma Devnet from Sepolia"
        />
        <meta name="twitter:image" content="/logo-card.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="index, follow" />
        <meta name="supported-color-schemes" content="dark only" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {config ? (
              <WagmiProvider config={config}>{children}</WagmiProvider>
            ) : (
              children
            )}
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
