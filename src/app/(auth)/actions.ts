"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  email?: string;
  error?: string;
  fieldErrors?: { email?: string; password?: string; confirm?: string };
  signedUp?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const fieldErrors: NonNullable<AuthFormState["fieldErrors"]> = {};
  if (!email) fieldErrors.email = "이메일을 입력해 주세요.";
  else if (!EMAIL_PATTERN.test(email))
    fieldErrors.email = "이메일 형식을 확인해 주세요.";
  if (!password) fieldErrors.password = "비밀번호를 입력해 주세요.";
  else if (password.length < MIN_PASSWORD_LENGTH)
    fieldErrors.password = `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 해요.`;
  if (!confirm) fieldErrors.confirm = "비밀번호를 한 번 더 입력해 주세요.";
  else if (password && confirm !== password)
    fieldErrors.confirm = "비밀번호가 일치하지 않아요.";

  if (Object.keys(fieldErrors).length > 0) return { email, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${await getOrigin()}/auth/callback` },
  });

  if (error) {
    if (error.code === "weak_password") {
      return {
        email,
        fieldErrors: { password: "더 안전한 비밀번호를 입력해 주세요." },
      };
    }
    if (error.code === "over_email_send_rate_limit" || error.status === 429) {
      return { email, error: "요청이 많아요. 잠시 후 다시 시도해 주세요." };
    }
    return { email, error: "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요." };
  }

  // 이메일 확인이 켜져 있으면 이미 가입된 이메일도 오류 없이 돌아오고, identities가 비어 있다.
  if (data.user && data.user.identities?.length === 0) {
    return {
      email,
      fieldErrors: { email: "이미 가입된 이메일이에요. 로그인해 주세요." },
    };
  }

  // 이메일 확인을 끈 경우에는 가입과 동시에 세션이 생긴다.
  if (data.session) redirect("/");

  return { email, signedUp: true };
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  const fieldErrors: NonNullable<AuthFormState["fieldErrors"]> = {};
  if (!email) fieldErrors.email = "이메일을 입력해 주세요.";
  if (!password) fieldErrors.password = "비밀번호를 입력해 주세요.";
  if (Object.keys(fieldErrors).length > 0) return { email, fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { email, error: "이메일 확인을 완료해 주세요. 가입 메일을 확인해 주세요." };
    }
    if (error.code === "invalid_credentials") {
      return { email, error: "로그인 정보를 확인해 주세요." };
    }
    return { email, error: "일시적인 오류가 발생했어요. 다시 시도해 주세요." };
  }

  redirect(next);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
