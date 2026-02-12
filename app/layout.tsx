// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { GlobalDisclaimerFooter } from "./components/GlobalDisclaimerFooter";
import Script from "next/script";
import { CompanyInfoFooter } from "./components/CompanyInfoFooter";
import { UserSync } from "./components/UserSync";

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
    "Where thought flows, sharpens, and extends. LAPIS NEXUS는 조세법과 제도의 구조를 해석하고 판단의 좌표계를 제공하는 전략적 사고 도구입니다. 국제조세조정법, 조세범처벌법, 조세범칙 세무조사 등 고난도 영역에서 리스크의 발생 지점과 판단 구조를 체계적으로 탐색할 수 있도록 설계되었습니다.",
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
          <UserSync />
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
