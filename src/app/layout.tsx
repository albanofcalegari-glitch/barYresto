import type { Metadata } from "next";
import { Syne, DM_Sans, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "baryresto",
    template: "%s · baryresto",
  },
  description:
    "Plataforma integral para restaurantes: reservas, carta QR, salón y cobros.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${syne.variable} ${dmSans.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-surface text-th-text-primary">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
