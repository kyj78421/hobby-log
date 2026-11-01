"use client";

import { useState } from "react";
import type { Category } from "@/lib/activities";
import { CategoryGrid } from "./CategoryGrid";
import { AddHobbyButton } from "./HobbyFormDialog";

// 취미 둘러보기: 대분류 3열 카드 → 선택한 대분류의 취미 칩(읽기 전용). 로그인 사용자에게만 취미 추가를 보여 준다.
export function HobbyExplorer({
  categories,
  initialCategoryId,
  canAdd,
}: {
  categories: Category[];
  initialCategoryId: number | null;
  canAdd: boolean;
}) {
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId ?? categories[0]?.id ?? null);
  const current = categories.find((c) => c.id === categoryId);

  return (
    <div className="mt-6 space-y-6">
      <CategoryGrid categories={categories} value={categoryId} onChange={setCategoryId} wide />
      {current && (
        <section aria-labelledby="explore-category" className="rounded-[20px] bg-primary-50 p-4 sm:p-5">
          <h2 id="explore-category" className="mb-3 text-lg font-bold text-primary-900">
            {current.name}{" "}
            <span className="text-sm font-medium text-warmNeutral-500">{current.hobbies.length}개</span>
          </h2>
          <ul className="flex flex-wrap gap-2">
            {current.hobbies.map((h) => (
              <li
                key={h.id}
                className="min-h-11 max-w-full break-keep rounded-full border border-warmNeutral-200 bg-warmNeutral-0 px-4 py-2.5 text-sm font-medium text-warmNeutral-700"
              >
                {h.name}
                {h.own && <span className="ml-1 text-xs text-primary-700">내 취미</span>}
              </li>
            ))}
            {canAdd && (
              <li>
                <AddHobbyButton
                  categories={categories}
                  categoryId={categoryId}
                  onCreated={(h) => setCategoryId(h.categoryId)}
                />
              </li>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
