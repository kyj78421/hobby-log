import Link from "next/link";
import { formatShortDate, type ActivityListItem } from "@/lib/activities";
import { getEmotion } from "@/lib/emotions";

// 기록 카드 (홈·아카이브·캘린더 공통)
// 사진 위: 왼쪽 상단 날짜, 오른쪽 상단 취미 카테고리(반투명 칩, 글자 뒤에만 배경)
// 사진 아래: 제목, 그 아래 한 줄에 감정(왼쪽)·만족도 별점(오른쪽). 본문 미리보기는 보여 주지 않는다.
const overlayChip =
  "rounded-[10px] bg-black/50 px-2.5 py-1 text-xs font-medium leading-tight text-white backdrop-blur-[2px]";

export function ActivityCard({
  activity,
  photoUrl,
}: {
  activity: ActivityListItem;
  photoUrl?: string;
}) {
  const emotion = getEmotion(activity.emotion);
  const rating = activity.satisfaction;

  return (
    <Link
      href={`/activities/${activity.id}`}
      className="block rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-4 transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(39,42,39,.08)] sm:p-5"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-primary-100">
        {photoUrl ? (
          // 서명된 임시 주소라 next/image 최적화 대상이 아니다. 4:3 칸을 꽉 채우고 넘치는 부분만 자른다.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={`${activity.title} 사진`} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-primary-800">
            <span className="text-3xl">🌱</span>
            <span className="text-xs text-primary-700">{activity.hobby.name}</span>
          </div>
        )}
        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-2">
          <span className={`${overlayChip} shrink-0 whitespace-nowrap tabular-nums`}>
            {formatShortDate(activity.activity_date)}
          </span>
          {/* 좁은 카드에서는 '·' 뒤에서만 줄바꿈해 글자가 중간에서 끊기지 않게 한다 */}
          <span className={`${overlayChip} min-w-0 max-w-[62%] break-keep text-right`}>
            {activity.hobby.category.name.replace("·", "·\u200b")}
          </span>
        </div>
      </div>

      <h3 className="mt-4 line-clamp-2 break-words text-lg font-semibold text-warmNeutral-900">{activity.title}</h3>

      {(emotion || rating) && (
        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
          {emotion ? (
            <p className="min-w-0 text-warmNeutral-700">
              <span aria-hidden>{emotion.emoji}</span> {emotion.label}
            </p>
          ) : (
            <span />
          )}
          {rating && (
            <p className="shrink-0 whitespace-nowrap" aria-label={`만족도 5점 만점에 ${rating}점`}>
              <span aria-hidden className="text-accent-star">
                {"★".repeat(rating)}
              </span>
              <span aria-hidden className="text-warmNeutral-300">
                {"★".repeat(5 - rating)}
              </span>
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
