import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Property Desk - Pakistan Real Estate CRM",
  description: "Fast, daylight-optimized property lead & listing manager for Pakistani real estate agencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F7FAFC] text-[#1A202C] selection:bg-[#E6F4F0] selection:text-[#0E6B50]">
        {children}
      </body>
    </html>
  );
}
