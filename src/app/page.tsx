import Link from "next/link";
import { Suspense } from "react";
import { ActivityCard } from "@/components/activities/ActivityCard";
import {
  countActivities,
  countActivitiesBetween,
  getCategories,
  getPhotoUrlMap,
  listActivities,
  todayInSeoul,
  type ActivityListItem,
} from "@/lib/activities";
import { monthRange } from "@/lib/calendar";
import { BlockSkeleton, CardListSkeleton } from "@/components/Skeleton";
import { getCurrentUser } from "@/lib/auth";
import { categoryIcon } from "@/lib/category-icons";

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
      <div className="space-y-10">
        <HomeHero />
        <HobbyShortcuts />
      </div>
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
    <div className="space-y-10">
      <HomeHero />
      <HobbyShortcuts />

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

const ctaBase =
  "flex h-14 w-full items-center justify-between rounded-[14px] px-5 text-[17px] font-semibold sm:max-w-md";

// 모바일 홈 상단: 제목과 두 개의 CTA (세로 배치). 비회원이 '기록하기'를 누르면 로그인 후 작성 화면으로 돌아온다.
function HomeHero() {
  return (
    <section className="pt-4 sm:pt-8">
      <h1 className="text-[34px] font-bold leading-tight text-primary-900 sm:text-5xl">
        <span className="bg-[linear-gradient(transparent_72%,var(--color-primary-200)_72%)]">나의 취미 기록장</span>
      </h1>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/activities/new" className={`${ctaBase} bg-primary-700 text-white hover:bg-primary-600`}>
          <span className="flex items-center gap-3">
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z" />
            </svg>
            기록하기
          </span>
          <Chevron />
        </Link>
        <Link
          href="/hobbies"
          className={`${ctaBase} border border-primary-500 bg-warmNeutral-0 text-primary-800 hover:bg-primary-50`}
        >
          <span className="flex items-center gap-3">
            <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
              <path d="M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z" />
            </svg>
            취미 둘러보기
          </span>
          <Chevron />
        </Link>
      </div>
    </section>
  );
}

function Chevron() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

// 취미 바로가기: 실제 대분류 데이터. 누르면 둘러보기에서 해당 대분류가 선택된 상태로 열린다.
function HobbyShortcuts() {
  return (
    <Suspense fallback={<BlockSkeleton className="h-40" />}>
      <ShortcutList />
    </Suspense>
  );
}

async function ShortcutList() {
  let categories;
  try {
    categories = await getCategories();
  } catch {
    return null; // 바로가기만 생략하고 나머지 홈 화면은 그대로 보여 준다
  }
  return (
    <section aria-labelledby="home-shortcuts">
      <div className="flex items-center justify-between">
        <h2 id="home-shortcuts" className="text-xl font-bold text-primary-900">
          취미 바로가기
        </h2>
        <Link href="/hobbies" className="flex min-h-11 items-center text-sm font-semibold text-primary-700">
          더보기 <span aria-hidden>›</span>
        </Link>
      </div>
      <ul className="mt-2 grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-9">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/hobbies?category=${c.id}`}
              className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-[16px] border border-warmNeutral-200 bg-warmNeutral-0 px-1.5 py-2.5 text-center text-warmNeutral-700 hover:bg-warmNeutral-100"
            >
              <span aria-hidden className="text-2xl leading-none">
                {categoryIcon(c.id)}
              </span>
              <span className="break-keep text-[13px] font-semibold leading-tight">
                {c.name.split(" · ").map((part, i, arr) => (
                  <span key={i} className="block">
                    {part}
                    {i < arr.length - 1 ? " ·" : ""}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
