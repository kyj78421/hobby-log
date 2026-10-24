import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 서버에서 Supabase에 토큰을 확인해 현재 로그인한 회원을 돌려준다. 비회원이면 null.
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
}

// 로그인 후 이동할 경로. 같은 사이트 안의 경로만 허용한다 (open redirect 방지).
export function safeNextPath(next: unknown) {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  return next;
}

// 회원 전용 페이지에서 서버가 직접 로그인 여부를 확인한다 (proxy와 별개의 2차 검증).
export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}
