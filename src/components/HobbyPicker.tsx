"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveHobbies, type OnboardingState } from "@/app/onboarding/actions";
import type { Category } from "@/lib/activities";
import { FormError } from "@/components/auth/fields";
import { CategoryGrid, hobbyChipClass } from "@/components/hobbies/CategoryGrid";
import { AddHobbyButton } from "@/components/hobbies/HobbyFormDialog";

// 관심 취미 선택(온보딩): 대분류 3열 카드 → 선택한 대분류의 취미 칩(여러 개 선택)
export function HobbyPicker({
  categories,
  initialSelected,
  skipHref,
}: {
  categories: Category[];
  initialSelected: number[];
  skipHref: string;
}) {
  const [state, formAction, isPending] = useActionState<OnboardingState, FormData>(saveHobbies, {});
  const [categoryId, setCategoryId] = useState<number | null>(categories[0]?.id ?? null);
  // 보관되어 더 이상 선택지에 없는 취미는 처음부터 제외한다.
  const [selected, setSelected] = useState<Set<number>>(() => {
    const visible = new Set(categories.flatMap((c) => c.hobbies.map((h) => h.id)));
    return new Set(initialSelected.filter((id) => visible.has(id)));
  });

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const current = categories.find((c) => c.id === categoryId);
  // 같은 취미가 여러 대분류에 있어도 한 번만 센다(분류별 배지는 그 분류에 속한 선택 수).
  const badges = Object.fromEntries(
    categories.map((c) => [c.id, c.hobbies.filter((h) => selected.has(h.id)).length]),
  );

  return (
    <form action={formAction} className="space-y-6">
      <FormError message={state.error} />
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="hobby_id" value={id} />
      ))}

      <CategoryGrid categories={categories} value={categoryId} onChange={setCategoryId} badges={badges} wide />

      {current && (
        <section aria-labelledby="picker-category" className="rounded-[20px] bg-primary-50 p-4 sm:p-5">
          <h2 id="picker-category" className="mb-3 text-lg font-bold text-primary-900">
            {current.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {current.hobbies.map((h) => {
              const on = selected.has(h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(h.id)}
                  className={hobbyChipClass(on)}
                >
                  {on && <span aria-hidden>✓ </span>}
                  {h.name}
                  {h.own && <span className="ml-1 text-xs text-primary-700">내 취미</span>}
                </button>
              );
            })}
            <AddHobbyButton
              categories={categories}
              categoryId={categoryId}
              onCreated={(h) => {
                setSelected((prev) => new Set(prev).add(h.id));
                setCategoryId(h.categoryId);
              }}
            />
          </div>
          <Link href="/my-hobbies" className="mt-4 inline-block text-sm font-semibold text-primary-700 underline">
            내가 만든 취미 관리
          </Link>
        </section>
      )}

      <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-3 border-t border-warmNeutral-200 bg-warmNeutral-50 px-5 py-4">
        <p className="text-sm text-warmNeutral-500" aria-live="polite">
          {selected.size}개 선택
        </p>
        <div className="flex items-center gap-3">
          <Link href={skipHref} className="text-sm font-semibold text-primary-700 underline">
            나중에 할게요
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="h-12 rounded-[14px] bg-primary-700 px-6 text-[15px] font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
          >
            {isPending ? "저장 중…" : "선택 완료"}
          </button>
        </div>
      </div>
    </form>
  );
}
