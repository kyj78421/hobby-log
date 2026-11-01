"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { createPortal } from "react-dom";
import { createHobby, updateHobby } from "@/app/hobbies/actions";
import type { Category } from "@/lib/activities";

type Editing = { id: number; name: string; categoryId: number };
type Saved = { id: number; categoryId: number };

// 사용자 지정 취미 등록/수정 창. editing이 있으면 수정, 없으면 등록.
// 본문은 열릴 때만 마운트되어 입력이 매번 초기화된다.
export function HobbyFormDialog({
  open,
  onClose,
  categories,
  defaultCategoryId,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  defaultCategoryId: number | null;
  editing?: Editing;
  onSaved?: (hobby: Saved) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  // 호출한 화면의 <form> 안에 들어가 폼이 중첩되지 않도록 body로 옮겨 그린다(서버 렌더링 때는 그리지 않는다).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open, mounted]);

  if (!mounted) return null;
  return createPortal(
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-labelledby="hobby-dialog-title"
      className="m-auto w-[min(92vw,420px)] rounded-[20px] border border-warmNeutral-200 bg-warmNeutral-0 p-0 text-warmNeutral-900 backdrop:bg-black/40"
    >
      {open && (
        <HobbyFormBody
          categories={categories}
          defaultCategoryId={defaultCategoryId}
          editing={editing}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </dialog>,
    document.body,
  );
}

function HobbyFormBody({
  categories,
  defaultCategoryId,
  editing,
  onClose,
  onSaved,
}: {
  categories: Category[];
  defaultCategoryId: number | null;
  editing?: Editing;
  onClose: () => void;
  onSaved?: (hobby: Saved) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(editing?.name ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(
    editing?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? null,
  );
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (!name.trim()) return setError("취미 이름을 입력해 주세요.");
    if (categoryId === null) return setError("대분류를 선택해 주세요.");
    const target = categoryId;
    startTransition(async () => {
      const result = editing ? await updateHobby(editing.id, name, target) : await createHobby(name, target);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSaved?.({ id: result.id ?? editing?.id ?? 0, categoryId: target });
      router.refresh();
      onClose();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 p-6" noValidate>
      <h2 id="hobby-dialog-title" className="text-lg font-bold text-primary-900">
        {editing ? "내 취미 수정" : "취미 추가"}
      </h2>
      {error && (
        <p role="alert" className="rounded-[12px] bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="hobby-name" className="mb-2 block text-sm font-medium">
          취미 이름
        </label>
        <input
          id="hobby-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          autoComplete="off"
          autoFocus
          className="h-12 w-full rounded-[12px] border border-warmNeutral-200 bg-warmNeutral-0 px-4 text-base outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        />
      </div>
      <div>
        <label htmlFor="hobby-category" className="mb-2 block text-sm font-medium">
          대분류
        </label>
        <select
          id="hobby-category"
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="h-12 w-full rounded-[12px] border border-warmNeutral-200 bg-warmNeutral-0 px-4 text-base outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="h-12 rounded-[14px] px-4 text-[15px] font-semibold text-warmNeutral-700 underline"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-[14px] bg-primary-700 px-6 text-[15px] font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
        >
          {pending ? "저장 중…" : editing ? "수정하기" : "추가하기"}
        </button>
      </div>
    </form>
  );
}

// "+ 취미 추가" 버튼과 등록 창. 비회원에게는 보여 주지 않는다(호출하는 쪽에서 로그인 여부로 분기).
export function AddHobbyButton({
  categories,
  categoryId,
  onCreated,
}: {
  categories: Category[];
  categoryId: number | null;
  onCreated?: (hobby: { id: number; categoryId: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-11 rounded-full border border-dashed border-primary-500 bg-warmNeutral-0 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
      >
        + 취미 추가
      </button>
      <HobbyFormDialog
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
        defaultCategoryId={categoryId}
        onSaved={onCreated}
      />
    </>
  );
}
