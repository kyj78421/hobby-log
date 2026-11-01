import type { MetadataRoute } from "next";

// 홈 화면에 추가했을 때 쓰는 웹 앱 정보. 색은 디자인 가이드의 브랜드 컬러(#668568)와 배경(#FAF9F6).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HOBBY LOG",
    short_name: "HOBBY LOG",
    description: "좋아하는 순간을 기록하고, 나만의 취미 역사를 쌓다.",
    lang: "ko",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF9F6",
    theme_color: "#668568",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
