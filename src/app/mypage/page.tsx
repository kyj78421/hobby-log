import { Suspense } from "react";
import { LogoutButton } from "@/components/nav/LogoutButton";
import { BlockSkeleton } from "@/components/Skeleton";
import Link from "next/link";
import { countActivities, getCategories, getMyHobbyIds } from "@/lib/activities";
import { buildBookmarkStats, getMyBookmarkIds } from "@/lib/bookmarks";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "마이페이지 · HOBBY LOG" };

export default function MyPage() {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10">
      <h1 className="mb-8 text-[30px] font-bold text-primary-900 sm:text-4xl">마이페이지</h1>
      <Suspense fallback={<BlockSkeleton />}>
        <Profile />
      </Suspense>
    </main>
  );
}

async function Profile() {
  const user = await requireUser("/mypage");
  let hobbyNames: string[] | null = [];
  try {
    const [ids, categories] = await Promise.all([getMyHobbyIds(), getCategories()]);
    hobbyNames = categories.flatMap((c) => c.hobbies).filter((h) => ids.includes(h.id)).map((h) => h.name);
  } catch {
    hobbyNames = null;
  }
  let total: number | null = null;
  try {
    total = await countActivities();
  } catch {
    total = null;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-6">
        <h2 className="text-sm font-medium text-warmNeutral-500">계정</h2>
        <p className="mt-1 break-all text-lg text-warmNeutral-900">{user.email}</p>
      </section>
      <section className="rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-6">
        <h2 className="text-sm font-medium text-warmNeutral-500">누적 기록</h2>
        <p className="mt-1 text-lg text-warmNeutral-900">
          {total === null ? "기록 수를 불러오지 못했어요." : `${total}개`}
        </p>
      </section>
      <Suspense fallback={<BlockSkeleton className="h-56" />}>
        <BookmarkStats />
      </Suspense>
      <section className="rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-6">
        <h2 className="text-sm font-medium text-warmNeutral-500">관심 취미</h2>
        {hobbyNames === null ? (
          <p className="mt-1 text-warmNeutral-700">관심 취미를 불러오지 못했어요.</p>
        ) : hobbyNames.length === 0 ? (
          <div className="mt-1">
            <p className="text-warmNeutral-700">아직 관심 취미를 설정하지 않았어요.</p>
            <Link href="/onboarding" className="mt-3 inline-block rounded-[14px] bg-primary-700 px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-primary-600">
              취미 설정하기
            </Link>
          </div>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {hobbyNames.map((n) => (
              <li key={n} className="rounded-full bg-primary-100 px-3 py-1 text-sm text-primary-800">
                {n}
              </li>
            ))}
          </ul>
        )}
        {hobbyNames && hobbyNames.length > 0 && (
          <Link href="/onboarding" className="mt-4 inline-block text-sm font-semibold text-primary-700 underline">
            관심 취미 변경
          </Link>
        )}
      </section>
      <LogoutButton className="h-12 w-full rounded-[14px] border border-primary-300 bg-warmNeutral-0 text-[15px] font-semibold text-primary-700 hover:bg-primary-50" />
    </div>
  );
}

// 취미 북마크 통계: 전체 북마크 수와 대분류별 북마크 수 (합계는 항상 일치)
async function BookmarkStats() {
  const box = "rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-6";
  let stats;
  try {
    const [ids, categories] = await Promise.all([getMyBookmarkIds(), getCategories()]);
    stats = buildBookmarkStats(categories, ids);
  } catch {
    return (
      <section className={box}>
        <h2 className="text-sm font-medium text-warmNeutral-500">북마크 통계</h2>
        <div role="alert" className="mt-2 text-error">
          <p>북마크 통계를 불러오지 못했어요.</p>
          <Link href="/mypage" className="mt-1 inline-block font-semibold underline">
            다시 시도
          </Link>
        </div>
      </section>
    );
  }

  const max = Math.max(1, ...stats.byCategory.map((c) => c.count));
  return (
    <section className={box} aria-labelledby="bookmark-stats">
      <div className="flex items-baseline justify-between">
        <h2 id="bookmark-stats" className="text-sm font-medium text-warmNeutral-500">
          북마크 통계
        </h2>
        <Link href="/bookmarks" className="text-sm font-semibold text-primary-700 underline">
          북마크 관리
        </Link>
      </div>
      <p className="mt-1 text-lg text-warmNeutral-900">
        전체 <strong data-testid="bookmark-total">{stats.total}</strong>개
      </p>
      {stats.total === 0 ? (
        <div className="mt-3">
          <p className="text-warmNeutral-700">아직 북마크한 취미가 없어요.</p>
          <Link
            href="/bookmarks"
            className="mt-3 inline-block rounded-[14px] bg-primary-700 px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-primary-600"
          >
            취미 북마크하기
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {stats.byCategory.map((c) => (
            <li key={c.id} data-category={c.id}>
              <div className="flex items-center justify-between text-sm">
                <span className={c.count > 0 ? "text-warmNeutral-900" : "text-warmNeutral-500"}>{c.name}</span>
                <span className="font-semibold tabular-nums text-primary-900">{c.count}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-warmNeutral-100" aria-hidden>
                <div className="h-2 rounded-full bg-primary-500" style={{ width: `${(c.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
