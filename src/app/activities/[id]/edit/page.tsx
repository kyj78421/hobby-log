import { notFound } from "next/navigation";
import { Suspense } from "react";
import { updateActivity } from "@/app/activities/actions";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { getActivity, getCategories, getPhotoUrl } from "@/lib/activities";
import { requireUserWhile } from "@/lib/auth";
import { BlockSkeleton } from "@/components/Skeleton";

export const metadata = { title: "기록 수정 · HOBBY LOG" };

export default function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10">
      <h1 className="mb-8 text-[30px] font-bold text-primary-900 sm:text-4xl">기록 수정</h1>
      <Suspense fallback={<BlockSkeleton className="h-96" />}>
        <EditForm params={params} />
      </Suspense>
    </main>
  );
}

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loaded = await requireUserWhile(`/activities/${id}/edit`, Promise.all([getActivity(id), getCategories()]));
  if (loaded.status === "rejected") throw loaded.reason;
  const [activity, categories] = loaded.value;
  if (!activity) notFound();
  const photoUrl = await getPhotoUrl(activity.photo_path);

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
      currentHobby={{ id: activity.hobby.id, name: activity.hobby.name, categoryId: activity.hobby.category.id }}
      existingPhotoUrl={photoUrl}
      submitLabel="기록 저장하기"
      pendingLabel="저장 중…"
      cancelHref={`/activities/${activity.id}`}
    />
  );
}
