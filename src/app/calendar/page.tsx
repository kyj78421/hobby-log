import Link from "next/link";
import { Suspense } from "react";
import { ActivityCard } from "@/components/activities/ActivityCard";
import {
  formatDate,
  getPhotoUrlMap,
  isDateString,
  listActivitiesBetween,
  todayInSeoul,
  type ActivityListItem,
} from "@/lib/activities";
import { requireUser } from "@/lib/auth";
import { BlockSkeleton } from "@/components/Skeleton";
import { CalendarKeys } from "@/components/CalendarKeys";
import { buildMonthGrid, isMonthString, monthLabel, monthRange, shiftMonth } from "@/lib/calendar";
import { getEmotion } from "@/lib/emotions";

export const metadata = { title: "캘린더 · HOBBY LOG" };

type SearchParams = Promise<{ month?: string; date?: string }>;
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-10">
      <h1 className="mb-6 text-[30px] font-bold text-primary-900 sm:text-4xl">캘린더</h1>
      <Suspense fallback={<BlockSkeleton className="h-96" />}>
        <Calendar searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Calendar({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  await requireUser("/calendar");

  const today = todayInSeoul();
  const selected = isDateString(sp.date) ? sp.date : null;
  const month = isMonthString(sp.month)
    ? sp.month
    : selected
      ? selected.slice(0, 7)
      : today.slice(0, 7);

  let activities: ActivityListItem[];
  try {
    const { from, to } = monthRange(month);
    activities = await listActivitiesBetween(from, to);
  } catch {
    return (
      <div role="alert" className="rounded-[12px] bg-error-bg px-4 py-4 text-error">
        <p>기록을 불러오지 못했어요.</p>
        <Link href={`/calendar?month=${month}`} className="mt-2 inline-block font-semibold underline">
          다시 시도
        </Link>
      </div>
    );
  }

  const byDate = new Map<string, ActivityListItem[]>();
  for (const a of activities) byDate.set(a.activity_date, [...(byDate.get(a.activity_date) ?? []), a]);

  const dayItems = selected && selected.startsWith(month) ? (byDate.get(selected) ?? []) : [];
  const photoUrls = await getPhotoUrlMap(dayItems);
  const link = (m: string, date?: string) => `/calendar?month=${m}${date ? `&date=${date}` : ""}`;
  const navBtn =
    "flex h-11 min-w-11 items-center justify-center rounded-[14px] border border-primary-300 bg-warmNeutral-0 px-3 text-primary-700 hover:bg-primary-50";

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <section aria-label={`${monthLabel(month)} 달력`}>
        <div className="mb-4 flex items-center justify-between">
          <Link href={link(shiftMonth(month, -1))} className={navBtn} aria-label="이전 달">
            ←
          </Link>
          <h2 className="text-xl font-bold text-primary-900">{monthLabel(month)}</h2>
          <div className="flex gap-2">
            <Link href={link(today.slice(0, 7), today)} className={navBtn}>
              오늘
            </Link>
            <Link href={link(shiftMonth(month, 1))} className={navBtn} aria-label="다음 달">
              →
            </Link>
          </div>
        </div>

        <table
          data-calendar
          className="w-full table-fixed border-separate border-spacing-1 max-[359px]:-mx-3.5 max-[359px]:w-[calc(100%+28px)] max-[359px]:border-spacing-0"
        >
          <thead>
            <tr>
              {WEEKDAYS.map((d) => (
                <th key={d} scope="col" className="py-2 text-xs font-medium text-warmNeutral-500">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {buildMonthGrid(month).map((week, i) => (
              <tr key={i}>
                {week.map((date, j) => {
                  if (!date) return <td key={j} />;
                  const items = byDate.get(date) ?? [];
                  const emotion = getEmotion(items.find((a) => a.emotion)?.emotion);
                  const isSelected = date === selected;
                  const isToday = date === today;
                  return (
                    <td key={date} className="p-0">
                      <Link
                        href={link(month, date)}
                        aria-current={isToday ? "date" : undefined}
                        aria-label={`${formatDate(date)}${items.length ? `, 기록 ${items.length}개` : ""}`}
                        className={`flex h-14 flex-col items-center justify-start gap-0.5 rounded-[12px] pt-1.5 text-sm sm:h-20 ${
                          isSelected
                            ? "bg-primary-700 text-white"
                            : "bg-warmNeutral-100 text-warmNeutral-900 hover:bg-primary-100"
                        } ${isToday ? "ring-2 ring-primary-500" : ""}`}
                      >
                        <span className="tabular-nums">{Number(date.slice(8))}</span>
                        {emotion && (
                          <span aria-hidden className="text-sm leading-none">
                            {emotion.emoji}
                          </span>
                        )}
                        {items.length > 0 && (
                          <span aria-hidden className="flex items-center gap-0.5 text-[10px] leading-none">
                            {items.slice(0, 3).map((a) => (
                              <span
                                key={a.id}
                                className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-primary-500"}`}
                              />
                            ))}
                            {items.length > 3 && <span>+{items.length - 3}</span>}
                          </span>
                        )}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <CalendarKeys />
      </section>

      <section aria-live="polite">
        {!selected || !selected.startsWith(month) ? (
          <p className="rounded-[20px] border border-dashed border-warmNeutral-300 px-6 py-12 text-center text-warmNeutral-700">
            날짜를 선택하면 그날의 기록을 볼 수 있어요.
          </p>
        ) : (
          <>
            <h2 className="text-lg font-bold text-primary-900">{formatDate(selected)}</h2>
            {dayItems.length === 0 ? (
              <div className="mt-4 rounded-[20px] border border-dashed border-warmNeutral-300 px-6 py-10 text-center">
                <p className="text-warmNeutral-900">이 날의 첫 기록을 남겨보세요.</p>
                <Link
                  href={`/activities/new?date=${selected}`}
                  className="mt-5 inline-block rounded-[14px] bg-primary-700 px-5 py-3 text-[15px] font-semibold text-white hover:bg-primary-600"
                >
                  이 날짜에 기록하기
                </Link>
              </div>
            ) : (
              <ul className="mt-4 space-y-4">
                {dayItems.map((a) => (
                  <li key={a.id}>
                    <ActivityCard activity={a} photoUrl={a.photo_path ? photoUrls[a.photo_path] : undefined} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}
