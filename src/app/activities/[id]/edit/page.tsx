import { notFound } from "next/navigation";
import { Suspense } from "react";
import { updateActivity } from "@/app/activities/actions";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { getActivity, getCategories } from "@/lib/activities";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "기록 수정 · HOBBY LOG" };

export default function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10">
      <h1 className="mb-8 text-[30px] font-bold text-primary-900 sm:text-4xl">기록 수정</h1>
      <Suspense fallback={<div className="h-96" aria-busy="true" />}>
        <EditForm params={params} />
      </Suspense>
    </main>
  );
}

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser(`/activities/${id}/edit`);

  const [activity, categories] = await Promise.all([getActivity(id), getCategories()]);
  if (!activity) notFound();

  return (
    <ActivityForm
      action={updateActivity}
      categories={categories}
      initial={{
        id: activity.id,
        activity_date: activity.activity_date,
        hobby_id: String(activity.hobby.id),
        title: activity.title,
        content: activity.content,
        emotion: activity.emotion ?? "",
        satisfaction: activity.satisfaction ? String(activity.satisfaction) : "",
      }}
      submitLabel="저장"
      pendingLabel="저장 중…"
      cancelHref={`/activities/${activity.id}`}
    />
  );
}
