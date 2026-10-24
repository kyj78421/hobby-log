import Link from "next/link";
import { Suspense } from "react";
import { ActivityCard } from "@/components/activities/ActivityCard";
import { getCategories, getPhotoUrlMap, listActivities } from "@/lib/activities";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "아카이브 · HOBBY LOG" };

type SearchParams = Promise<{ category?: string; sort?: string; deleted?: string }>;

export default function ArchivePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-10">
      <Suspense fallback={<div className="h-64" aria-busy="true" />}>
        <Archive searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

function href(category?: number, sort?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", String(category));
  if (sort === "asc") params.set("sort", "asc");
  const qs = params.toString();
  return qs ? `/activities?${qs}` : "/activities";
}

async function Archive({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  await requireUser("/activities");

  const categories = await getCategories();
  const categoryId = categories.find((c) => String(c.id) === sp.category)?.id;
  const sort = sp.sort === "asc" ? "asc" : "desc";

  let activities;
  try {
    activities = await listActivities({ categoryId, sort });
  } catch {
    return (
      <p role="alert" className="rounded-[12px] bg-error-bg px-4 py-3 text-error">
        기록을 불러오지 못했어요. 새로고침해 다시 시도해 주세요.
      </p>
    );
  }

  const photoUrls = await getPhotoUrlMap(activities);
  const filtered = categoryId !== undefined;
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium ${
      active
        ? "border-primary-500 bg-primary-200 text-primary-800"
        : "border-warmNeutral-200 bg-warmNeutral-0 text-warmNeutral-700 hover:bg-warmNeutral-100"
    }`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-primary-900 sm:text-4xl">아카이브</h1>
          <p className="mt-1 text-warmNeutral-500">
            {filtered ? "조건에 맞는 기록" : "전체 기록"} {activities.length}개
          </p>
        </div>
        <Link
          href="/activities/new"
          className="rounded-[14px] bg-primary-700 px-5 py-3 text-[15px] font-semibold text-white hover:bg-primary-600"
        >
          기록하기
        </Link>
      </div>

      {sp.deleted && (
        <p role="status" className="mt-6 rounded-[12px] bg-success-bg px-4 py-3 text-sm text-success">
          기록을 삭제했어요.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link href={href(undefined, sort)} className={chip(!filtered)} aria-current={!filtered}>
          전체
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={href(c.id, sort)} className={chip(categoryId === c.id)} aria-current={categoryId === c.id}>
            {c.name}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm">
        <Link href={href(categoryId, "desc")} className={sort === "desc" ? "font-semibold text-primary-800" : "text-warmNeutral-500"}>
          최신순
        </Link>
        <Link href={href(categoryId, "asc")} className={sort === "asc" ? "font-semibold text-primary-800" : "text-warmNeutral-500"}>
          오래된순
        </Link>
        {filtered && (
          <Link href={href(undefined, sort)} className="ml-auto text-primary-700 underline">
            필터 초기화
          </Link>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="mt-10 rounded-[20px] border border-dashed border-warmNeutral-300 px-6 py-16 text-center">
          {filtered ? (
            <>
              <p className="text-warmNeutral-900">이 분류의 기록이 아직 없어요.</p>
              <Link href={href(undefined, sort)} className="mt-4 inline-block text-primary-700 underline">
                필터 초기화
              </Link>
            </>
          ) : (
            <>
              <p className="text-warmNeutral-900">아직 기록이 없어요. 오늘의 취미를 첫 잎으로 남겨보세요.</p>
              <Link
                href="/activities/new"
                className="mt-6 inline-block rounded-[14px] bg-primary-700 px-6 py-3.5 text-[15px] font-semibold text-white hover:bg-primary-600"
              >
                첫 기록 작성하기
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <li key={a.id}>
              <ActivityCard activity={a} photoUrl={a.photo_path ? photoUrls[a.photo_path] : undefined} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
