"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type AuthFormState } from "@/app/(auth)/actions";
import { FormError, PasswordField, SubmitButton, TextField } from "./fields";

export function SignupForm() {
  const [state, formAction] = useActionState<AuthFormState, FormData>(signup, {});

  if (state.signedUp) {
    return (
      <div className="space-y-5 text-center">
        <p className="rounded-[12px] bg-success-bg px-4 py-3 text-sm text-success" role="status">
          가입 요청을 받았어요.
        </p>
        <p className="text-base text-warmNeutral-900">
          <strong>{state.email}</strong>으로 확인 메일을 보냈어요.
          <br />
          메일의 링크를 누르면 가입이 완료돼요.
        </p>
        <Link href="/login" className="inline-block font-semibold text-primary-700 underline">
          로그인 페이지로 이동
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormError message={state.error} />
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
        hint="8자 이상 입력해 주세요."
        autoComplete="new-password"
        error={state.fieldErrors?.password}
      />
      <PasswordField
        name="confirm"
        label="비밀번호 확인"
        autoComplete="new-password"
        error={state.fieldErrors?.confirm}
      />
      <SubmitButton pendingLabel="가입 중…">회원가입</SubmitButton>
      <p className="text-center text-sm">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-primary-700 underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
