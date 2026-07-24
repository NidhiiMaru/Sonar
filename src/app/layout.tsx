import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SkipLink } from "@/components/shell/SkipLink";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { AppProviders } from "@/components/providers/AppProviders";
import { SITE } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.team }],
  keywords: [
    "ocean monitoring",
    "marine biodiversity",
    "ocean pollution",
    "ghost nets",
    "coral bleaching",
    "AI detection",
    "deep sea",
  ],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    url: SITE.url,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#04070e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col antialiased">
        <AppProviders>
          <SkipLink />
          <div className="print-hide">
            <Header />
          </div>
          <main id="main" className="flex-1 print-hide">
            {children}
          </main>
          <div className="print-hide">
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
