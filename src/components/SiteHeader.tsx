import Link from "next/link";
import { Suspense } from "react";
import { MemberNav } from "@/components/nav/MemberNav";
import { getCurrentUser } from "@/lib/auth";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-warmNeutral-200 bg-warmNeutral-0">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-5">
        <Link href="/" className="text-lg font-bold tracking-tight text-primary-900">
          HOBBY LOG
        </Link>
        <Suspense fallback={<div className="h-10 w-32" aria-hidden />}>
          <GuestNav />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <MemberShell />
      </Suspense>
    </header>
  );
}

// 비회원에게는 로그인/회원가입 버튼, 회원에게는 모바일용 마이페이지 아이콘을 보여준다.
async function GuestNav() {
  const user = await getCurrentUser();
  if (user) {
    // 회원: 모바일에서는 하단 탭과 별개로 우측 상단에 마이페이지 바로가기를 둔다 (PC는 사이드바 사용)
    return (
      <Link
        href="/mypage"
        aria-label="마이페이지"
        className="flex h-11 w-11 items-center justify-center rounded-full text-primary-900 hover:bg-primary-50 lg:hidden"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      </Link>
    );
  }
  return (
    <nav className="flex items-center gap-2 text-[15px] font-semibold">
      <Link href="/login" className="rounded-[14px] px-4 py-2.5 text-primary-700 hover:bg-primary-50">
        로그인
      </Link>
      <Link href="/signup" className="rounded-[14px] bg-primary-700 px-4 py-2.5 text-white hover:bg-primary-600">
        회원가입
      </Link>
    </nav>
  );
}

// 회원에게만 사이드바(1024+)와 하단 탭(모바일)을 붙인다.
async function MemberShell() {
  const user = await getCurrentUser();
  return user ? <MemberNav /> : null;
}
