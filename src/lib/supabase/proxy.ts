import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 로그인한 회원만 접근할 수 있는 경로 (IA 기준: 회원 전용 영역)
const PROTECTED_PREFIXES = ["/calendar", "/activities", "/mypage", "/onboarding", "/bookmarks"];
// 로그인 상태에서는 들어갈 필요가 없는 경로 (UC-01 A2)
const GUEST_ONLY_PATHS = ["/login", "/signup"];

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // 세션 쿠키를 내려보내는 응답은 CDN·브라우저가 캐시하면 안 된다 (@supabase/ssr 필수 사항).
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // 토큰 갱신을 위해 getClaims()를 호출한다. 실제 데이터 접근 단계의 검증은 서버에서 getUser()로 다시 한다.
  const { data, error } = await supabase.auth.getClaims();
  const isSignedIn = !!data?.claims;
  const { pathname, search } = request.nextUrl;

  // 진단용: 세션 쿠키가 있는데도 로그인으로 판단되지 않을 때 원인 코드만 남긴다 (토큰·이메일은 기록하지 않음).
  const hasAuthCookie = request.cookies.getAll().some((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name));
  if (!isSignedIn && hasAuthCookie) {
    console.warn("[auth] 세션 쿠키가 있지만 유효하지 않음:", error?.name ?? "no-claims", error?.status ?? "");
  }

  const redirectTo = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    // 갱신된 세션 쿠키를 리다이렉트 응답에도 전달한다.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    ["cache-control", "expires", "pragma"].forEach((h) => {
      const v = response.headers.get(h);
      if (v) redirect.headers.set(h, v);
    });
    return redirect;
  };

  if (!isSignedIn && PROTECTED_PREFIXES.some((p) => matches(pathname, p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return redirectTo(url);
  }

  // 로그인/가입 화면은 토큰이 아직 유효해도 서버에서 실제 회원인지 한 번 더 확인한다.
  // (다른 기기에서 로그아웃했거나 계정이 삭제된 경우 로그인 화면에 갇히지 않도록)
  if (isSignedIn && GUEST_ONLY_PATHS.some((p) => matches(pathname, p))) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return redirectTo(url);
  }

  return response;
}
