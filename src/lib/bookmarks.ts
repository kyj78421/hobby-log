import type { Category } from "@/lib/activities";
import { createClient } from "@/lib/supabase/server";

// 내가 북마크한 세부 취미 id 목록 (RLS가 본인 것만 돌려준다)
export async function getMyBookmarkIds(): Promise<number[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("hobby_bookmarks").select("hobby_id");
  if (error) throw new Error("북마크를 불러오지 못했어요.");
  return (data ?? []).map((r) => r.hobby_id as number);
}

export type CategoryBookmarkStat = { id: number; name: string; count: number };

// 대분류별 북마크 수. 한 취미가 여러 대분류에 연결되어 있으면 연결된 각 대분류에 한 번씩 센다.
// 그래서 대분류별 합계는 전체보다 클 수 있고, 전체(total)는 중복 없이 북마크한 취미 수다.
export function buildBookmarkStats(categories: Category[], bookmarkedIds: number[]) {
  const ids = new Set(bookmarkedIds);
  const byCategory: CategoryBookmarkStat[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.hobbies.filter((h) => ids.has(h.id)).length,
  }));
  return { total: ids.size, byCategory };
}
