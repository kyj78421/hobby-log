import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HOBBY LOG",
  description: "좋아하는 순간을 기록하고, 나만의 취미 역사를 쌓다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Figma: 개발 폰트 Pretendard Variable 우선 (패키지 추가 없이 스타일시트로 로드) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="app-content flex flex-1 flex-col">{children}</div>
        </div>
      </body>
    </html>
  );
}
