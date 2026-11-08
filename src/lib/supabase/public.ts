import { createClient } from "@supabase/supabase-js";

// 로그인 정보(쿠키)를 전혀 쓰지 않는 읽기 전용 클라이언트. 비회원(anon) 권한으로만 조회하므로
// 모든 사용자에게 같은 결과가 나오는 공개 데이터(기본 대분류·취미)를 공유 캐시에 담을 때만 쓴다.
export function createPublicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
