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

// 비회원에게만 로그인/회원가입 버튼을 보여준다.
async function GuestNav() {
  const user = await getCurrentUser();
  if (user) return null;
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
