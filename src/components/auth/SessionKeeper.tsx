"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { restoreSession } from "@/app/(auth)/actions";
import {
  RESTORE_FINISHED_EVENT,
  clearSavedSession,
  readRefreshTokenFromCookie,
  readSavedRefreshToken,
  saveRefreshToken,
} from "@/lib/saved-session";

// 로그인 유지 보조 장치.
// 1) 쿠키에 세션이 있으면 갱신 토큰을 기기에 보관한다.
// 2) 쿠키가 사라졌는데 보관된 토큰이 있으면, 로그인 화면으로 보내기 전에 서버에 복원을 요청한다.
export function SessionKeeper() {
  const router = useRouter();
  const pathname = usePathname();
  const running = useRef(false);

  useEffect(() => {
    async function sync() {
      if (running.current) return;
      running.current = true;
      try {
        const cookieToken = readRefreshTokenFromCookie();
        if (cookieToken) {
          saveRefreshToken(cookieToken);
          return;
        }
        const saved = readSavedRefreshToken();
        if (!saved) return;

        const result = await restoreSession(saved);
        if (!result.ok) {
          clearSavedSession(); // 만료·폐기된 토큰은 버린다 (일반 로그인으로 진행)
          return;
        }
        if (result.refreshToken) saveRefreshToken(result.refreshToken);

        const onAuthPage = pathname === "/login" || pathname === "/signup";
        const next = new URLSearchParams(window.location.search).get("next");
        const safeNext = next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
        if (onAuthPage) router.replace(safeNext);
        else router.refresh();
      } finally {
        running.current = false;
        window.dispatchEvent(new Event(RESTORE_FINISHED_EVENT));
      }
    }

    void sync();
    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [pathname, router]);

  return null;
}
