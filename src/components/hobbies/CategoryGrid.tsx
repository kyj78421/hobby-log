"use client";

import type { Category } from "@/lib/activities";
import { categoryIcon } from "@/lib/category-icons";

// 대분류 3열 카드 그리드. 선택한 대분류를 강조하고, badges로 분류별 개수(선택·북마크 수)를 표시한다.
export function CategoryGrid({
  categories,
  value,
  onChange,
  badges,
  label = "취미 대분류",
  wide = false,
}: {
  categories: Category[];
  value: number | null;
  onChange: (id: number) => void;
  badges?: Record<number, number>;
  label?: string;
  wide?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className={`grid grid-cols-3 gap-2 sm:gap-3 ${wide ? "lg:grid-cols-9" : ""}`}>
      {categories.map((c) => {
        const on = value === c.id;
        const badge = badges?.[c.id] ?? 0;
        const parts = c.name.split(" · ");
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(c.id)}
            className={`relative flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-[16px] border px-1.5 py-2.5 text-center transition-colors ${
              on
                ? "border-primary-500 bg-primary-200 text-primary-900 ring-2 ring-primary-300"
                : "border-warmNeutral-200 bg-warmNeutral-0 text-warmNeutral-700 hover:bg-warmNeutral-100"
            }`}
          >
            <span aria-hidden className="text-2xl leading-none">
              {categoryIcon(c.id)}
            </span>
            <span className="break-keep text-[13px] font-semibold leading-tight">
              {parts.map((part, i) => (
                <span key={i} className="block">
                  {part}
                  {i < parts.length - 1 ? " ·" : ""}
                </span>
              ))}
            </span>
            {badge > 0 && (
              <span
                aria-label={`${badge}개`}
                className="absolute right-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-700 px-1 text-[11px] font-semibold text-white"
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export const hobbyChipClass = (on: boolean) =>
  `min-h-11 max-w-full break-keep rounded-full border px-4 py-2 text-left text-sm font-medium ${
    on
      ? "border-primary-500 bg-primary-200 text-primary-800"
      : "border-warmNeutral-200 bg-warmNeutral-0 text-warmNeutral-700 hover:bg-warmNeutral-100"
  }`;
