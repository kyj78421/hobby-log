import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 서버에서 Supabase에 토큰을 확인해 현재 로그인한 회원을 돌려준다. 비회원이면 null.
// React.cache는 "한 번의 요청(렌더링)" 안에서만 결과를 재사용한다. 헤더·하단 탭·본문이 각각 호출해도
// 인증 서버 확인은 요청당 한 번이며, 다른 요청·다른 사용자와는 공유되지 않는다.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
});

// 로그인 후 이동할 경로. 같은 사이트 안의 경로만 허용한다 (open redirect 방지).
export function safeNextPath(next: unknown) {
  if (typeof next !== "string") return "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  return next;
}

// 로그인 확인과 데이터 조회를 동시에 시작한다. 둘은 서로 필요로 하지 않고, 데이터 접근은 RLS가 로그인 사용자
// 기준으로 따로 막는다. 비로그인이면 redirect가 던져져 조회 결과는 버려지고, 조회가 실패하면 호출한 쪽이
// 기존처럼 오류 화면을 보여 줄 수 있게 settled 결과로 돌려준다.
export async function requireUserWhile<T>(nextPath: string, load: Promise<T>): Promise<PromiseSettledResult<T>> {
  const settled = Promise.allSettled([load]).then(([result]) => result);
  await requireUser(nextPath);
  return settled;
}

// 회원 전용 페이지에서 서버가 직접 로그인 여부를 확인한다 (proxy와 별개의 2차 검증).
export async function requireUser(nextPath: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}
