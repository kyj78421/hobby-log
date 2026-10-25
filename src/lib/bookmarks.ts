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

// 대분류별 북마크 수. 합계는 항상 전체 북마크 수와 같다(같은 id 목록에서 계산).
export function buildBookmarkStats(categories: Category[], bookmarkedIds: number[]) {
  const ids = new Set(bookmarkedIds);
  const byCategory: CategoryBookmarkStat[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.hobbies.filter((h) => ids.has(h.id)).length,
  }));
  return { total: ids.size, byCategory };
}
