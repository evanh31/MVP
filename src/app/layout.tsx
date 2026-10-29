import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lendz · Executive Sales Outreach",
  description:
    "Leadership analytics hub for Lendz bots that discover LOs, match AEs, and run Outlook outreach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${sans.variable} font-[family-name:var(--font-sans)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
