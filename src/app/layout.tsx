import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionKeeper } from "@/components/auth/SessionKeeper";
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
  applicationName: "HOBBY LOG",
  // iOS 홈 화면에 추가했을 때의 이름과 독립 실행(standalone) 설정. 아이콘은 app/apple-icon.png가 자동 연결된다.
  appleWebApp: { capable: true, title: "HOBBY LOG", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  // 오래된 iOS 버전도 홈 화면 앱(standalone)으로 인식하도록 함께 지정한다.
  other: { "apple-mobile-web-app-capable": "yes" },
};

// 브랜드 컬러(#668568)를 주소창·상태 표시줄 색으로 사용하고, 홈 인디케이터 영역까지 화면을 쓴다(하단 탭이 safe-area를 반영함).
export const viewport: Viewport = {
  themeColor: "#668568",
  viewportFit: "cover",
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
        <Suspense fallback={null}>
          <SessionKeeper />
        </Suspense>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <div className="app-content flex flex-1 flex-col">{children}</div>
        </div>
      </body>
    </html>
  );
}
