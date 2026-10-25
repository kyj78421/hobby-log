import Link from "next/link";
import { Suspense } from "react";
import { BlockSkeleton } from "@/components/Skeleton";
import { getCategories } from "@/lib/activities";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "취미 둘러보기 · HOBBY LOG" };

type SearchParams = Promise<{ category?: string }>;

// 비회원도 볼 수 있는 공개 화면: 취미 대분류와 세부 취미 목록 (읽기 전용)
export default function HobbiesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-10">
      <h1 className="text-[30px] font-bold text-primary-900 sm:text-4xl">취미 둘러보기</h1>
      <Suspense fallback={<BlockSkeleton className="mt-8 h-96" />}>
        <Browse searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

const href = (category?: number) => (category ? `/hobbies?category=${category}` : "/hobbies");

async function Browse({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  let categories;
  try {
    categories = await getCategories();
  } catch {
    return (
      <div role="alert" className="mt-8 rounded-[12px] bg-error-bg px-4 py-4 text-error">
        <p>취미 목록을 불러오지 못했어요.</p>
        <Link href="/hobbies" className="mt-2 inline-block font-semibold underline">
          다시 시도
        </Link>
      </div>
    );
  }
  const user = await getCurrentUser();

  const selected = categories.find((c) => String(c.id) === sp.category);
  const shown = selected ? [selected] : categories;
  const hobbyCount = shown.reduce((n, c) => n + c.hobbies.length, 0);
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-medium ${
      active
        ? "border-primary-500 bg-primary-200 text-primary-800"
        : "border-warmNeutral-200 bg-warmNeutral-0 text-warmNeutral-700 hover:bg-warmNeutral-100"
    }`;

  return (
    <>
      <p className="mt-2 text-warmNeutral-700">
        {selected ? selected.name : "전체"} · 세부 취미 <strong>{hobbyCount}</strong>개
      </p>

      <nav aria-label="취미 분류" className="mt-6 flex flex-wrap gap-2">
        <Link href={href()} className={chip(!selected)} aria-current={!selected ? "true" : undefined}>
          전체
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={href(c.id)}
            className={chip(selected?.id === c.id)}
            aria-current={selected?.id === c.id ? "true" : undefined}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <div className="mt-8 space-y-8">
        {shown.map((c) => (
          <section key={c.id} aria-labelledby={`cat-${c.id}`}>
            <h2 id={`cat-${c.id}`} className="mb-3 text-lg font-bold text-primary-900">
              {c.name} <span className="text-sm font-medium text-warmNeutral-500">{c.hobbies.length}개</span>
            </h2>
            <ul className="flex flex-wrap gap-2">
              {c.hobbies.map((h) => (
                <li
                  key={h.id}
                  className="min-h-11 rounded-full border border-warmNeutral-200 bg-warmNeutral-0 px-4 py-2.5 text-sm font-medium text-warmNeutral-700"
                >
                  {h.name}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-[20px] bg-primary-100 px-6 py-6">
        {user ? (
          <>
            <p className="text-primary-900">마음에 드는 취미를 북마크하고 마이페이지에서 통계를 확인해 보세요.</p>
            <Link
              href="/bookmarks"
              className="mt-4 inline-block rounded-[14px] bg-primary-700 px-5 py-3 text-[15px] font-semibold text-white hover:bg-primary-600"
            >
              취미 북마크하기
            </Link>
          </>
        ) : (
          <>
            <p className="text-primary-900">
              로그인하면 마음에 드는 취미를 북마크하고, 대분류별 북마크 통계를 볼 수 있어요.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/login?next=/bookmarks"
                className="rounded-[14px] bg-primary-700 px-5 py-3 text-[15px] font-semibold text-white hover:bg-primary-600"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-[14px] border border-primary-300 bg-warmNeutral-0 px-5 py-3 text-[15px] font-semibold text-primary-700 hover:bg-primary-50"
              >
                회원가입
              </Link>
            </div>
          </>
        )}
      </section>
    </>
  );
}
