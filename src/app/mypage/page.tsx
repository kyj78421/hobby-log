import { Suspense } from "react";
import { LogoutButton } from "@/components/nav/LogoutButton";
import { BlockSkeleton } from "@/components/Skeleton";
import Link from "next/link";
import { countActivities, getCategories, getMyHobbyIds } from "@/lib/activities";
import { buildBookmarkStats, getMyBookmarkIds } from "@/lib/bookmarks";
import { requireUser, requireUserWhile } from "@/lib/auth";

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
  // 로그인 확인·관심 취미·누적 기록 수는 서로 독립이라 동시에 조회한다. 각 조회의 실패 처리는 그대로다.
  const loaded = await requireUserWhile(
    "/mypage",
    Promise.allSettled([Promise.all([getMyHobbyIds(), getCategories()]), countActivities()]),
  );
  const user = await requireUser("/mypage"); // 같은 요청 안에서 이미 확인한 결과를 재사용한다
  const [hobbyResult, countResult] = loaded.status === "fulfilled" ? loaded.value : [];
  let hobbyNames: string[] | null = null;
  if (hobbyResult?.status === "fulfilled") {
    const [ids, categories] = hobbyResult.value;
    // 한 취미가 여러 대분류에 있어도 한 번만 보여 준다.
    const byId = new Map(categories.flatMap((c) => c.hobbies).map((h) => [h.id, h.name]));
    hobbyNames = ids.filter((id) => byId.has(id)).map((id) => byId.get(id) as string);
  }
  const total: number | null = countResult?.status === "fulfilled" ? countResult.value : null;

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
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-primary-700">
          {hobbyNames && hobbyNames.length > 0 && (
            <Link href="/onboarding" className="underline">
              관심 취미 변경
            </Link>
          )}
          <Link href="/my-hobbies" className="underline">
            내가 만든 취미 관리
          </Link>
        </div>
      </section>
      <LogoutButton className="h-12 w-full rounded-[14px] border border-primary-300 bg-warmNeutral-0 text-[15px] font-semibold text-primary-700 hover:bg-primary-50" />
    </div>
  );
}

// 취미 북마크 통계: 전체 북마크 수(중복 없음)와 대분류별 북마크 수(여러 대분류에 속한 취미는 각 대분류에 포함)
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
      {stats.total > 0 && (
        <p className="mt-4 text-xs text-warmNeutral-500">
          한 취미가 여러 대분류에 속하면 각 대분류에 함께 세어져서, 대분류별 합계가 전체보다 클 수 있어요.
        </p>
      )}
    </section>
  );
}
