import type { Metadata, Viewport } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import { ToastProvider } from "@/components/ui/toaster";
import { getDb } from "@/lib/store";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#13262F" };

export async function generateMetadata(): Promise<Metadata> {
  const db = await getDb();
  const image = db.settings.ogImage || "/hvr-mark.png";
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: db.settings.seoTitle, template: `%s | ${db.settings.shortName}` },
    description: db.settings.seoDescription,
    applicationName: db.settings.businessName,
    openGraph: {
      title: db.settings.seoTitle,
      description: db.settings.seoDescription,
      type: "website",
      locale: "en_AU",
      siteName: db.settings.businessName,
      images: [{ url: image, alt: db.settings.businessName }],
    },
    twitter: { card: "summary_large_image", title: db.settings.seoTitle, description: db.settings.seoDescription, images: [image] },
    icons: { icon: "/hvr-icon.svg", apple: "/hvr-mark.png" },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className={`${display.variable} ${body.variable} font-sans antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
