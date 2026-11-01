// 갱신 토큰을 기기에 한 부 더 보관해, 쿠키가 사라져도 세션을 복원할 수 있게 한다.
// 비밀번호는 저장하지 않는다. 이 토큰은 원래 쿠키에 들어 있는 값과 같고, 로그아웃하면 지운다.
const KEY = "hobbylog.saved-session.v1";
export const RESTORE_FINISHED_EVENT = "hobbylog:session-restore-finished";

export function readSavedRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { rt?: unknown };
    return typeof parsed.rt === "string" ? parsed.rt : null;
  } catch {
    return null;
  }
}

export function saveRefreshToken(rt: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ rt, savedAt: Date.now() }));
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 쿠키만 사용한다.
  }
}

export function clearSavedSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 무시
  }
}

// Supabase 세션 쿠키(sb-*-auth-token, 길면 .0 .1 조각)에서 갱신 토큰을 읽는다.
export function readRefreshTokenFromCookie(): string | null {
  const jar = new Map<string, string>();
  for (const part of document.cookie.split("; ")) {
    const i = part.indexOf("=");
    if (i > 0) jar.set(part.slice(0, i), part.slice(i + 1));
  }
  const base = [...jar.keys()].find((k) => /^sb-.+-auth-token$/.test(k) || /^sb-.+-auth-token\.0$/.test(k));
  if (!base) return null;
  const root = base.replace(/\.0$/, "");
  let value = jar.get(root) ?? "";
  if (!value) {
    for (let n = 0; jar.has(`${root}.${n}`); n++) value += jar.get(`${root}.${n}`);
  }
  try {
    value = decodeURIComponent(value);
    if (value.startsWith("base64-")) {
      const b64 = value.slice(7).replace(/-/g, "+").replace(/_/g, "/");
      value = new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
    }
    const session = JSON.parse(value) as { refresh_token?: unknown };
    return typeof session.refresh_token === "string" ? session.refresh_token : null;
  } catch {
    return null;
  }
}
