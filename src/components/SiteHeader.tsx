import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";

export function SiteHeader() {
  return (
    <header className="border-b border-warmNeutral-200 bg-warmNeutral-0">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-5">
        <Link href="/" className="text-lg font-bold tracking-tight text-primary-900">
          HOBBY LOG
        </Link>
        <Suspense fallback={<div className="h-10 w-32" aria-hidden />}>
          <AuthNav />
        </Suspense>
      </div>
    </header>
  );
}

async function AuthNav() {
  const user = await getCurrentUser();

  if (!user) {
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

  return (
    <nav className="flex items-center gap-1 text-[15px] font-semibold sm:gap-2">
      <Link href="/activities" className="rounded-[14px] px-3 py-2.5 text-primary-700 hover:bg-primary-50">
        아카이브
      </Link>
      <Link href="/activities/new" className="rounded-[14px] bg-primary-700 px-3 py-2.5 text-white hover:bg-primary-600 sm:px-4">
        기록하기
      </Link>
      <Link href="/mypage" className="rounded-[14px] px-3 py-2.5 text-primary-700 hover:bg-primary-50">
        마이
      </Link>
    </nav>
  );
}
