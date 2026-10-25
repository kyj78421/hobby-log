import Link from "next/link";
import { Suspense } from "react";
import { BookmarkChip } from "@/components/BookmarkChip";
import { BlockSkeleton } from "@/components/Skeleton";
import { getCategories } from "@/lib/activities";
import { requireUser } from "@/lib/auth";
import { buildBookmarkStats, getMyBookmarkIds } from "@/lib/bookmarks";

export const metadata = { title: "취미 북마크 · HOBBY LOG" };

export default function BookmarksPage() {
  return (
    <main className="mx-auto w-full max-w-[840px] flex-1 px-5 py-10">
      <Link href="/mypage" className="text-sm text-primary-700 underline">
        ← 마이페이지
      </Link>
      <h1 className="mt-4 text-[30px] font-bold text-primary-900 sm:text-4xl">취미 북마크</h1>
      <p className="mb-8 mt-2 text-warmNeutral-700">
        마음에 드는 취미를 눌러 북마크하세요. 다시 누르면 해제돼요.
      </p>
      <Suspense fallback={<BlockSkeleton className="h-96" />}>
        <Manager />
      </Suspense>
    </main>
  );
}

async function Manager() {
  await requireUser("/bookmarks");
  let ids: number[];
  let categories;
  try {
    [ids, categories] = await Promise.all([getMyBookmarkIds(), getCategories()]);
  } catch {
    return (
      <div role="alert" className="rounded-[12px] bg-error-bg px-4 py-4 text-error">
        <p>북마크를 불러오지 못했어요.</p>
        <Link href="/bookmarks" className="mt-2 inline-block font-semibold underline">
          다시 시도
        </Link>
      </div>
    );
  }

  const stats = buildBookmarkStats(categories, ids);
  const active = new Set(ids);

  return (
    <div className="space-y-8">
      <p aria-live="polite" className="rounded-[20px] bg-primary-100 px-5 py-4 text-primary-900">
        {stats.total === 0
          ? "아직 북마크한 취미가 없어요. 아래에서 취미를 골라 보세요."
          : `북마크한 취미 ${stats.total}개`}
      </p>
      {categories.map((c) => {
        const count = stats.byCategory.find((s) => s.id === c.id)?.count ?? 0;
        return (
          <section key={c.id} aria-labelledby={`cat-${c.id}`}>
            <h2 id={`cat-${c.id}`} className="mb-3 text-lg font-bold text-primary-900">
              {c.name} <span className="text-sm font-medium text-warmNeutral-500">{count}개</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {c.hobbies.map((h) => (
                <BookmarkChip key={h.id} hobbyId={h.id} name={h.name} active={active.has(h.id)} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
