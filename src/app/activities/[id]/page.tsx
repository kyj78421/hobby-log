import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeleteButton } from "@/components/activities/DeleteButton";
import { getEmotion } from "@/lib/emotions";
import { formatDate, getActivity, getPhotoUrl } from "@/lib/activities";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "기록 상세 · HOBBY LOG" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default function ActivityDetailPage({ params, searchParams }: Props) {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-10">
      <Suspense fallback={<div className="h-96" aria-busy="true" />}>
        <Detail params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Detail({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  await requireUser(`/activities/${id}`);

  const activity = await getActivity(id);
  if (!activity) notFound();
  const emotion = getEmotion(activity.emotion);
  const photoUrl = await getPhotoUrl(activity.photo_path);

  return (
    <article>
      <Link href="/activities" className="text-sm text-primary-700 underline">
        ← 아카이브
      </Link>
      {error === "delete" && (
        <p role="alert" className="mt-4 rounded-[12px] bg-error-bg px-4 py-3 text-sm text-error">
          기록을 삭제하지 못했어요. 다시 시도해 주세요.
        </p>
      )}
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={`${activity.title} 사진`}
          className="mt-6 max-h-[560px] w-full rounded-[20px] object-cover"
        />
      )}
      <p className="mt-6 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">
        {activity.hobby.category.name} · {activity.hobby.name}
      </p>
      <h1 className="mt-3 text-[30px] font-bold leading-tight text-primary-900 sm:text-4xl">
        {activity.title}
      </h1>
      <p className="mt-2 text-warmNeutral-500">{formatDate(activity.activity_date)}</p>
      {(emotion || activity.satisfaction) && (
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 rounded-[20px] bg-primary-50 px-5 py-4">
          {emotion && (
            <div>
              <dt className="text-xs font-medium text-warmNeutral-500">감정</dt>
              <dd className="mt-1 text-warmNeutral-900">
                <span aria-hidden className="text-xl">{emotion.emoji}</span> {emotion.label}
              </dd>
            </div>
          )}
          {activity.satisfaction && (
            <div>
              <dt className="text-xs font-medium text-warmNeutral-500">만족도</dt>
              <dd className="mt-1 text-warmNeutral-900" aria-label={`5점 만점에 ${activity.satisfaction}점`}>
                <span aria-hidden className="text-xl text-accent-star">{"★".repeat(activity.satisfaction)}</span>
                <span aria-hidden className="text-xl text-warmNeutral-300">{"★".repeat(5 - activity.satisfaction)}</span>{" "}
                {activity.satisfaction}점
              </dd>
            </div>
          )}
        </dl>
      )}
      <p className="mt-8 whitespace-pre-wrap text-[17px] leading-[1.7] text-warmNeutral-900">
        {activity.content}
      </p>
      <div className="mt-10 flex gap-3">
        <Link
          href={`/activities/${activity.id}/edit`}
          className="flex h-11 items-center rounded-[14px] border border-primary-300 px-5 text-[15px] font-semibold text-primary-700 hover:bg-primary-50"
        >
          수정하기
        </Link>
        <DeleteButton id={activity.id} />
      </div>
    </article>
  );
}
