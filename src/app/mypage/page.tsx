import { Suspense } from "react";
import { logout } from "@/app/(auth)/actions";
import { countActivities } from "@/lib/activities";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "마이페이지 · HOBBY LOG" };

export default function MyPage() {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10">
      <h1 className="mb-8 text-[30px] font-bold text-primary-900 sm:text-4xl">마이페이지</h1>
      <Suspense fallback={<div className="h-64" aria-busy="true" />}>
        <Profile />
      </Suspense>
    </main>
  );
}

async function Profile() {
  const user = await requireUser("/mypage");
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
        <p className="mt-1 text-warmNeutral-700">아직 설정하지 않았어요.</p>
      </section>
      <form action={logout}>
        <button
          type="submit"
          className="h-12 w-full rounded-[14px] border border-primary-300 bg-warmNeutral-0 text-[15px] font-semibold text-primary-700 hover:bg-primary-50"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
