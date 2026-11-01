"use client";

import Link from "next/link";
import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import { login, type AuthFormState } from "@/app/(auth)/actions";
import {
  RESTORE_FINISHED_EVENT,
  readRefreshTokenFromCookie,
  readSavedRefreshToken,
} from "@/lib/saved-session";
import { FormError, PasswordField, SubmitButton, TextField } from "./fields";

export function LoginForm({
  next,
  notice,
}: {
  next: string;
  notice?: string;
}) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(login, {});
  // 저장된 세션을 복원하는 동안에는 로그인 폼을 보여 주지 않는다 (불필요한 로그인 입력 방지).
  // 복원 대상 여부는 브라우저 저장소 값이라 서버 렌더링 때는 false, 마운트 뒤에 판단한다.
  const canRestore = useSyncExternalStore(
    () => () => {},
    () => !!readSavedRefreshToken() && !readRefreshTokenFromCookie(),
    () => false,
  );
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    if (!canRestore) return;
    const done = () => setFinished(true);
    window.addEventListener(RESTORE_FINISHED_EVENT, done);
    const timer = setTimeout(done, 8000); // 복원이 늦어져도 로그인할 수 있게 한다
    return () => {
      window.removeEventListener(RESTORE_FINISHED_EVENT, done);
      clearTimeout(timer);
    };
  }, [canRestore]);
  const restoring = canRestore && !finished;

  if (restoring) {
    return (
      <p role="status" className="py-10 text-center text-warmNeutral-700">
        로그인 상태를 확인하는 중이에요…
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormError message={state.error ?? notice} />
      <TextField
        key={state.email}
        name="email"
        label="이메일"
        type="email"
        autoComplete="email"
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <PasswordField
        name="password"
        label="비밀번호"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
      />
      <SubmitButton pendingLabel="로그인 중…">로그인</SubmitButton>
      <p className="text-center text-sm">
        아직 계정이 없나요?{" "}
        <Link href="/signup" className="font-semibold text-primary-700 underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
