import Link from "next/link";
import { getEmotion } from "@/lib/emotions";
import { formatDate, type ActivityListItem } from "@/lib/activities";

export function ActivityCard({ activity }: { activity: ActivityListItem }) {
  const emotion = getEmotion(activity.emotion);
  return (
    <Link
      href={`/activities/${activity.id}`}
      className="block rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(39,42,39,.08)]"
    >
      <p className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">
        {activity.hobby.category.name} · {activity.hobby.name}
      </p>
      <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-warmNeutral-900">
        {activity.title}
      </h3>
      <p className="mt-2 text-sm text-warmNeutral-500">{formatDate(activity.activity_date)}</p>
      {(emotion || activity.satisfaction) && (
        <p className="mt-3 flex items-center gap-3 text-sm text-warmNeutral-700">
          {emotion && (
            <span>
              <span aria-hidden>{emotion.emoji}</span> {emotion.label}
            </span>
          )}
          {activity.satisfaction && (
            <span aria-label={`5점 만점에 ${activity.satisfaction}점`}>
              <span aria-hidden className="text-accent-star">
                {"★".repeat(activity.satisfaction)}
              </span>
              <span aria-hidden className="text-warmNeutral-300">
                {"★".repeat(5 - activity.satisfaction)}
              </span>
            </span>
          )}
        </p>
      )}
    </Link>
  );
}
