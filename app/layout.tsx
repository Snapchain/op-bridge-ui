"use client";

import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { WagmiProvider } from "wagmi";
import { config } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <title>Snapchain OP Devnet Interface</title>
        <meta property="og:title" content="Snapchain Devnet Bridge" />
        <meta property="og:url" content="https://tohma.bridge.snapcha.in" />
        <meta
          property="og:image"
          content="https://snapchain.dev/images/Group-3.png"
        />
        <meta
          name="description"
          content="Bridge assets to Tohma Devnet from Sepolia"
        />
        <meta name="twitter:title" content="Tohma Devnet Bridge" />
        <meta
          name="twitter:description"
          content="Bridge assets to Tohma Devnet from Sepolia"
        />
        <meta
          name="twitter:image"
          content="https://snapchain.dev/images/Group-3.png"
        />
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
