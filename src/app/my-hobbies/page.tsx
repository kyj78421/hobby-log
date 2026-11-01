import Link from "next/link";
import { Suspense } from "react";
import { MyHobbyManager } from "@/components/hobbies/MyHobbyManager";
import { BlockSkeleton } from "@/components/Skeleton";
import { getCategories, getMyCustomHobbies } from "@/lib/activities";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "내가 만든 취미 · HOBBY LOG" };

export default function MyHobbiesPage() {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10">
      <Link href="/mypage" className="text-sm text-primary-700 underline">
        ← 마이페이지
      </Link>
      <h1 className="mt-4 text-[30px] font-bold text-primary-900 sm:text-4xl">내가 만든 취미</h1>
      <p className="mb-8 mt-2 text-warmNeutral-700">
        기본 목록에 없는 취미를 직접 만들 수 있어요. 나만 볼 수 있어요.
      </p>
      <Suspense fallback={<BlockSkeleton className="h-64" />}>
        <Manager />
      </Suspense>
    </main>
  );
}

async function Manager() {
  await requireUser("/my-hobbies");
  let data;
  try {
    data = await Promise.all([getMyCustomHobbies(), getCategories()]);
  } catch {
    return (
      <div role="alert" className="rounded-[12px] bg-error-bg px-4 py-4 text-error">
        <p>내 취미를 불러오지 못했어요.</p>
        <Link href="/my-hobbies" className="mt-2 inline-block font-semibold underline">
          다시 시도
        </Link>
      </div>
    );
  }
  return <MyHobbyManager hobbies={data[0]} categories={data[1]} />;
}
