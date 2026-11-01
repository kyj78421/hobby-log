"use server";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type HobbyResult =
  | { ok: true; id?: number; archived?: boolean }
  | { ok: false; error: string };

const GENERIC = "처리하지 못했어요. 잠시 후 다시 시도해 주세요.";

// DB 함수가 한국어 메시지로 거절한 경우에만 그대로 보여 주고, 나머지는 일반 문구를 쓴다.
function toError(error: { code?: string; message?: string }): HobbyResult {
  if (error.code === "23505" && error.message?.includes("hobbies_owner_name_key")) {
    return { ok: false, error: "이미 만든 취미예요." };
  }
  if (["22023", "23505", "54000", "P0002", "28000"].includes(error.code ?? "") && /[가-힣]/.test(error.message ?? "")) {
    return { ok: false, error: error.message as string };
  }
  return { ok: false, error: GENERIC };
}

const validCategory = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0;
const validId = validCategory;

export async function createHobby(name: string, categoryId: number): Promise<HobbyResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "다시 로그인해 주세요." };
  if (typeof name !== "string" || !validCategory(categoryId)) return { ok: false, error: "입력을 확인해 주세요." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_my_hobby", { p_name: name, p_category_id: categoryId });
  if (error) return toError(error);
  return { ok: true, id: data as number };
}

export async function updateHobby(id: number, name: string, categoryId: number): Promise<HobbyResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "다시 로그인해 주세요." };
  if (!validId(id) || typeof name !== "string" || !validCategory(categoryId)) {
    return { ok: false, error: "입력을 확인해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_my_hobby", { p_id: id, p_name: name, p_category_id: categoryId });
  if (error) return toError(error);
  return { ok: true, id };
}

// 기록이 연결된 취미는 보관 처리(기록은 그대로), 아니면 삭제
export async function deleteHobby(id: number): Promise<HobbyResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "다시 로그인해 주세요." };
  if (!validId(id)) return { ok: false, error: "입력을 확인해 주세요." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("delete_my_hobby", { p_id: id });
  if (error) return toError(error);
  return { ok: true, archived: data === "archived" };
}
