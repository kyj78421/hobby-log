"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthFormState } from "@/app/(auth)/actions";
import { FormError, PasswordField, SubmitButton, TextField } from "./fields";

export function LoginForm({
  next,
  notice,
}: {
  next: string;
  notice?: string;
}) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(login, {});

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
