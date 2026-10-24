import Link from "next/link";
import { formatShortDate, type ActivityListItem } from "@/lib/activities";
import { getEmotion } from "@/lib/emotions";

// Figma 카드: 4:3 사진 영역(없으면 대체 영역), 제목, `2026.10.24 · 대분류 / 세부`, `평온 · 만족도 4/5`
export function ActivityCard({
  activity,
  photoUrl,
}: {
  activity: ActivityListItem;
  photoUrl?: string;
}) {
  const emotion = getEmotion(activity.emotion);
  const category = activity.hobby.category.name.replace("·", " / ");
  const status = [
    emotion ? `${emotion.emoji} ${emotion.label}` : null,
    activity.satisfaction ? `만족도 ${activity.satisfaction}/5` : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/activities/${activity.id}`}
      className="block rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-4 transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(39,42,39,.08)] sm:p-5"
    >
      {photoUrl ? (
        // 서명된 임시 주소라 next/image 최적화 대상이 아니다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={`${activity.title} 사진`}
          className="aspect-[4/3] w-full rounded-[14px] object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-[14px] bg-primary-100 text-primary-800"
        >
          <span className="text-base font-semibold">{activity.hobby.category.name}</span>
          <span className="mt-1 text-xs text-primary-700">{activity.hobby.name}</span>
        </div>
      )}
      <h3 className="mt-4 line-clamp-2 text-lg font-semibold text-warmNeutral-900">{activity.title}</h3>
      <p className="mt-2 text-sm text-warmNeutral-500">
        {formatShortDate(activity.activity_date)} · {category} / {activity.hobby.name}
      </p>
      {status.length > 0 && (
        <p
          className="mt-1.5 text-sm text-warmNeutral-700"
          aria-label={activity.satisfaction ? `만족도 5점 만점에 ${activity.satisfaction}점` : undefined}
        >
          {status.join(" · ")}
        </p>
      )}
    </Link>
  );
}
