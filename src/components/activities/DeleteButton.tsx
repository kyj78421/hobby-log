"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { deleteActivity } from "@/app/activities/actions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-[14px] bg-error px-5 text-[15px] font-semibold text-white disabled:opacity-60"
    >
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}

export function DeleteButton({ id }: { id: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="h-11 rounded-[14px] border border-error px-5 text-[15px] font-semibold text-error hover:bg-error-bg"
      >
        삭제하기
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="delete-title"
        className="m-auto w-[min(90vw,400px)] rounded-[20px] p-6 backdrop:bg-black/30"
      >
        <h2 id="delete-title" className="text-lg font-bold text-warmNeutral-900">
          이 기록을 삭제할까요?
        </h2>
        <p className="mt-2 text-sm text-warmNeutral-700">삭제 후에는 되돌릴 수 없어요.</p>
        <form action={deleteActivity.bind(null, id)} className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="h-11 rounded-[14px] border border-primary-300 px-5 text-[15px] font-semibold text-primary-700"
          >
            취소
          </button>
          <ConfirmButton />
        </form>
      </dialog>
    </>
  );
}
