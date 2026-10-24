import { createClient } from "@/lib/supabase/server";

export type Hobby = { id: number; name: string };
export type Category = { id: number; name: string; hobbies: Hobby[] };

export type ActivityListItem = {
  id: string;
  title: string;
  activity_date: string;
  hobby: { id: number; name: string; category: { id: number; name: string } };
};

export type Activity = ActivityListItem & { content: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID_PATTERN.test(value);

const LIST_COLUMNS =
  "id, title, activity_date, hobby:hobbies!inner(id, name, category:hobby_categories!inner(id, name))";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hobby_categories")
    .select("id, name, hobbies(id, name, sort_order)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "hobbies" });
  if (error) throw new Error("카테고리를 불러오지 못했어요.");
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    hobbies: c.hobbies.map((h) => ({ id: h.id, name: h.name })),
  }));
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
  if (options.categoryId) query = query.eq("hobby.category_id", options.categoryId);
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
