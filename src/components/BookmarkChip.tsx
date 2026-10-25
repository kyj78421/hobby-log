"use client";

import { useActionState } from "react";
import { toggleBookmark, type BookmarkState } from "@/app/bookmarks/actions";

// 세부 취미 하나를 북마크/해제하는 칩. 취미 칩(관심 취미)과 같은 모양을 재사용한다.
export function BookmarkChip({
  hobbyId,
  name,
  active,
}: {
  hobbyId: number;
  name: string;
  active: boolean;
}) {
  const [state, formAction, isPending] = useActionState<BookmarkState, FormData>(toggleBookmark, {});

  return (
    <form action={formAction} className="inline-flex flex-col">
      <input type="hidden" name="hobby_id" value={hobbyId} />
      <input type="hidden" name="turn" value={active ? "off" : "on"} />
      <button
        type="submit"
        disabled={isPending}
        aria-pressed={active}
        aria-label={`${name} 북마크 ${active ? "해제" : "추가"}`}
        className={`min-h-11 rounded-full border px-4 text-sm font-medium disabled:opacity-60 ${
          active
            ? "border-primary-500 bg-primary-200 text-primary-800"
            : "border-warmNeutral-200 bg-warmNeutral-0 text-warmNeutral-700 hover:bg-warmNeutral-100"
        }`}
      >
        <span aria-hidden>{active ? "★ " : "☆ "}</span>
        {name}
      </button>
      {state.error && (
        <span role="alert" className="mt-1 text-xs text-error">
          {state.error}
        </span>
      )}
    </form>
  );
}
