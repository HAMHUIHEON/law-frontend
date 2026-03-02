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
    "세법과 판례 구조를 AI를 활용하여 해석하고 판단의 좌표계를 제공하는 확장형 전략적 사고 시스템입니다. 생성형 AI를 활용하여 법 조문, 판례, 조사 실무를 교차 분석하고, 국제조세조정법·조세범처벌법·범칙 세무조사 등 고난도 영역에서 리스크의 발생 지점과 판단 구조를 다층적으로 구조화합니다.",
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
