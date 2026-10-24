import { Suspense } from "react";
import { LogoutButton } from "@/components/nav/LogoutButton";
import { BlockSkeleton } from "@/components/Skeleton";
import Link from "next/link";
import { countActivities, getCategories, getMyHobbyIds } from "@/lib/activities";
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
