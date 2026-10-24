"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isUuid } from "@/lib/activities";
import { createClient } from "@/lib/supabase/server";

export type ActivityFormState = {
  values?: {
    activity_date: string;
    category_id: string;
    hobby_id: string;
    title: string;
    content: string;
  };
  fieldErrors?: Partial<
    Record<"activity_date" | "category_id" | "hobby_id" | "title" | "content", string>
  >;
  error?: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parse(formData: FormData) {
  const values = {
    activity_date: String(formData.get("activity_date") ?? ""),
    category_id: String(formData.get("category_id") ?? ""),
    hobby_id: String(formData.get("hobby_id") ?? ""),
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
  };
  const fieldErrors: NonNullable<ActivityFormState["fieldErrors"]> = {};
  const date = new Date(`${values.activity_date}T00:00:00Z`);
  if (!values.activity_date) fieldErrors.activity_date = "활동 날짜를 선택해 주세요.";
  else if (!DATE_PATTERN.test(values.activity_date) || Number.isNaN(date.getTime()))
    fieldErrors.activity_date = "올바른 날짜를 선택해 주세요.";
  if (!values.category_id) fieldErrors.category_id = "취미 분류를 선택해 주세요.";
  if (!values.hobby_id) fieldErrors.hobby_id = "세부 취미를 선택해 주세요.";
  else if (!/^\d+$/.test(values.hobby_id)) fieldErrors.hobby_id = "세부 취미를 다시 선택해 주세요.";
  if (!values.title.trim()) fieldErrors.title = "제목을 입력해 주세요.";
  else if (values.title.trim().length > 100) fieldErrors.title = "제목은 100자 이내로 입력해 주세요.";
  if (!values.content.trim()) fieldErrors.content = "활동 내용을 입력해 주세요.";
  return { values, fieldErrors };
}

const row = (v: NonNullable<ActivityFormState["values"]>) => ({
  activity_date: v.activity_date,
  hobby_id: Number(v.hobby_id),
  title: v.title.trim(),
  content: v.content.trim(),
});

export async function createActivity(
  _prev: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/activities/new");

  const { values, fieldErrors } = parse(formData);
  if (Object.keys(fieldErrors).length > 0) return { values, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .insert({ ...row(values), user_id: user.id })
    .select("id")
    .single();
  if (error || !data) return { values, error: "기록을 저장하지 못했어요. 다시 시도해 주세요." };

  redirect(`/activities/${data.id}`);
}

export async function updateActivity(
  _prev: ActivityFormState,
  formData: FormData,
): Promise<ActivityFormState> {
  const id = String(formData.get("id") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/activities/${id}/edit`);
  if (!isUuid(id)) return { error: "요청한 기록을 찾을 수 없어요." };

  const { values, fieldErrors } = parse(formData);
  if (Object.keys(fieldErrors).length > 0) return { values, fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .update(row(values))
    .eq("id", id)
    .select("id");
  if (error) return { values, error: "기록을 저장하지 못했어요. 다시 시도해 주세요." };
  if (!data || data.length === 0) return { values, error: "요청한 기록을 찾을 수 없어요." };

  redirect(`/activities/${id}`);
}

export async function deleteActivity(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/activities/${id}`);
  if (!isUuid(id)) redirect("/activities");

  const supabase = await createClient();
  const { error } = await supabase.from("activities").delete().eq("id", id);
  // 이미 삭제된 기록을 다시 지워도 같은 결과(멱등)로 처리한다.
  if (error) redirect(`/activities/${id}?error=delete`);

  redirect("/activities?deleted=1");
}
