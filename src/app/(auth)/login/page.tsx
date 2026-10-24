import { Suspense } from "react";
import { safeNextPath } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "로그인 · HOBBY LOG" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  return (
    <>
      <h1 className="mb-6 text-[30px] font-bold leading-tight text-primary-900 sm:text-4xl">
        로그인
      </h1>
      <Suspense fallback={<div className="h-64" aria-hidden />}>
        <LoginFormWithParams searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LoginFormWithParams({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <LoginForm
      next={safeNextPath(next)}
      notice={
        error === "confirm"
          ? "확인 링크가 올바르지 않거나 만료됐어요. 로그인을 시도하거나 다시 가입해 주세요."
          : undefined
      }
    />
  );
}
