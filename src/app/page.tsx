import Link from "next/link";
import { Suspense } from "react";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { countActivities, getPhotoUrlMap, listActivities, type ActivityListItem } from "@/lib/activities";
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

  return <Dashboard email={user.email} />;
}

async function Dashboard({ email }: { email: string }) {
  let total = 0;
  let recent: ActivityListItem[] = [];
  let photoUrls: Record<string, string> = {};
  let failed = false;
  try {
    [total, recent] = await Promise.all([countActivities(), listActivities({ limit: 5 })]);
    photoUrls = await getPhotoUrlMap(recent);
  } catch {
    failed = true;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] bg-primary-200 px-6 py-10 sm:px-12 sm:py-14">
        <p className="text-sm text-primary-800">{email}</p>
        <h1 className="mt-2 text-3xl font-bold text-primary-900 sm:text-4xl">안녕하세요!</h1>
        {!failed && (
          <p className="mt-3 text-lg text-warmNeutral-700">
            지금까지 <strong className="text-primary-900">{total}개</strong>의 기록을 남겼어요.
          </p>
        )}
        <Link
          href="/activities/new"
          className="mt-8 inline-block rounded-[14px] bg-primary-700 px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-primary-600"
        >
          오늘 기록하기
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-bold text-primary-900">최근 기록</h2>
          <Link href="/activities" className="text-sm font-medium text-primary-700 underline">
            전체 보기
          </Link>
        </div>
        {failed ? (
          <p role="alert" className="mt-4 rounded-[12px] bg-error-bg px-4 py-3 text-error">
            기록을 불러오지 못했어요. 새로고침해 다시 시도해 주세요.
          </p>
        ) : recent.length === 0 ? (
          <p className="mt-4 rounded-[20px] border border-dashed border-warmNeutral-300 px-6 py-12 text-center text-warmNeutral-900">
            아직 기록이 없어요. 오늘의 취미를 첫 잎으로 남겨보세요.
          </p>
        ) : (
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((a) => (
              <li key={a.id}>
                <ActivityCard activity={a} photoUrl={a.photo_path ? photoUrls[a.photo_path] : undefined} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
