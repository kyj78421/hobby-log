"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type BookmarkState = { error?: string };

// 같은 버튼을 두 번 눌러도 안전하도록(중복 방지) 추가는 upsert, 해제는 delete로 처리한다.
export async function toggleBookmark(
  _prev: BookmarkState,
  formData: FormData,
): Promise<BookmarkState> {
  const user = await getCurrentUser();
  if (!user) return { error: "다시 로그인해 주세요." };

  const hobbyId = String(formData.get("hobby_id") ?? "");
  const turnOn = formData.get("turn") === "on";
  if (!/^\d+$/.test(hobbyId)) return { error: "취미를 다시 선택해 주세요." };

  const supabase = await createClient();
  const { error } = turnOn
    ? await supabase
        .from("hobby_bookmarks")
        .upsert(
          { user_id: user.id, hobby_id: Number(hobbyId) },
          { onConflict: "user_id,hobby_id", ignoreDuplicates: true },
        )
    : await supabase.from("hobby_bookmarks").delete().eq("hobby_id", Number(hobbyId));
  if (error) return { error: "북마크를 저장하지 못했어요. 다시 시도해 주세요." };

  revalidatePath("/bookmarks");
  revalidatePath("/mypage");
  return {};
}
