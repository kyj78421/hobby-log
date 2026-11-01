"use client";

import { useState } from "react";
import { BookmarkChip } from "@/components/BookmarkChip";
import type { Category } from "@/lib/activities";
import { CategoryGrid } from "./CategoryGrid";
import { AddHobbyButton } from "./HobbyFormDialog";

// 북마크 관리: 대분류 3열 카드(배지=그 분류의 북마크 수) → 선택한 대분류의 북마크 칩
export function BookmarkExplorer({
  categories,
  bookmarkedIds,
}: {
  categories: Category[];
  bookmarkedIds: number[];
}) {
  const [categoryId, setCategoryId] = useState<number | null>(categories[0]?.id ?? null);
  const active = new Set(bookmarkedIds);
  const badges = Object.fromEntries(categories.map((c) => [c.id, c.hobbies.filter((h) => active.has(h.id)).length]));
  const current = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6">
      <CategoryGrid categories={categories} value={categoryId} onChange={setCategoryId} badges={badges} wide />
      {current && (
        <section aria-labelledby="bookmark-category" className="rounded-[20px] bg-primary-50 p-4 sm:p-5">
          <h2 id="bookmark-category" className="mb-3 text-lg font-bold text-primary-900">
            {current.name}{" "}
            <span className="text-sm font-medium text-warmNeutral-500">{badges[current.id] ?? 0}개 북마크</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {current.hobbies.map((h) => (
              <BookmarkChip key={h.id} hobbyId={h.id} name={h.name} active={active.has(h.id)} />
            ))}
            <AddHobbyButton
              categories={categories}
              categoryId={categoryId}
              onCreated={(h) => setCategoryId(h.categoryId)}
            />
          </div>
        </section>
      )}
    </div>
  );
}
