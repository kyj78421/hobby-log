import Link from "next/link";
import { Suspense } from "react";
import { ActivityCard } from "@/components/activities/ActivityCard";
import {
  countActivities,
  countActivitiesBetween,
  getPhotoUrlMap,
  listActivities,
  todayInSeoul,
  type ActivityListItem,
} from "@/lib/activities";
import { monthRange } from "@/lib/calendar";
import { BlockSkeleton, CardListSkeleton } from "@/components/Skeleton";
import { getCurrentUser } from "@/lib/auth";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-12">
      <Suspense
        fallback={
          <div className="space-y-8">
            <BlockSkeleton className="h-44" />
            <div className="grid grid-cols-2 gap-4">
              <BlockSkeleton className="h-24" />
              <BlockSkeleton className="h-24" />
            </div>
            <CardListSkeleton />
          </div>
        }
      >
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
        <h1 className="max-w-xl text-[36px] font-bold leading-[1.18] text-primary-900 sm:text-5xl">
          좋아하는 순간을 기록하고, 나만의 취미 역사를 쌓다
        </h1>
        <p className="mt-4 max-w-md text-lg text-warmNeutral-700">
          사진 한 장, 짧은 글, 오늘의 감정.
          <br />
          흩어져 있던 취미의 순간을 한곳에 모아보세요.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-block rounded-[14px] bg-primary-700 px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-primary-600"
          >
            내 첫 기록 시작하기
          </Link>
          <Link
            href="/hobbies"
            className="inline-block rounded-[14px] border border-primary-500 bg-warmNeutral-0/60 px-6 py-3.5 text-[15px] font-semibold text-primary-800 hover:bg-warmNeutral-0"
          >
            취미 둘러보기
          </Link>
        </div>
      </section>
    );
  }

  return <Dashboard />;
}

async function Dashboard() {
  const today = todayInSeoul();
  const { from, to } = monthRange(today.slice(0, 7));
  let total = 0;
  let thisMonth = 0;
  let recent: ActivityListItem[] = [];
  let photoUrls: Record<string, string> = {};
  let failed = false;
  try {
    [total, thisMonth, recent] = await Promise.all([
      countActivities(),
      countActivitiesBetween(from, to),
      listActivities({ limit: 5 }),
    ]);
    photoUrls = await getPhotoUrlMap(recent);
  } catch {
    failed = true;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] bg-primary-200 px-6 py-8 sm:px-10 sm:py-10">
        <h1 className="text-2xl font-bold text-primary-900 sm:text-3xl">오늘, 어떤 순간이 좋았나요?</h1>
        <p className="mt-2 text-warmNeutral-700">작은 취미도 오래 기억할 수 있도록.</p>
        <Link
          href="/activities/new"
          className="mt-6 flex h-12 items-center justify-center rounded-[14px] bg-primary-700 px-6 text-[15px] font-semibold text-white hover:bg-primary-600 sm:inline-flex"
        >
          오늘 기록하기
        </Link>
      </section>

      {failed ? (
        <div role="alert" className="rounded-[12px] bg-error-bg px-4 py-4 text-error">
          <p>기록을 불러오지 못했어요.</p>
          <Link href="/" className="mt-2 inline-block font-semibold underline">
            다시 시도
          </Link>
        </div>
      ) : (
        <>
          <section aria-label="활동 요약" className="grid grid-cols-2 gap-4">
            <div className="rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-5">
              <p className="text-sm text-warmNeutral-500">전체 기록</p>
              <p className="mt-1 text-3xl font-bold text-primary-900">{total} 회</p>
            </div>
            <div className="rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-5">
              <p className="text-sm text-warmNeutral-500">이번 달 활동</p>
              <p className="mt-1 text-3xl font-bold text-primary-900">{thisMonth} 회</p>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-[24px] font-bold text-primary-900">최근 남긴 순간</h2>
              <Link href="/activities" className="text-sm font-semibold text-primary-700 underline">
                전체 기록 보기
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="mt-4 rounded-[20px] border border-dashed border-warmNeutral-300 px-6 py-12 text-center">
                <p className="text-warmNeutral-900">아직 기록이 없어요. 좋아하는 순간을 처음으로 남겨보세요.</p>
                <Link
                  href="/activities/new"
                  className="mt-5 inline-block rounded-[14px] bg-primary-700 px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-primary-600"
                >
                  첫 기록 남기기
                </Link>
              </div>
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
        </>
      )}
    </div>
  );
}
