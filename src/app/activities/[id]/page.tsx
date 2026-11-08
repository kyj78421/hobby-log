import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DeleteButton } from "@/components/activities/DeleteButton";
import { getEmotion } from "@/lib/emotions";
import { formatDate, getActivity, getPhotoUrl } from "@/lib/activities";
import { requireUserWhile } from "@/lib/auth";
import { BlockSkeleton } from "@/components/Skeleton";
import { FlashMessage } from "@/components/FlashMessage";

export const metadata = { title: "기록 상세 · HOBBY LOG" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
};

export default function ActivityDetailPage({ params, searchParams }: Props) {
  return (
    <main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-8 sm:py-10">
      <Suspense fallback={<BlockSkeleton className="h-96" />}>
        <Detail params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

const menuButton =
  "flex h-10 items-center rounded-[12px] border border-primary-300 px-4 text-sm font-semibold text-primary-700 hover:bg-primary-50";
const menuDelete =
  "h-10 rounded-[12px] border border-error px-4 text-sm font-semibold text-error hover:bg-error-bg";

// 그림일기 형식: 날짜·감정 → 제목 → 그림(사진) → 취미·만족도 → 본문
async function Detail({ params, searchParams }: Props) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const loaded = await requireUserWhile(`/activities/${id}`, getActivity(id));
  if (loaded.status === "rejected") throw loaded.reason;
  const activity = loaded.value;
  if (!activity) notFound();
  const emotion = getEmotion(activity.emotion);
  const photoUrl = await getPhotoUrl(activity.photo_path);

  return (
    <article>
      {/* 1. 상단: 뒤로 가기 / 수정·삭제 */}
      <div className="flex items-center justify-between gap-3">
        <Link href="/activities" className="text-sm text-primary-700 underline">
          ← 아카이브
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/activities/${activity.id}/edit`} className={menuButton}>
            수정
          </Link>
          <DeleteButton id={activity.id} className={menuDelete} />
        </div>
      </div>

      {saved && (
        <div className="mt-4">
          <FlashMessage message="기록을 저장했어요." />
        </div>
      )}
      {error === "delete" && (
        <p role="alert" className="mt-4 rounded-[12px] bg-error-bg px-4 py-3 text-sm text-error">
          기록을 삭제하지 못했어요. 다시 시도해 주세요.
        </p>
      )}

      <div className="mt-6 rounded-[24px] border border-warmNeutral-200 bg-warmNeutral-0 px-5 py-6 sm:px-8 sm:py-8">
        {/* 2. 날짜 + 감정 (그림일기의 날짜·날씨 자리) */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-dashed border-warmNeutral-200 pb-4">
          <p className="text-[15px] font-medium text-warmNeutral-700">{formatDate(activity.activity_date)}</p>
          {emotion && (
            <p className="text-[15px] text-warmNeutral-700">
              <span className="text-warmNeutral-500">감정</span>{" "}
              <span aria-hidden className="text-xl align-middle">
                {emotion.emoji}
              </span>{" "}
              <span className="font-medium">{emotion.label}</span>
            </p>
          )}
        </div>

        {/* 3. 가운데 정렬된 제목 */}
        <h1 className="mt-6 break-words text-center text-[26px] font-bold leading-tight text-primary-900 sm:text-[32px]">
          {activity.title}
        </h1>

        {/* 4. 넓은 사진 영역 (그림 칸): 비율을 유지하고 잘리지 않게 보여 준다 */}
        <div className="mt-6 overflow-hidden rounded-[16px] border border-warmNeutral-200 bg-warmNeutral-100">
          {photoUrl ? (
            // 서명된 임시 주소라 next/image 최적화 대상이 아니다.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={`${activity.title} 사진`}
              className="mx-auto block h-auto max-h-[75vh] w-full object-contain"
            />
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-1 px-4 py-10 text-center sm:min-h-52">
              <span aria-hidden className="text-3xl">
                🌱
              </span>
              <p className="text-sm text-warmNeutral-500">사진 없이 남긴 기록이에요</p>
            </div>
          )}
        </div>

        {/* 5. 취미 카테고리 + 만족도 */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">
            {activity.hobby.category.name} · {activity.hobby.name}
          </p>
          {activity.satisfaction && (
            <p className="text-sm text-warmNeutral-700" aria-label={`만족도 5점 만점에 ${activity.satisfaction}점`}>
              <span className="text-warmNeutral-500">만족도</span>{" "}
              <span aria-hidden className="text-lg text-accent-star">
                {"★".repeat(activity.satisfaction)}
              </span>
              <span aria-hidden className="text-lg text-warmNeutral-300">
                {"★".repeat(5 - activity.satisfaction)}
              </span>{" "}
              <span className="font-medium">{activity.satisfaction}점</span>
            </p>
          )}
        </div>

        {/* 6. 본문: 기본 가운데 정렬, 입력한 줄바꿈과 빈 줄(문단 간격)을 그대로 유지 */}
        <p className="mt-8 whitespace-pre-wrap break-words text-center text-[17px] leading-[1.9] text-warmNeutral-900">
          {activity.content}
        </p>
      </div>
    </article>
  );
}
