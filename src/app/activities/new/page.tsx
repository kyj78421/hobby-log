import { Suspense } from "react";
import { createActivity } from "@/app/activities/actions";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { getCategories, isDateString, todayInSeoul } from "@/lib/activities";
import { requireUser } from "@/lib/auth";
import { BlockSkeleton } from "@/components/Skeleton";

export const metadata = { title: "기록하기 · HOBBY LOG" };

export default function NewActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10">
      <h1 className="mb-8 text-[30px] font-bold text-primary-900 sm:text-4xl">기록하기</h1>
      <Suspense fallback={<BlockSkeleton className="h-96" />}>
        <NewForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function NewForm({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  await requireUser("/activities/new");
  const categories = await getCategories();
  return (
    <ActivityForm
      action={createActivity}
      categories={categories}
      initial={{ activity_date: isDateString(date) ? date : todayInSeoul(), hobby_id: "", title: "", content: "", emotion: "", satisfaction: "" }}
      submitLabel="기록 저장하기"
      pendingLabel="저장 중…"
      cancelHref="/activities"
    />
  );
}
