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
