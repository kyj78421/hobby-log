"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

type Item = { href: string; label: string; sidebarLabel?: string; icon: string; match: (p: string) => boolean; sidebarOnly?: boolean };

// icon: 24x24 선 아이콘 path (currentColor). 모바일 하단 탭은 홈·기록·북마크·마이, 캘린더는 PC 사이드바와 기록 화면에서 연결한다.
const ITEMS: Item[] = [
  { href: "/", label: "홈", icon: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", match: (p) => p === "/" },
  {
    href: "/calendar",
    label: "캘린더",
    icon: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
    sidebarOnly: true,
    match: (p) => p.startsWith("/calendar"),
  },
  {
    href: "/activities",
    label: "기록",
    sidebarLabel: "아카이브",
    icon: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M9 15l2 2 4-4",
    match: (p) => p.startsWith("/activities"),
  },
  {
    href: "/bookmarks",
    label: "북마크",
    icon: "M6 3h12v18l-6-4-6 4z",
    match: (p) => p.startsWith("/bookmarks"),
  },
  {
    href: "/mypage",
    label: "마이",
    sidebarLabel: "마이페이지",
    icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-7 8-7s8 3 8 7",
    match: (p) => p.startsWith("/mypage") || p.startsWith("/onboarding") || p.startsWith("/my-hobbies"),
  },
];
const TABS = ITEMS.filter((i) => !i.sidebarOnly);

// 작성·수정 화면은 하단 탭 대신 저장/취소 바를 쓴다 (Figma 4.H)
const isFormPage = (p: string) => p === "/activities/new" || /^\/activities\/[^/]+\/edit$/.test(p);
const showFab = (p: string) => p === "/activities" || p.startsWith("/calendar");

export function MemberNav() {
  const pathname = usePathname();
  const formPage = isFormPage(pathname);

  return (
    <>
      {/* 1024+ : 240px 사이드바 */}
      <aside
        data-sidebar
        aria-label="주 메뉴"
        className="fixed bottom-0 left-0 top-16 z-20 hidden w-60 flex-col border-r border-warmNeutral-200 bg-warmNeutral-0 p-4 lg:flex"
      >
        <Link
          href="/activities/new"
          className="flex h-12 items-center justify-center rounded-[14px] bg-primary-700 text-[15px] font-semibold text-white hover:bg-primary-600"
        >
          기록하기
        </Link>
        <nav className="mt-6 flex flex-col gap-1">
          {ITEMS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-11 items-center rounded-[12px] px-4 text-[15px] font-medium ${
                  active
                    ? "bg-primary-200 text-primary-900"
                    : "text-warmNeutral-700 hover:bg-warmNeutral-100"
                }`}
              >
                {item.sidebarLabel ?? item.label}
              </Link>
            );
          })}
        </nav>
        <LogoutButton className="mt-auto h-11 rounded-[12px] px-4 text-left text-[15px] font-medium text-warmNeutral-500 hover:bg-warmNeutral-100" />
      </aside>

      {/* 모바일/태블릿: 새 기록 CTA는 탭 위에 고정 */}
      {!formPage && showFab(pathname) && (
        <Link
          href="/activities/new"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+76px)] right-5 z-30 flex h-12 items-center rounded-full bg-primary-700 px-5 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(39,42,39,.16)] hover:bg-primary-600 lg:hidden"
        >
          + 기록하기
        </Link>
      )}

      {/* 모바일/태블릿: 고정 하단 탭 (홈 / 캘린더 / 기록 / 마이) */}
      {!formPage && (
        <nav
          data-bottom-tab
          aria-label="하단 메뉴"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-warmNeutral-200 bg-warmNeutral-0 pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          {TABS.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
                  active ? "text-primary-800" : "text-warmNeutral-500"
                }`}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill={active ? "currentColor" : "none"}
                  fillOpacity={active ? 0.18 : 0}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
