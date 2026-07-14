import type { Metadata } from "next";
import { Familjen_Grotesk, Fragment_Mono, Young_Serif } from "next/font/google";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import "./globals.css";

const sans = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Young_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const mono = Fragment_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

// Runs before paint so the stored/system theme applies without a flash.
const themeScript = `
try {
  const t = localStorage.getItem("theme");
  if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  }
} catch {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
