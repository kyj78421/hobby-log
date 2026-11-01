import { PHOTO_BUCKET } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";

// own: 내가 직접 만든 취미 (RLS 덕분에 목록에는 기본 취미와 내 취미만 온다)
export type Hobby = { id: number; name: string; own: boolean };
export type Category = { id: number; name: string; hobbies: Hobby[] };

export type ActivityListItem = {
  id: string;
  title: string;
  activity_date: string;
  emotion: string | null;
  satisfaction: number | null;
  photo_path: string | null;
  hobby: { id: number; name: string; category: { id: number; name: string } };
};

export type Activity = ActivityListItem & { content: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID_PATTERN.test(value);

const LIST_COLUMNS =
  "id, title, activity_date, emotion, satisfaction, photo_path, hobby:hobbies!inner(id, name, category:hobby_categories!hobbies_category_id_fkey!inner(id, name))";

type LinkRow = {
  sort_order: number;
  hobby: { id: number; name: string; owner_id: string | null; archived_at: string | null };
};

// 대분류별 취미 목록. 한 취미가 여러 대분류에 연결되어 있으면 각 대분류에 모두 나온다.
// 보관된 취미는 선택지에서 제외한다(기존 기록·표시는 영향 없음).
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hobby_categories")
    .select("id, name, links:hobby_category_links(sort_order, hobby:hobbies!inner(id, name, owner_id, archived_at))")
    .order("sort_order");
  if (error) throw new Error("카테고리를 불러오지 못했어요.");
  return ((data ?? []) as unknown as { id: number; name: string; links: LinkRow[] }[]).map((c) => ({
    id: c.id,
    name: c.name,
    hobbies: c.links
      .filter((l) => l.hobby.archived_at === null)
      .sort((a, b) => a.sort_order - b.sort_order || a.hobby.id - b.hobby.id)
      .map((l) => ({ id: l.hobby.id, name: l.hobby.name, own: l.hobby.owner_id !== null })),
  }));
}

export type MyHobby = { id: number; name: string; categoryId: number; categoryName: string };

// 내가 직접 만든 취미(보관된 것 제외)
export async function getMyCustomHobbies(): Promise<MyHobby[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hobbies")
    .select("id, name, category:hobby_categories!hobbies_category_id_fkey!inner(id, name)")
    .not("owner_id", "is", null)
    .is("archived_at", null)
    .order("id");
  if (error) throw new Error("내 취미를 불러오지 못했어요.");
  return ((data ?? []) as unknown as { id: number; name: string; category: { id: number; name: string } }[]).map(
    (h) => ({ id: h.id, name: h.name, categoryId: h.category.id, categoryName: h.category.name }),
  );
}

export async function listActivities(options: {
  categoryId?: number;
  sort?: "desc" | "asc";
  limit?: number;
}): Promise<ActivityListItem[]> {
  const supabase = await createClient();
  const ascending = options.sort === "asc";
  let query = supabase
    .from("activities")
    .select(LIST_COLUMNS)
    .order("activity_date", { ascending })
    .order("created_at", { ascending });
  if (options.categoryId) {
    // 그 대분류에 연결된 모든 취미의 기록 (한 취미가 여러 대분류에 속할 수 있다)
    const { data: links, error: linkError } = await supabase
      .from("hobby_category_links")
      .select("hobby_id")
      .eq("category_id", options.categoryId);
    if (linkError) throw new Error("기록을 불러오지 못했어요.");
    const hobbyIds = (links ?? []).map((l) => l.hobby_id as number);
    if (hobbyIds.length === 0) return [];
    query = query.in("hobby_id", hobbyIds);
  }
  if (options.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw new Error("기록을 불러오지 못했어요.");
  return (data ?? []) as unknown as ActivityListItem[];
}

export async function countActivities(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("activities")
    .select("id", { count: "exact", head: true });
  if (error) throw new Error("기록을 불러오지 못했어요.");
  return count ?? 0;
}

// RLS 덕분에 타인의 기록은 "없음"과 같게 조회된다. 존재하지 않으면 null.
export async function getActivity(id: string): Promise<Activity | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select(`${LIST_COLUMNS}, content`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("기록을 불러오지 못했어요.");
  return data as unknown as Activity | null;
}

// "2026-10-24" → "2026년 10월 24일 토요일"
export function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: "UTC",
  });
}

export function todayInSeoul() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

// 비공개 버킷의 사진을 잠깐 볼 수 있는 주소(1시간). 본인 폴더가 아니면 RLS가 막아 null이 된다.
export async function getPhotoUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

// 목록 카드용: 사진이 있는 기록들의 서명 주소를 한 번에 만든다. { photo_path: url }
export async function getPhotoUrlMap(items: { photo_path: string | null }[]) {
  const paths = items.map((i) => i.photo_path).filter((p): p is string => !!p);
  const map: Record<string, string> = {};
  if (paths.length === 0) return map;
  const supabase = await createClient();
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 3600);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
  }
  return map;
}

// 캘린더용: 기간(포함) 안의 본인 기록
export async function listActivitiesBetween(from: string, to: string): Promise<ActivityListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select(LIST_COLUMNS)
    .gte("activity_date", from)
    .lte("activity_date", to)
    .order("activity_date")
    .order("created_at");
  if (error) throw new Error("기록을 불러오지 못했어요.");
  return (data ?? []) as unknown as ActivityListItem[];
}

export const isDateString = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

// 관심 취미(내 것): 세부 취미 id 목록
export async function getMyHobbyIds(): Promise<number[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("user_hobbies").select("hobby_id");
  if (error) throw new Error("관심 취미를 불러오지 못했어요.");
  return (data ?? []).map((r) => r.hobby_id as number);
}

// "2026-10-24" → "2026.10.24"
export const formatShortDate = (date: string) => date.replaceAll("-", ".");

export async function countActivitiesBetween(from: string, to: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("activities")
    .select("id", { count: "exact", head: true })
    .gte("activity_date", from)
    .lte("activity_date", to);
  if (error) throw new Error("기록을 불러오지 못했어요.");
  return count ?? 0;
}
