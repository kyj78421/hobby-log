"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteHobby } from "@/app/hobbies/actions";
import type { Category, MyHobby } from "@/lib/activities";
import { categoryIcon } from "@/lib/category-icons";
import { AddHobbyButton, HobbyFormDialog } from "./HobbyFormDialog";

// 내가 만든 취미 목록: 등록·수정·삭제. 기록이 연결된 취미는 삭제 대신 보관되어 기록이 그대로 남는다.
export function MyHobbyManager({ hobbies, categories }: { hobbies: MyHobby[]; categories: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<MyHobby | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string }>();
  const [pending, startTransition] = useTransition();

  function remove(id: number) {
    startTransition(async () => {
      const result = await deleteHobby(id);
      setConfirming(null);
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error });
        return;
      }
      setMessage({
        kind: "ok",
        text: result.archived
          ? "기록이 있는 취미라 삭제하지 않고 보관했어요. 기존 기록은 그대로 남아 있어요."
          : "취미를 삭제했어요.",
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-warmNeutral-700">직접 만든 취미 {hobbies.length}개 (최대 50개)</p>
        <AddHobbyButton categories={categories} categoryId={categories[0]?.id ?? null} />
      </div>

      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={`rounded-[12px] px-4 py-3 text-sm ${
            message.kind === "error" ? "bg-error-bg text-error" : "bg-primary-100 text-primary-900"
          }`}
        >
          {message.text}
        </p>
      )}

      {hobbies.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-warmNeutral-300 px-6 py-12 text-center text-warmNeutral-700">
          아직 직접 만든 취미가 없어요. 위의 &lsquo;+ 취미 추가&rsquo;로 나만의 취미를 만들어 보세요.
        </div>
      ) : (
        <ul className="space-y-3">
          {hobbies.map((h) => (
            <li
              key={h.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-warmNeutral-200 bg-warmNeutral-0 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="break-words font-semibold text-warmNeutral-900">{h.name}</p>
                <p className="text-sm text-warmNeutral-500">
                  <span aria-hidden>{categoryIcon(h.categoryId)}</span> {h.categoryName}
                </p>
              </div>
              {confirming === h.id ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-warmNeutral-700">삭제할까요?</span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(h.id)}
                    className="min-h-11 rounded-[12px] bg-error px-4 font-semibold text-white disabled:opacity-60"
                  >
                    {pending ? "처리 중…" : "삭제"}
                  </button>
                  <button type="button" onClick={() => setConfirming(null)} className="min-h-11 px-3 underline">
                    취소
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setEditing(h)}
                    className="min-h-11 px-3 text-primary-700 underline"
                    aria-label={`${h.name} 수정`}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMessage(undefined);
                      setConfirming(h.id);
                    }}
                    className="min-h-11 px-3 text-error underline"
                    aria-label={`${h.name} 삭제`}
                  >
                    삭제
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <HobbyFormDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        categories={categories}
        defaultCategoryId={editing?.categoryId ?? null}
        editing={editing ? { id: editing.id, name: editing.name, categoryId: editing.categoryId } : undefined}
      />
    </div>
  );
}
