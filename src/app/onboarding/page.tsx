import { Suspense } from "react";
import { HobbyPicker } from "@/components/HobbyPicker";
import { getCategories, getMyHobbyIds } from "@/lib/activities";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "관심 취미 · HOBBY LOG" };

export default function OnboardingPage() {
  return (
    <main className="mx-auto w-full max-w-[840px] flex-1 px-5 pt-10">
      <h1 className="text-[30px] font-bold text-primary-900 sm:text-4xl">관심 취미를 골라 주세요</h1>
      <p className="mb-8 mt-2 text-warmNeutral-700">
        여러 개를 고를 수 있어요. 고르지 않은 취미도 언제든 기록할 수 있어요.
      </p>
      <Suspense fallback={<div className="h-96" aria-busy="true" />}>
        <Picker />
      </Suspense>
    </main>
  );
}

async function Picker() {
  await requireUser("/onboarding");
  let ids: number[] = [];
  try {
    ids = await getMyHobbyIds();
  } catch {
    // 불러오지 못해도 선택은 새로 할 수 있다.
  }
  const categories = await getCategories();
  return (
    <HobbyPicker categories={categories} initialSelected={ids} skipHref={ids.length ? "/mypage" : "/"} />
  );
}
