"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveHobbies, type OnboardingState } from "@/app/onboarding/actions";
import type { Category } from "@/lib/activities";
import { FormError } from "@/components/auth/fields";

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
  const [selected, setSelected] = useState<Set<number>>(new Set(initialSelected));

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <form action={formAction} className="space-y-8">
      <FormError message={state.error} />
      {[...selected].map((id) => (
        <input key={id} type="hidden" name="hobby_id" value={id} />
      ))}
      {categories.map((c) => (
        <fieldset key={c.id}>
          <legend className="mb-3 text-lg font-bold text-primary-900">{c.name}</legend>
          <div className="flex flex-wrap gap-2">
            {c.hobbies.map((h) => {
              const on = selected.has(h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(h.id)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                    on
                      ? "border-primary-500 bg-primary-200 text-primary-800"
                      : "border-warmNeutral-200 bg-warmNeutral-0 text-warmNeutral-700 hover:bg-warmNeutral-100"
                  }`}
                >
                  {on && <span aria-hidden>✓ </span>}
                  {h.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
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
