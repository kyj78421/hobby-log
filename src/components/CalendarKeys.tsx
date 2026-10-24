"use client";

import { useEffect } from "react";

// Figma 4.G: 방향키로 날짜 이동, Enter 선택(링크 기본 동작). 달 경계에서는 멈춘다.
export function CalendarKeys() {
  useEffect(() => {
    const table = document.querySelector<HTMLTableElement>("table[data-calendar]");
    if (!table) return;
    const onKey = (e: KeyboardEvent) => {
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (step === undefined) return;
      const days = [...table.querySelectorAll<HTMLAnchorElement>("tbody a")];
      const i = days.indexOf(document.activeElement as HTMLAnchorElement);
      if (i < 0) return;
      const next = days[i + step];
      if (!next) return;
      e.preventDefault();
      next.focus();
    };
    table.addEventListener("keydown", onKey);
    return () => table.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
