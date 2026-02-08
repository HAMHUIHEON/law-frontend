// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { GlobalDisclaimerFooter } from "./components/GlobalDisclaimerFooter";
import Script from "next/script";
import { CompanyInfoFooter } from "./components/CompanyInfoFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LAPIS NEXUS",
  description:
    "Where thought flows, sharpens, and extends — LAPIS NEXUS는 생각의 흐름 속에서 사고를 정제하고 확장하는 전략적 사고 도구입니다.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.iamport.kr/v1/iamport.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <div style={{ minHeight: "100vh" }}>
            {children}
            <CompanyInfoFooter />
            <GlobalDisclaimerFooter />
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
