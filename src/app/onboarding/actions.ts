"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { selected?: string[]; error?: string };

export async function saveHobbies(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/onboarding");

  const selected = formData.getAll("hobby_id").map(String);
  if (selected.some((v) => !/^\d+$/.test(v))) {
    return { selected, error: "선택한 취미를 다시 확인해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_my_hobbies", {
    hobby_ids: [...new Set(selected)].map(Number),
  });
  if (error) return { selected, error: "관심 취미를 저장하지 못했어요. 다시 시도해 주세요." };

  redirect("/mypage");
}
