import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-12">
      <Suspense fallback={<div className="h-64" aria-hidden />}>
        <HomeContent />
      </Suspense>
    </main>
  );
}

async function HomeContent() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <section className="rounded-[28px] bg-primary-200 px-6 py-16 sm:px-12">
        <h1 className="max-w-xl font-serif text-4xl font-bold leading-tight text-primary-900 sm:text-5xl">
          좋아하는 순간을 기록하고, 나만의 취미 역사를 쌓다
        </h1>
        <p className="mt-4 max-w-md text-lg text-warmNeutral-700">
          취미 캘린더 × 사진 일기 × 감정 기록 × 개인 아카이브
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-[14px] bg-primary-700 px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-primary-600"
        >
          시작하기
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] bg-primary-200 px-6 py-16 sm:px-12">
      <h1 className="text-3xl font-bold text-primary-900">안녕하세요!</h1>
      <p className="mt-3 text-lg text-warmNeutral-700">{user.email}으로 로그인했어요.</p>
    </section>
  );
}
