"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { logout } from "@/app/(auth)/actions";

function Confirm() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-[14px] bg-primary-700 px-5 text-[15px] font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
    >
      {pending ? "로그아웃 중…" : "로그아웃"}
    </button>
  );
}

// Figma 4.D: 로그아웃 확인 [취소] [로그아웃]
export function LogoutButton({ className }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className={className}>
        로그아웃
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="logout-title"
        className="m-auto w-[min(90vw,400px)] rounded-[20px] p-6 backdrop:bg-black/30"
      >
        <h2 id="logout-title" className="text-lg font-bold text-warmNeutral-900">
          로그아웃할까요?
        </h2>
        <form action={logout} className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => dialog.current?.close()}
            className="h-11 rounded-[14px] border border-primary-300 px-5 text-[15px] font-semibold text-primary-700"
          >
            취소
          </button>
          <Confirm />
        </form>
      </dialog>
    </>
  );
}
